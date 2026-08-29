
// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const fs = require("fs");
const crypto = require("crypto");
const { Storage } = require("@google-cloud/storage");
const { initConfig } = require("./config");

// Google Cloud Storage for persistent registration data
const GCS_BUCKET = "almaden-voices-data";
const GCS_FILE = "registrations.csv";
const COACHING_GCS_FILE = "coaching-bookings.csv";
const COACHING_WAITLIST_GCS_FILE = "coaching-waitlist.csv";
const storage = new Storage();

// Split one CSV line into fields, honouring double-quoted values.
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            fields.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    fields.push(current);
    return fields;
}

// Wrap a value for safe CSV output.
function csvCell(value) {
    return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
}

// Local paths for the two files we keep mirrored in GCS. The container disk is
// wiped on every deploy, so these are downloaded at boot and re-uploaded on
// every write.
const registrationsPath = () => path.join(__dirname, 'registrations.csv');
const coachingPath = () => path.join(__dirname, 'coaching-bookings.csv');
const coachingWaitlistPath = () => path.join(__dirname, 'coaching-waitlist.csv');

async function downloadFromGCS(gcsFile, destination, label) {
    try {
        await storage.bucket(GCS_BUCKET).file(gcsFile).download({ destination });
        console.log(`Downloaded ${gcsFile} from GCS`);
    } catch (err) {
        if (err.code === 404) {
            console.log(`No ${gcsFile} in GCS yet — starting fresh`);
        } else {
            console.error(`Error downloading ${label} from GCS:`, err.message);
        }
    }
}

async function uploadToGCS(localFile, gcsFile, label) {
    try {
        await storage.bucket(GCS_BUCKET).upload(localFile, { destination: gcsFile });
        console.log(`Uploaded ${gcsFile} to GCS`);
    } catch (err) {
        console.error(`Error uploading ${label} to GCS:`, err.message);
    }
}

async function downloadRegistrationsFromGCS() {
    await downloadFromGCS(GCS_FILE, registrationsPath(), "registrations");
}

async function uploadRegistrationsToGCS() {
    await uploadToGCS(registrationsPath(), GCS_FILE, "registrations");
}

async function downloadCoachingFromGCS() {
    await downloadFromGCS(COACHING_GCS_FILE, coachingPath(), "coaching bookings");
}

async function uploadCoachingToGCS() {
    await uploadToGCS(coachingPath(), COACHING_GCS_FILE, "coaching bookings");
}

// Pull the newest copy from GCS right before we append to it.
//
// Cloud Run runs several instances side by side, and each one keeps its own
// copy of these files on its own disk, then re-uploads the WHOLE file after a
// write. So an instance that booted before someone else's booking still holds
// the old file, and its next upload would wipe that booking out. Re-reading
// first narrows the danger window to the append itself instead of leaving it
// open for the whole life of the instance.
//
// Deliberately quiet: this runs on every write, and the success line from
// downloadFromGCS would bury the entries that actually matter in the log.
async function refreshFromGCS(gcsFile, destination, label) {
    try {
        await storage.bucket(GCS_BUCKET).file(gcsFile).download({ destination });
    } catch (err) {
        // 404 just means nothing has been written yet — the local file (or the
        // header we are about to write) is already correct.
        if (err.code !== 404) {
            console.error(`Error refreshing ${label} from GCS before write:`, err.message);
        }
    }
}

const refreshRegistrationsFromGCS = () =>
    refreshFromGCS(GCS_FILE, registrationsPath(), "registrations");

const refreshCoachingFromGCS = () =>
    refreshFromGCS(COACHING_GCS_FILE, coachingPath(), "coaching bookings");

const refreshCoachingWaitlistFromGCS = () =>
    refreshFromGCS(COACHING_WAITLIST_GCS_FILE, coachingWaitlistPath(), "coaching waitlist");

async function downloadCoachingWaitlistFromGCS() {
    await downloadFromGCS(COACHING_WAITLIST_GCS_FILE, coachingWaitlistPath(), "coaching waitlist");
}

async function uploadCoachingWaitlistToGCS() {
    await uploadToGCS(coachingWaitlistPath(), COACHING_WAITLIST_GCS_FILE, "coaching waitlist");
}

// ============================================================
// 1-ON-1 COACHING SLOTS
//
// TO CLOSE A SLOT BY HAND: change taken: false to taken: true below,
// then redeploy. Nothing else needs editing.
//
// A slot also closes on its own as soon as someone pays for it, so this
// flag is only for holding a slot back yourself.
//
// The slots are deliberately not tied to dates — they're numbered, and
// scheduling happens by email after booking. Prices live here on the
// server so the amount charged can't be altered by the browser.
// ============================================================
const COACHING_PRICES = { online: 25, inPerson: 30 };

const COACHING_SLOTS = [
    { id: 1, taken: false },
    { id: 2, taken: false },
    { id: 3, taken: false },
    { id: 4, taken: false },
    { id: 5, taken: false },
    // Second round, opened 26 August 2026 once the first five sold out. Slots
    // 1-5 stay listed and show as "Booked" — their families keep those numbers.
    { id: 6, taken: false },
    { id: 7, taken: false },
    { id: 8, taken: false },
    { id: 9, taken: false },
    { id: 10, taken: false },
];

// What the card, the CSV, and the emails call a slot.
const coachingSlotLabel = (id) => `Coaching Slot ${id}`;

// The browser sends the id as JSON, so accept "3" as well as 3.
const findCoachingSlot = (slotId) =>
    COACHING_SLOTS.find(s => String(s.id) === String(slotId));

const COACHING_WAITLIST_HEADERS = [
    "Timestamp", "Parent Name", "Email", "Phone", "Student Name", "Student Age",
    "Preferred Format", "School Name", "Home ZIP", "What They Want To Work On", "Contacted?"
];

const COACHING_HEADERS = [
    "Timestamp", "Slot ID", "Slot Label", "Format",
    "Amount Paid", "PayPal Order ID", "Parent Name", "Email", "Phone",
    "Student Name", "Student Age", "School Name", "Home ZIP", "Notes",
    "Questions/Comments", "Photo/Video Permission", "Press/Media Permission"
];

// The deployed Google Apps Script web app — the same one the registration and
// volunteer forms post to. It owns the Almaden Voices registration spreadsheet,
// so coaching bookings are sent here to land on their own tab beside the
// workshop registrations.
//
// Unlike those two forms, this POST is sent by the server rather than the
// browser: a coaching row should only ever exist for a payment PayPal has
// actually confirmed, and only the server knows that.
//
// If the script is ever redeployed and Google issues a new /exec URL, update it
// here and in client/src/data/appsScript.js.
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL ||
    "https://script.google.com/macros/s/AKfycbxrbVWSjMpAB4Ru1mm_DSywPdfFS3KfMMA07Ie_e1VbXGeW_ILtNQ-vE8rQrIYubjFI/exec";

// Add a booking to the Coaching Sessions tab. The payment is already captured
// and written to the CSV by the time this runs, so every failure path here is
// logged and swallowed — a spreadsheet problem must never surface to a parent
// who has just paid, and must never fail the request.
async function sendCoachingToSpreadsheet(booking) {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formType: "coaching", ...booking }),
            // The Apps Script is not on the critical path — don't let a slow or
            // hanging response hold up the parent's confirmation screen.
            signal: AbortSignal.timeout(15000)
        });
        const text = await response.text();
        if (!response.ok) {
            console.error("⚠️ Coaching booking not added to spreadsheet — order",
                booking.orderId, `HTTP ${response.status}`, text.slice(0, 300));
            return;
        }
        // The script answers with JSON, but an error inside Google (an expired
        // deployment, a permissions prompt) comes back as an HTML page with a
        // 200 — so a parse failure is itself the signal that something is off.
        let result;
        try {
            result = JSON.parse(text);
        } catch (parseErr) {
            console.error("⚠️ Coaching booking not added to spreadsheet — order",
                booking.orderId, "unexpected response:", text.slice(0, 300));
            return;
        }
        if (result.success) {
            console.log("Added coaching booking to spreadsheet —", booking.slotLabel);
        } else {
            console.error("⚠️ Coaching booking not added to spreadsheet — order",
                booking.orderId, result.error);
        }
    } catch (err) {
        console.error("⚠️ Coaching booking not added to spreadsheet — order",
            booking.orderId, err.message);
    }
}

// Same as sendCoachingToSpreadsheet, for the waitlist tab. Also swallows every
// failure — someone's place on the list is already saved by the time this runs.
async function sendCoachingWaitlistToSpreadsheet(entry) {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formType: "coaching-waitlist", ...entry }),
            signal: AbortSignal.timeout(15000)
        });
        const text = await response.text();
        let result = null;
        try { result = JSON.parse(text); } catch (parseErr) { /* an HTML error page */ }
        if (response.ok && result && result.success) {
            console.log("Added coaching waitlist signup to spreadsheet —", entry.parentEmail);
        } else {
            console.error("⚠️ Coaching waitlist signup not added to spreadsheet —",
                entry.parentEmail, (result && result.error) || text.slice(0, 200));
        }
    } catch (err) {
        console.error("⚠️ Coaching waitlist signup not added to spreadsheet —",
            entry.parentEmail, err.message);
    }
}

// Slot ids that already have a paid booking recorded.
function bookedCoachingSlotIds() {
    try {
        const file = coachingPath();
        if (!fs.existsSync(file)) return [];
        const lines = fs.readFileSync(file, 'utf-8').split('\n').filter(l => l.trim());
        if (lines.length < 2) return [];
        const idIndex = COACHING_HEADERS.indexOf("Slot ID");
        return lines.slice(1)
            .map(line => (parseCSVLine(line)[idIndex] || "").trim())
            .filter(Boolean);
    } catch (err) {
        console.error("Error reading coaching bookings:", err.message);
        return [];
    }
}

const app = express();

const PORT = process.env.PORT || 5001;

// Read PayPal config dynamically since env vars are loaded asynchronously by initConfig()
function getPayPalConfig() {
    const env = process.env.PAYPAL_ENV || "sandbox";
    return {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        env,
        base: env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
    };
}

// Email configuration
const EMAIL_TO = process.env.EMAIL_TO || "almadenvoices@gmail.com";
const BASE_URL = process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://almadenvoices.org' : `http://localhost:${process.env.PORT || 5001}`);

// ---------- middleware ----------

app.use(cors());
// Volunteer resumes arrive base64-encoded in the JSON body, so the default
// 100kb cap would reject them. The form itself stops anything over 4MB;
// base64 inflates that by about a third, and 8mb leaves room around it.
app.use(express.json({ limit: "8mb" }));

// ---------- PayPal helpers ----------

async function generateAccessToken() {
    const { clientId, clientSecret, base } = getPayPalConfig();
    if (!clientId || !clientSecret) {
        throw new Error("PayPal credentials not configured (PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET missing)");
    }
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("Error fetching PayPal access token:", text);
        throw new Error("Failed to generate PayPal access token: " + text);
    }

    const data = await response.json();
    return data.access_token;
}

async function createOrder({ amount, frequency, description }) {
    const accessToken = await generateAccessToken();

    const body = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: amount.toFixed(2)
                },
                // What the payer sees on the PayPal screen and their receipt.
                description: description || (
                    frequency === "monthly"
                        ? "Monthly donation to Almaden Voices"
                        : "One-time donation to Almaden Voices"
                )
            }
        ]
    };

    const { base } = getPayPalConfig();
    const response = await fetch(`${base}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("Error creating PayPal order:", text);
        throw new Error("Failed to create PayPal order: " + text);
    }

    return response.json();
}

async function captureOrder(orderID) {
    const accessToken = await generateAccessToken();
    const { base } = getPayPalConfig();

    const response = await fetch(
        `${base}/v2/checkout/orders/${orderID}/capture`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        const text = await response.text();
        console.error("Error capturing PayPal order:", text);
        throw new Error("Failed to capture PayPal order");
    }

    return response.json();
}

// ---------- Email transporter ----------
// Note: This will be initialized after config loads in startServer()
let emailTransporter = null;
let EMAIL_USER = null;
let EMAIL_PASS = null;

function initializeEmailTransporter() {
    EMAIL_USER = process.env.EMAIL_USER;
    EMAIL_PASS = process.env.EMAIL_PASS;

    if (EMAIL_USER && EMAIL_PASS) {
        emailTransporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        // Verify connection configuration
        emailTransporter.verify(function (error) {
            if (error) {
                console.error("❌ Email configuration error:", error.message);
                console.error("Please check your EMAIL_USER and EMAIL_PASS in .env file");
                console.error("Make sure you're using a Gmail App Password, not your regular password");
            } else {
                console.log("✅ Email server is ready to send messages");
            }
        });
    } else {
        console.warn("⚠️ Missing EMAIL_USER or EMAIL_PASS env vars. Contact form will fail until configured.");
    }
}

// Generate unique confirmation number
function generateConfirmationNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `AV-${timestamp}-${random}`;
}

// ---------------------------------------------------------------
// Branded email shell — the same card layout the Apps Script uses for
// registration confirmations (Playfair headings, DM Sans body, blue accent),
// so every email from Almaden Voices looks like it came from the same place.
// ---------------------------------------------------------------
const MAIL_FONT_HEADING = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MAIL_FONT_BODY = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MAIL_TEXT = "#111827";
const MAIL_MUTED = "#6B7280";
const MAIL_BODY = "#374151";
const MAIL_ACCENT = "#2563EB";
const MAIL_LINE = "#E5E7EB";
const MAIL_SOFT = "#F9FAFB";
const MAIL_ORG = "Almaden Voices";

function brandedEmail(headline, subhead, innerHtml) {
    return `
<style>@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@600;700&display=swap");</style>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MAIL_SOFT};margin:0;padding:24px 12px;font-family:${MAIL_FONT_BODY};">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid ${MAIL_LINE};border-radius:16px;overflow:hidden;">
      <tr><td style="background:${MAIL_ACCENT};padding:18px 28px 16px;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#BFDBFE;font-weight:700;">${MAIL_ORG}</p>
        <h1 style="margin:0;font-family:${MAIL_FONT_HEADING};font-size:21px;line-height:1.3;color:#FFFFFF;font-weight:700;">${headline}</h1>
        ${subhead ? `<p style="margin:5px 0 0;font-size:13px;line-height:1.45;color:#DBEAFE;">${subhead}</p>` : ""}
      </td></tr>
      <tr><td style="padding:32px;font-size:16px;line-height:1.65;color:${MAIL_BODY};">${innerHtml}</td></tr>
      <tr><td align="center" style="background:${MAIL_SOFT};border-top:1px solid ${MAIL_LINE};padding:24px 32px;font-size:13px;line-height:1.6;color:${MAIL_MUTED};text-align:center;">
        <p style="margin:0 0 4px;color:${MAIL_TEXT};font-weight:700;">${MAIL_ORG}</p>
        <p style="margin:0;">
          <a href="https://almadenvoices.org" style="color:${MAIL_ACCENT};text-decoration:none;">almadenvoices.org</a>
          &nbsp;&middot;&nbsp;
          <a href="mailto:almadenvoices@gmail.com" style="color:${MAIL_ACCENT};text-decoration:none;">almadenvoices@gmail.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>`;
}

// Small uppercase heading used inside an email card.
function mailSectionTitle(text) {
    return `<p style="margin:0 0 12px;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:${MAIL_MUTED};font-weight:700;">${text}</p>`;
}

// A label / value list rendered as a bordered card.
function mailDetailCard(title, rows) {
    const body = rows.filter(r => r && r[1]).map(([label, value], i) => `
      <tr><td style="padding:14px 0;${i ? `border-top:1px solid ${MAIL_LINE};` : ""}">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${MAIL_TEXT};">${label}</p>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${MAIL_BODY};">${value}</p>
      </td></tr>`).join("");

    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid ${MAIL_LINE};border-radius:12px;margin:0 0 24px;">
  <tr><td style="padding:18px 22px;">${mailSectionTitle(title)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}</table>
  </td></tr>
</table>`;
}

// Soft card for a longer free-text answer.
function mailQuoteCard(title, htmlText) {
    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MAIL_SOFT};border:1px solid ${MAIL_LINE};border-radius:12px;margin:0 0 16px;">
  <tr><td style="padding:18px 20px;">${mailSectionTitle(title)}
    <p style="margin:0;font-size:15px;line-height:1.65;color:${MAIL_BODY};">${htmlText}</p>
  </td></tr>
</table>`;
}

// Generate unsubscribe token
function generateUnsubscribeToken(email) {
    const secret = process.env.UNSUBSCRIBE_SECRET || 'almaden-voices-secret-key';
    return crypto.createHash('sha256').update(email + secret).digest('hex');
}

// Verify unsubscribe token
function verifyUnsubscribeToken(email, token) {
    const expectedToken = generateUnsubscribeToken(email);
    return token === expectedToken;
}

// ---------- API routes ----------

// health check (optional)
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Contact form endpoint
app.post("/api/contact", async (req, res) => {
    try {
        const { firstName, lastName, email, phone, country, message } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if email transporter is configured
        if (!emailTransporter) {
            console.error("Email transporter not configured");
            return res.status(500).json({ error: "Email service not configured" });
        }

        // Generate confirmation number
        const confirmationNumber = generateConfirmationNumber();

        // Email content for admin
        const adminEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">New Contact Form Submission</h2>
                <p><strong>Confirmation Number:</strong> ${confirmationNumber}</p>
                <hr style="border: 1px solid #eee;" />
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${country ? `(${country}) ` : ""}${phone || "Not provided"}</p>
                <p><strong>Message:</strong></p>
                <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
                <hr style="border: 1px solid #eee;" />
                <p style="color: #666; font-size: 12px;">Received: ${new Date().toLocaleString()}</p>
            </div>
        `;

        // Email content for customer
        const customerEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Thank you for contacting Almaden Voices!</h2>
                <p>Hi ${firstName},</p>
                <p>We've received your message and will get back to you within 24-48 hours.</p>
                <p><strong>Confirmation Number:</strong> <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-family: monospace;">${confirmationNumber}</span></p>
                <p>Please save this number for your records.</p>
                <hr style="border: 1px solid #eee;" />
                <p><strong>Your Message:</strong></p>
                <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
                <hr style="border: 1px solid #eee;" />
                <p style="color: #666;">Best regards,<br/>Almaden Voices Team</p>
            </div>
        `;

        // Send email to admin
        await emailTransporter.sendMail({
            from: `"Almaden Voices Contact Form" <${EMAIL_USER}>`,
            replyTo: `"${firstName} ${lastName}" <${email}>`, // Reply goes directly to customer
            to: EMAIL_TO,
            subject: `New Contact: ${firstName} ${lastName} - ${confirmationNumber}`,
            html: adminEmailHtml
        });

        // Send confirmation email to customer
        await emailTransporter.sendMail({
            from: `"Almaden Voices" <${EMAIL_USER}>`,
            to: email,
            subject: `Thank you for contacting Almaden Voices - ${confirmationNumber}`,
            html: customerEmailHtml
        });

        res.json({
            success: true,
            confirmationNumber,
            message: "Your message has been sent successfully!"
        });

    } catch (err) {
        console.error("Contact form error:", err);
        res.status(500).json({ error: "Error sending message. Please try again." });
    }
});

// Volunteer application endpoint — the FALLBACK path for the "Volunteer With
// Us" page. Applications normally go to the Google Apps Script, which also
// writes them to the volunteer spreadsheet; the page only posts here when
// Google can't be reached, so the application still lands in the inbox.
// Emails use the same branded layout as the Apps Script ones.
app.post("/api/volunteer", async (req, res) => {
    try {
        const {
            applyingAs, parentName, parentEmail, parentPhone,
            fullName, email, phone, ageOrGrade, location,
            resumeName, resumeType, resumeData,
            positions, why, availability,
            mediaConsent, guardianConsent,
        } = req.body;

        if (!fullName || !email || !phone || !ageOrGrade || !positions || !why || !availability) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (!mediaConsent) {
            return res.status(400).json({ error: "The photo and video consent box is required" });
        }

        if (!emailTransporter) {
            console.error("Email transporter not configured");
            return res.status(500).json({ error: "Email service not configured" });
        }

        // Applications land in an inbox as HTML, so escape anything typed in.
        const esc = (v) => String(v == null ? "" : v)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

        const appliedFor = applyingAs === "parent"
            ? "Parent/guardian applying on behalf of their child"
            : "Applying for themselves";

        // Line breaks the applicant typed should survive into the email.
        const escLines = (v) => esc(v).replace(/\r\n|\r|\n/g, "<br/>");

        const guardianLine = parentName || parentEmail || parentPhone
            ? esc(parentName) +
              (parentEmail ? ` &middot; ${esc(parentEmail)}` : "") +
              (parentPhone ? ` &middot; ${esc(parentPhone)}` : "")
            : "";

        const consentLine = `Photo/video: ${mediaConsent ? "Yes" : "No"}` +
            (guardianConsent === null || guardianConsent === undefined
                ? ""
                : ` &middot; Parent/guardian aware: ${guardianConsent ? "Yes" : "No"}`);

        const adminEmailHtml = brandedEmail(
            "New volunteer application",
            `${esc(fullName)}${positions ? ` &mdash; ${esc(positions)}` : ""}`,
            mailDetailCard("Applicant", [
                ["Applying for", esc(positions)],
                ["Who is applying", appliedFor],
                ["Email", esc(email)],
                ["Phone", esc(phone)],
                ["Age / grade", esc(ageOrGrade)],
                ["Location", esc(location)],
                ["Resume", resumeData ? esc(resumeName || "attached") + " (attached)" : "None"],
                ["Parent/guardian", guardianLine],
                ["Consent", consentLine],
                ["Received", new Date().toLocaleString()],
            ]) +
            mailQuoteCard("Why this role, and what they&apos;d bring", escLines(why)) +
            mailQuoteCard("Availability (2–3 hrs/week, 3-month minimum)", escLines(availability)) +
            `<p style="margin:24px 0 0;font-size:14px;color:${MAIL_MUTED};">Reply to this email to answer ${esc(fullName)} directly.</p>`
        );

        const firstName = String(fullName).trim().split(/\s+/)[0] || "there";
        const steps = [
            ["1. We review your application", "Applications close September 4 at 9 PM PT."],
            ["2. We get back to you", "We read every application ourselves. We&apos;ll be in touch the second week of September to let you know either way."],
            ["3. Getting started", "If it&apos;s a fit, we&apos;ll walk you through onboarding and pair you with someone on the team."],
        ].map(([title, body], i) => `
              <tr><td style="padding:14px 0;${i ? `border-top:1px solid ${MAIL_LINE};` : ""}">
                <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${MAIL_TEXT};">${title}</p>
                <p style="margin:0;font-size:15px;line-height:1.6;color:${MAIL_BODY};">${body}</p>
              </td></tr>`).join("");

        const applicantEmailHtml = brandedEmail(
            "Application received",
            esc(positions),
            `<p style="margin:0 0 16px;">Hi ${esc(firstName)},</p>` +
            `<p style="margin:0 0 24px;">Thank you for applying to volunteer with Almaden Voices. Your application is in, and nothing more is needed from you right now.</p>` +
            mailDetailCard("Your application", [
                ["Applying for", esc(positions)],
                ["Name", esc(fullName)],
                ["Email", esc(email)],
                ["Phone", esc(phone)],
                ["Age / grade", esc(ageOrGrade)],
            ]) +
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MAIL_SOFT};border:1px solid ${MAIL_LINE};border-radius:12px;margin:0 0 24px;">
              <tr><td style="padding:20px 22px;">${mailSectionTitle("What happens next")}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps}</table>
              </td></tr>
            </table>` +
            `<p style="margin:0 0 16px;">Every one of our volunteers helps a kid stand up and speak with confidence. We&apos;re glad you want to be part of that.</p>` +
            `<p style="margin:0;">Questions in the meantime? Just reply to this email.</p>`
        );

        await emailTransporter.sendMail({
            from: `"Almaden Voices Volunteer Form" <${EMAIL_USER}>`,
            replyTo: `"${fullName}" <${email}>`,
            to: EMAIL_TO,
            subject: `Volunteer Application: ${fullName} — ${positions}`,
            html: adminEmailHtml,
            ...(resumeData ? {
                attachments: [{
                    filename: resumeName || "resume",
                    content: Buffer.from(resumeData, "base64"),
                    contentType: resumeType || "application/octet-stream",
                }]
            } : {})
        });

        // A bad applicant address shouldn't lose us the application itself.
        try {
            await emailTransporter.sendMail({
                from: `"Almaden Voices" <${EMAIL_USER}>`,
                to: email,
                subject: "We got your volunteer application",
                html: applicantEmailHtml
            });
        } catch (receiptErr) {
            console.error("Volunteer receipt email failed:", receiptErr.message);
        }

        res.json({ success: true });

    } catch (err) {
        console.error("Volunteer form error:", err);
        res.status(500).json({ error: "Error sending your application. Please try again." });
    }
});

// Newsletter subscription endpoint
app.post("/api/subscribe", async (req, res) => {
    try {
        const { email, name, phone, childName, childGrade, schoolName, zipCode, interest } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: "Please provide a valid email address" });
        }

        // Normalize email (lowercase and trim)
        const normalizedEmail = email.toLowerCase().trim();

        // Optional fields (sanitize commas so they don't break the CSV)
        const subscriberName = (name || "").toString().trim().replace(/,/g, " ");
        const subscriberPhone = (phone || "").toString().trim().replace(/,/g, " ");
        const subscriberChildName = (childName || "").toString().trim().replace(/,/g, " ");
        const subscriberChildGrade = (childGrade || "").toString().trim().replace(/,/g, " ");
        const subscriberSchool = (schoolName || "").toString().trim().replace(/,/g, " ");
        const subscriberZip = (zipCode || "").toString().trim().replace(/,/g, " ");
        const subscriberInterest = (interest || "Newsletter").toString().trim().replace(/,/g, " ");

        // Path to subscribers file
        const subscribersFile = path.join(__dirname, 'subscribers.csv');

        // Check if email already exists
        let existingSubscribers = [];
        if (fs.existsSync(subscribersFile)) {
            const fileContent = fs.readFileSync(subscribersFile, 'utf-8');
            existingSubscribers = fileContent.split('\n').filter(line => line.trim());

            // Check if already subscribed
            const emailExists = existingSubscribers.some(line => {
                const parts = line.split(',');
                return parts[0] && parts[0].toLowerCase().trim() === normalizedEmail;
            });

            if (emailExists) {
                return res.json({
                    success: true,
                    message: "You're already subscribed to our newsletter!"
                });
            }
        }

        // Add new subscriber to CSV. School and ZIP are appended after the
        // timestamp so every column that already existed keeps its position.
        // Order: email,name,phone,childName,childGrade,interest,timestamp,schoolName,zipCode
        const timestamp = new Date().toISOString();
        const newSubscriber = `${normalizedEmail},${subscriberName},${subscriberPhone},${subscriberChildName},${subscriberChildGrade},${subscriberInterest},${timestamp},${subscriberSchool},${subscriberZip}\n`;

        fs.appendFileSync(subscribersFile, newSubscriber);

        // Send notification email to admin
        if (emailTransporter) {
            const adminEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Newsletter Subscriber</h2>
                    <hr style="border: 1px solid #eee;" />
                    ${subscriberName ? `<p><strong>Name:</strong> ${subscriberName}</p>` : ''}
                    <p><strong>Email:</strong> ${normalizedEmail}</p>
                    ${subscriberPhone ? `<p><strong>Phone:</strong> ${subscriberPhone}</p>` : ''}
                    ${subscriberChildName ? `<p><strong>Child's Name:</strong> ${subscriberChildName}</p>` : ''}
                    ${subscriberChildGrade ? `<p><strong>Child's Grade:</strong> ${subscriberChildGrade}</p>` : ''}
                    ${subscriberSchool ? `<p><strong>School:</strong> ${subscriberSchool}</p>` : ''}
                    ${subscriberZip ? `<p><strong>Home ZIP:</strong> ${subscriberZip}</p>` : ''}
                    <p><strong>Interested In:</strong> ${subscriberInterest}</p>
                    <p><strong>Subscribed At:</strong> ${new Date().toLocaleString()}</p>
                    <hr style="border: 1px solid #eee;" />
                    <p style="color: #666; font-size: 12px;">Total subscribers: ${existingSubscribers.length + 1}</p>
                </div>
            `;

            await emailTransporter.sendMail({
                from: `"Almaden Voices Newsletter" <${EMAIL_USER}>`,
                to: EMAIL_TO,
                subject: `New Newsletter Subscriber: ${normalizedEmail}`,
                html: adminEmailHtml
            });
        }

        // Send welcome email to subscriber
        if (emailTransporter) {
            const unsubscribeToken = generateUnsubscribeToken(normalizedEmail);
            const unsubscribeUrl = `${BASE_URL}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&token=${unsubscribeToken}`;

            const welcomeEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #9c27b0;">Welcome to Almaden Voices!</h2>
                    <p style="color: #9c27b0; font-size: 0.95rem; margin-top: -8px;"><em>¡Bienvenido a Almaden Voices!</em></p>
                    <p>${subscriberName ? `Hi ${subscriberName}, thank you` : 'Thank you'} for joining our mailing list${subscriberInterest && subscriberInterest !== 'Newsletter' ? ` and your interest in our ${subscriberInterest}` : ''}.</p>
                    <p style="color: #666;"><em>${subscriberName ? `Hola ${subscriberName}, gracias` : 'Gracias'} por unirse a nuestra lista de contactos${subscriberInterest && subscriberInterest !== 'Newsletter' ? ` y por su interés en nuestro taller de oratoria` : ''}.</em></p>
                    <p>We'll be in touch as soon as we have details to share.</p>
                    <p style="color: #666;"><em>Nos pondremos en contacto con usted tan pronto como tengamos más información.</em></p>
                    <p>You'll receive updates about:</p>
                    <p style="color: #666;"><em>Recibirá información sobre:</em></p>
                    <ul style="line-height: 1.8; color: #333;">
                        <li>Upcoming speech and debate sessions <span style="color:#888;"><em>/ Próximas sesiones de oratoria y debate</em></span></li>
                        <li>Success stories from our community <span style="color:#888;"><em>/ Historias de éxito de nuestra comunidad</em></span></li>
                        <li>Helpful public speaking tips <span style="color:#888;"><em>/ Consejos útiles para hablar en público</em></span></li>
                        <li>Special events and volunteer opportunities <span style="color:#888;"><em>/ Eventos especiales y oportunidades de voluntariado</em></span></li>
                    </ul>
                    <hr style="border: 1px solid #eee;" />
                    <p style="color: #666;">Best regards, / Atentamente,<br/>Almaden Voices Team</p>
                    <p style="color: #888; font-size: 0.85rem; margin-top: 20px;">
                        You can <a href="${unsubscribeUrl}" style="color: #9c27b0; text-decoration: none;">unsubscribe at any time</a>.
                        <br/><em>Puede <a href="${unsubscribeUrl}" style="color: #9c27b0; text-decoration: none;">darse de baja en cualquier momento</a>.</em>
                    </p>
                </div>
            `;

            await emailTransporter.sendMail({
                from: `"Almaden Voices" <${EMAIL_USER}>`,
                to: normalizedEmail,
                subject: "Welcome to Almaden Voices! / ¡Bienvenido a Almaden Voices!",
                html: welcomeEmailHtml
            });
        }

        res.json({
            success: true,
            message: "Thank you for subscribing! Check your email for confirmation."
        });

    } catch (err) {
        console.error("Subscribe error:", err);
        res.status(500).json({ error: "Error processing subscription. Please try again." });
    }
});

// Session registration endpoint
app.post("/api/register", async (req, res) => {
    try {
        const {
            students,
            parentFirstName,
            parentLastName,
            email,
            phone,
            sessionType,
            streetAddress,
            city,
            state,
            zipCode,
            additionalInfo
        } = req.body;

        // Validate required fields
        if (!students || !Array.isArray(students) || students.length === 0 || !parentFirstName || !parentLastName || !email || !phone || !sessionType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (students.length > 5) {
            return res.status(400).json({ error: "Maximum 5 children per registration" });
        }

        // Validate each student
        for (const st of students) {
            if (!st.firstName || !st.lastName || !st.gradeLevel) {
                return res.status(400).json({ error: "Each child must have a first name, last name, and grade level" });
            }
        }

        // Reject if parent name matches any student name (common data-entry mistake)
        const normalizeName = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
        const parentFullName = `${normalizeName(parentFirstName)} ${normalizeName(parentLastName)}`;
        const conflictingStudent = students.find(st =>
            `${normalizeName(st.firstName)} ${normalizeName(st.lastName)}` === parentFullName
        );
        if (conflictingStudent) {
            return res.status(400).json({ error: "Parent/guardian name cannot be the same as the child's name. Please enter the parent's actual name." });
        }

        // Pick up any rows another instance wrote since we booted, so both the
        // duplicate check below and the append further down work off the
        // current file rather than a stale copy.
        await refreshRegistrationsFromGCS();

        // Duplicate prevention: reject if this email already registered
        // the same student(s) for the same session
        const existingFile = path.join(__dirname, 'registrations.csv');
        if (fs.existsSync(existingFile)) {
            const existingContent = fs.readFileSync(existingFile, 'utf-8');
            const existingLines = existingContent.split('\n').filter(l => l.trim()).slice(1);
            const normalizedEmail = (email || '').trim().toLowerCase();
            const parseCSV = (line) => {
                const fields = [];
                let cur = '', inQ = false;
                for (let i = 0; i < line.length; i++) {
                    const c = line[i];
                    if (c === '"') inQ = !inQ;
                    else if (c === ',' && !inQ) { fields.push(cur); cur = ''; }
                    else cur += c;
                }
                fields.push(cur);
                return fields;
            };
            for (const line of existingLines) {
                const f = parseCSV(line);
                // columns: Confirmation,FN,LN,Grade,PFN,PLN,Email,Phone,Session...
                const existingEmail = (f[6] || '').trim().toLowerCase();
                const existingSession = (f[8] || '').trim();
                const existingFirst = (f[1] || '').trim().toLowerCase();
                if (existingEmail === normalizedEmail && existingSession === sessionType) {
                    for (const st of students) {
                        if ((st.firstName || '').trim().toLowerCase() === existingFirst) {
                            return res.status(409).json({
                                error: `${st.firstName} is already registered for this workshop under this email. If you need to make changes, please contact us at almadenvoices@gmail.com.`
                            });
                        }
                    }
                }
            }
        }

        // Generate confirmation number
        const confirmationNumber = generateConfirmationNumber();
        const timestamp = new Date().toISOString();

        // Session type labels
        const sessionLabels = {
            'public-speaking': 'Public Speaking',
            'debate': 'Debate',
            'leadership': 'Leadership Workshop',
            'storytelling': 'Storytelling',
            'communication': 'Communication Skills',
            'av-workshop-march24-2026': 'Free Public Speaking Workshop (March 24 & 25, 2026)',
            'av-workshop-april8-2026': 'Free Public Speaking Workshop (April 8 & 9, 2026)',
            'nj-workshop-aug-2026': 'New Jersey Public Speaking Workshop (August 29 & 30, 2026)'
        };

        const sessionLabel = sessionLabels[sessionType] || sessionType;

        // Grade suffix helper
        const gradeSuffix = (g) => {
            const n = parseInt(g);
            if (n === 1) return '1st';
            if (n === 2) return '2nd';
            if (n === 3) return '3rd';
            return `${n}th`;
        };

        // Path to registrations file
        const registrationsFile = path.join(__dirname, 'registrations.csv');

        // Create CSV header if file doesn't exist
        if (!fs.existsSync(registrationsFile)) {
            const header = 'Confirmation,Student First Name,Student Last Name,Grade,Parent First Name,Parent Last Name,Email,Phone,Session Type,Street Address,City,State,ZIP,Additional Info,Registered At\n';
            fs.writeFileSync(registrationsFile, header);
        }

        // Sanitize CSV fields (escape commas and quotes)
        const sanitize = (str) => {
            if (!str) return '';
            str = str.toString().replace(/"/g, '""');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str}"`;
            }
            return str;
        };

        // Add one CSV row per student (each counts as one seat)
        for (const st of students) {
            const row = [
                sanitize(confirmationNumber),
                sanitize(st.firstName),
                sanitize(st.lastName),
                sanitize(st.gradeLevel),
                sanitize(parentFirstName),
                sanitize(parentLastName),
                sanitize(email),
                sanitize(phone),
                sanitize(sessionType),
                sanitize(streetAddress || ''),
                sanitize(city || ''),
                sanitize(state || ''),
                sanitize(zipCode || ''),
                sanitize(additionalInfo || ''),
                sanitize(timestamp)
            ].join(',') + '\n';
            fs.appendFileSync(registrationsFile, row);
        }

        // Persist to GCS so counts survive deploys
        uploadRegistrationsToGCS().catch(err => console.error("GCS upload failed:", err.message));

        // Build student list for emails
        const studentListHtml = students.map(st =>
            `<li><strong>${st.firstName} ${st.lastName}</strong> — ${gradeSuffix(st.gradeLevel)} Grade</li>`
        ).join('');
        const studentNames = students.map(st => `${st.firstName} ${st.lastName}`).join(', ');
        const childWord = students.length === 1 ? 'child' : `${students.length} children`;

        // Send notification email to admin
        if (emailTransporter) {
            const adminEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563EB;">New Session Registration (${childWord})</h2>
                    <p><strong>Confirmation Number:</strong> ${confirmationNumber}</p>
                    <hr style="border: 1px solid #eee;" />

                    <h3 style="color: #333;">Student${students.length > 1 ? 's' : ''} Registered</h3>
                    <ul style="line-height: 1.8;">${studentListHtml}</ul>
                    <p><strong>Session:</strong> ${sessionLabel}</p>

                    <h3 style="color: #333;">Parent/Guardian Information</h3>
                    <p><strong>Name:</strong> ${parentFirstName} ${parentLastName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>

                    ${streetAddress ? `
                    <h3 style="color: #333;">Mailing Address</h3>
                    <p>${streetAddress}<br/>${city}, ${state} ${zipCode}</p>
                    ` : ''}

                    ${additionalInfo ? `
                    <h3 style="color: #333;">Additional Information</h3>
                    <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${additionalInfo}</p>
                    ` : ''}

                    <hr style="border: 1px solid #eee;" />
                    <p style="color: #666; font-size: 12px;">Registered: ${new Date().toLocaleString()}</p>
                </div>
            `;

            await emailTransporter.sendMail({
                from: `"Almaden Voices Registrations" <${EMAIL_USER}>`,
                replyTo: `"${parentFirstName} ${parentLastName}" <${email}>`,
                to: EMAIL_TO,
                subject: `New Registration (${childWord}): ${studentNames} - ${sessionLabel} - ${confirmationNumber}`,
                html: adminEmailHtml
            });
        }

        // Send confirmation email to parent
        if (emailTransporter) {
            const parentEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563EB;">Registration Confirmed!</h2>
                    <p>Dear ${parentFirstName} ${parentLastName},</p>
                    <p>Thank you for registering ${students.length === 1 ? students[0].firstName : 'your children'} for our <strong>${sessionLabel}</strong>! ${students.length === 1 ? 'Your spot is' : 'Your spots are'} confirmed.</p>

                    <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0 0 10px;"><strong>Confirmation Number:</strong></p>
                        <p style="font-size: 24px; font-family: monospace; color: #2563EB; font-weight: bold; letter-spacing: 2px; margin: 0;">${confirmationNumber}</p>
                    </div>

                    <h3 style="color: #333;">Registration Details</h3>
                    <ul style="line-height: 1.8; color: #333;">
                        ${studentListHtml}
                    </ul>
                    <p style="color: #333;"><strong>Program:</strong> ${sessionLabel}</p>

                    <h3 style="color: #333;">Workshop Details</h3>
                    <ul style="line-height: 1.8; color: #333;">
                        <li><strong>When:</strong> Wednesday, April 8th & Thursday, April 9th, 2026</li>
                        <li><strong>Time:</strong> 1:00 – 4:00 PM (3 hours each day)</li>
                        <li><strong>Where:</strong> Almaden Library Community Center, 6445 Camden Ave, San Jose, CA 95120</li>
                    </ul>
                    <p style="color: #333;">Students are welcome to attend one or both sessions, but attending both is highly recommended for the best experience. At the end, your child will showcase their skills in a final speech!</p>

                    <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:almadenvoices@gmail.com" style="color: #2563EB;">almadenvoices@gmail.com</a>.</p>

                    <hr style="border: 1px solid #eee;" />
                    <p style="color: #666;">Best regards,<br/>Almaden Voices Team</p>
                </div>
            `;

            await emailTransporter.sendMail({
                from: `"Almaden Voices" <${EMAIL_USER}>`,
                to: email,
                subject: `Registration Confirmed: ${sessionLabel} - ${confirmationNumber}`,
                html: parentEmailHtml
            });
        }

        res.json({
            success: true,
            confirmationNumber,
            studentCount: students.length,
            message: "Registration submitted successfully!"
        });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Error processing registration. Please try again." });
    }
});

// Unsubscribe endpoint
app.get("/unsubscribe", async (req, res) => {
    try {
        const { email, token } = req.query;

        if (!email || !token) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid Request - Almaden Voices</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                        .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                        h1 { color: #f44336; }
                        p { color: #666; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Invalid Request</h1>
                        <p>The unsubscribe link appears to be invalid or incomplete.</p>
                        <p>Please use the link from your welcome email or contact us for assistance.</p>
                    </div>
                </body>
                </html>
            `);
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Verify token
        if (!verifyUnsubscribeToken(normalizedEmail, token)) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid Token - Almaden Voices</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                        .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                        h1 { color: #f44336; }
                        p { color: #666; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🔒 Security Verification Failed</h1>
                        <p>The unsubscribe link is invalid or has expired.</p>
                        <p>Please use the most recent link from your email or contact us for assistance.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // Path to subscribers file
        const subscribersFile = path.join(__dirname, 'subscribers.csv');

        // Check if file exists
        if (!fs.existsSync(subscribersFile)) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Not Found - Almaden Voices</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                        .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                        h1 { color: #9c27b0; }
                        p { color: #666; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>✓ Already Unsubscribed</h1>
                        <p>You are not currently subscribed to our newsletter.</p>
                        <p>If you'd like to subscribe again, please visit our website.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // Read subscribers file
        const fileContent = fs.readFileSync(subscribersFile, 'utf-8');
        const subscribers = fileContent.split('\n').filter(line => line.trim());

        // Check if email exists
        const emailExists = subscribers.some(line => {
            const parts = line.split(',');
            return parts[0] && parts[0].toLowerCase().trim() === normalizedEmail;
        });

        if (!emailExists) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Not Subscribed - Almaden Voices</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                        .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                        h1 { color: #9c27b0; }
                        p { color: #666; line-height: 1.6; }
                        a { color: #9c27b0; text-decoration: none; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>✓ Already Unsubscribed</h1>
                        <p>This email address is not in our subscriber list.</p>
                        <p>You won't receive any further newsletters from us.</p>
                        <p style="margin-top: 30px;"><a href="/">← Return to Homepage</a></p>
                    </div>
                </body>
                </html>
            `);
        }

        // Remove subscriber from list
        const updatedSubscribers = subscribers.filter(line => {
            const parts = line.split(',');
            return parts[0] && parts[0].toLowerCase().trim() !== normalizedEmail;
        });

        // Write updated list back to file
        fs.writeFileSync(subscribersFile, updatedSubscribers.join('\n') + '\n');

        // Send notification to admin
        if (emailTransporter) {
            const adminEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Newsletter Unsubscribe</h2>
                    <hr style="border: 1px solid #eee;" />
                    <p><strong>Email:</strong> ${normalizedEmail}</p>
                    <p><strong>Unsubscribed At:</strong> ${new Date().toLocaleString()}</p>
                    <hr style="border: 1px solid #eee;" />
                    <p style="color: #666; font-size: 12px;">Remaining subscribers: ${updatedSubscribers.length}</p>
                </div>
            `;

            await emailTransporter.sendMail({
                from: `"Almaden Voices Newsletter" <${EMAIL_USER}>`,
                to: EMAIL_TO,
                subject: `Newsletter Unsubscribe: ${normalizedEmail}`,
                html: adminEmailHtml
            });
        }

        // Show success page
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Unsubscribed - Almaden Voices</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 20px;
                        margin: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 50px auto;
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        text-align: center;
                    }
                    h1 { color: #9c27b0; margin-bottom: 20px; }
                    p { color: #666; line-height: 1.8; margin-bottom: 15px; }
                    .emoji { font-size: 4rem; margin-bottom: 20px; }
                    a {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 30px;
                        background: #9c27b0;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: 600;
                        transition: background 0.3s;
                    }
                    a:hover { background: #7b1fa2; }
                    .feedback {
                        margin-top: 30px;
                        padding: 20px;
                        background: #f5f5f5;
                        border-radius: 5px;
                    }
                    .feedback p {
                        font-size: 0.9rem;
                        color: #888;
                        margin: 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="emoji">👋</div>
                    <h1>Successfully Unsubscribed</h1>
                    <p>You have been removed from our newsletter mailing list.</p>
                    <p>We're sorry to see you go! You will no longer receive updates from Almaden Voices.</p>

                    <div class="feedback">
                        <p><strong>We'd love your feedback!</strong></p>
                        <p>If you have a moment, please let us know why you unsubscribed by replying to our welcome email.</p>
                    </div>

                    <p style="margin-top: 30px;">You can always resubscribe by visiting our website.</p>
                    <a href="/">Return to Homepage</a>
                </div>
            </body>
            </html>
        `);

    } catch (err) {
        console.error("Unsubscribe error:", err);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error - Almaden Voices</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                    .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                    h1 { color: #f44336; }
                    p { color: #666; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>⚠️ Error</h1>
                    <p>An error occurred while processing your unsubscribe request.</p>
                    <p>Please try again later or contact us for assistance.</p>
                </div>
            </body>
            </html>
        `);
    }
});

// Get enrollment counts per session from registrations.csv
app.get("/api/sessions/enrollment", (req, res) => {
    try {
        const registrationsFile = path.join(__dirname, 'registrations.csv');

        if (!fs.existsSync(registrationsFile)) {
            return res.json({});
        }

        const fileContent = fs.readFileSync(registrationsFile, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return res.json({});
        }

        // Detect session type column from header
        const headerFields = parseCSVLine(lines[0]);
        const sessionColIndex = headerFields.findIndex(h => h.trim().toLowerCase() === 'session type');

        if (sessionColIndex === -1) {
            return res.json({});
        }

        // Skip header row
        const dataLines = lines.slice(1);

        // Count registrations per session
        const counts = {};
        for (const line of dataLines) {
            const fields = parseCSVLine(line);
            const sessionId = (fields[sessionColIndex] || '').trim();
            if (sessionId) {
                counts[sessionId] = (counts[sessionId] || 0) + 1;
            }
        }

        res.json(counts);
    } catch (err) {
        console.error("Enrollment count error:", err);
        res.status(500).json({ error: "Error fetching enrollment data" });
    }
});

// ---------- 1-on-1 coaching ----------

// The slot list plus which ones are already taken. Prices come from the server
// so the browser can't change what gets charged.
app.get("/api/coaching/slots", async (req, res) => {
    // Availability has to be right across every running instance, otherwise a
    // parent is shown a free slot that someone else already paid for and their
    // payment is rejected at the last moment.
    await refreshCoachingFromGCS();
    const paid = bookedCoachingSlotIds().map(String);
    res.json({
        prices: COACHING_PRICES,
        slots: COACHING_SLOTS.map(slot => ({
            id: slot.id,
            label: coachingSlotLabel(slot.id),
            booked: slot.taken || paid.includes(String(slot.id))
        }))
    });
});

// Create a PayPal order for one slot. The slot must exist and still be free.
app.post("/api/coaching/orders", async (req, res) => {
    try {
        const { slotId, format } = req.body;

        const slot = findCoachingSlot(slotId);
        if (!slot) return res.status(400).json({ error: "That slot is no longer offered." });
        if (format !== "online" && format !== "inPerson") {
            return res.status(400).json({ error: "Choose online or in person." });
        }
        // Check against the newest booking list, not this instance's copy.
        await refreshCoachingFromGCS();
        if (slot.taken || bookedCoachingSlotIds().map(String).includes(String(slotId))) {
            // The code lets the browser tell this apart from a genuine failure
            // and send the parent to a different slot instead of just retrying.
            return res.status(409).json({
                code: "SLOT_TAKEN",
                error: `${coachingSlotLabel(slot.id)} was just booked by someone else.`
            });
        }

        const amount = COACHING_PRICES[format];
        const order = await createOrder({
            amount,
            description: `1-on-1 coaching (${format === "inPerson" ? "in person" : "online"}) — ${coachingSlotLabel(slot.id)}`
        });
        res.json({ id: order.id });
    } catch (err) {
        console.error("Coaching order error:", err);
        res.status(500).json({ error: "Error creating order: " + err.message });
    }
});

// Capture payment, then record the booking. Kept separate from the donation
// capture route so coaching payments never get a donation receipt.
app.post("/api/coaching/orders/:orderID/capture", async (req, res) => {
    try {
        const { orderID } = req.params;
        const { slotId, format, parentName, email, phone, studentName, studentAge,
                schoolName, zipCode, notes, comments, photoConsent, pressConsent } = req.body;

        const slot = findCoachingSlot(slotId);
        if (!slot) return res.status(400).json({ error: "That slot is no longer offered." });

        const capture = await captureOrder(orderID);
        const amount = COACHING_PRICES[format] || 0;
        const formatLabel = format === "inPerson" ? "In person" : "Online";

        // Record the booking. This happens after a successful capture, so a
        // failure here must not lose the payment — log loudly and still return
        // success to the browser.
        const bookedAt = new Date();
        try {
            // Another instance may have taken a booking since we booted, and our
            // upload replaces the whole file — so start from the newest copy.
            await refreshCoachingFromGCS();

            const file = coachingPath();
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, COACHING_HEADERS.map(csvCell).join(",") + "\n");
            }
            const row = [
                bookedAt.toISOString(), slot.id, coachingSlotLabel(slot.id),
                formatLabel, amount, orderID, parentName, email, phone,
                studentName, studentAge, schoolName, zipCode, notes, comments,
                photoConsent ? "Yes" : "No", pressConsent ? "Yes" : "No"
            ].map(csvCell).join(",") + "\n";
            fs.appendFileSync(file, row);
            // Awaited, not fire-and-forget: the very next parent's availability
            // check reads this file back out of GCS.
            await uploadCoachingToGCS();
        } catch (writeErr) {
            console.error("⚠️ PAID BUT NOT RECORDED — order", orderID, writeErr.message);
        }

        // Mirror the booking onto the Coaching Sessions tab of the registration
        // spreadsheet, so coaching sits alongside the workshops. Never let a
        // problem here fail the request — the payment has already gone through
        // and the CSV above is the record that matters.
        await sendCoachingToSpreadsheet({
            timestamp: bookedAt.toISOString(),
            slotId: slot.id,
            slotLabel: coachingSlotLabel(slot.id),
            format: formatLabel,
            amountPaid: amount,
            orderId: orderID,
            parentName,
            // Deliberately NOT called "email". If the site is ever deployed
            // before the Apps Script is updated, the old script falls through
            // to its registration path — and with no top-level "email" it
            // throws before it can send a bogus confirmation to the family.
            parentEmail: email,
            phone, studentName, studentAge,
            schoolName, zipCode, notes, comments,
            photoConsent: Boolean(photoConsent)
        });

        // Confirmation to the family + a copy to the admin.
        try {
            if (emailTransporter) {
                await emailTransporter.sendMail({
                    from: `"Almaden Voices" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `Your 1-on-1 coaching session — ${coachingSlotLabel(slot.id)}`,
                    html: `
                        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827; line-height: 1.6;">
                            <h2 style="margin: 0 0 16px;">You&rsquo;re booked!</h2>
                            <p style="margin: 0 0 20px;">Hi ${parentName || "there"}, thanks for booking a 1-on-1 coaching session with Almaden Voices. Here&rsquo;s what you paid for:</p>
                            <table style="width: 100%; border-collapse: collapse; background: #F9FAFB; border-radius: 12px;">
                                <tr><td style="padding: 12px 16px; color: #6B7280;">Student</td><td style="padding: 12px 16px; font-weight: 600; text-align: right;">${studentName || ""}</td></tr>
                                <tr><td style="padding: 12px 16px; color: #6B7280;">Slot</td><td style="padding: 12px 16px; font-weight: 600; text-align: right;">${coachingSlotLabel(slot.id)}</td></tr>
                                <tr><td style="padding: 12px 16px; color: #6B7280;">Format</td><td style="padding: 12px 16px; font-weight: 600; text-align: right;">${formatLabel}</td></tr>
                                <tr><td style="padding: 12px 16px; color: #6B7280;">Paid</td><td style="padding: 12px 16px; font-weight: 600; text-align: right;">$${amount}.00 USD</td></tr>
                            </table>
                            <p style="margin: 20px 0 0;"><strong>Next step:</strong> I&rsquo;ll email you within two business days to schedule your session. Please reply to that email to confirm your time — your session isn&rsquo;t scheduled until you do.</p>
                            <p style="margin: 16px 0 0;">${format === "inPerson"
                                ? "We'll send the meeting location once we've agreed on a time."
                                : "We'll send the join link once we've agreed on a time."}</p>
                            <p style="margin: 24px 0 0; font-size: 13px; color: #6B7280;">Every dollar goes straight back into running our free workshops. This is a payment for coaching, not a tax-deductible donation.</p>
                        </div>`
                });
                // A separate email to the admin, exactly like every other form
                // on the site. This used to be a BCC on the message above, but
                // Gmail drops a BCC addressed to the account that sent it — the
                // copy only ever reached the Sent folder, never the inbox.
                await emailTransporter.sendMail({
                    from: `"Almaden Voices Coaching" <${EMAIL_USER}>`,
                    replyTo: `"${parentName || "Parent"}" <${email}>`,
                    to: EMAIL_TO,
                    subject: `New coaching booking: ${studentName || "student"} — ${coachingSlotLabel(slot.id)} (${formatLabel})`,
                    html: `
                        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827; line-height: 1.6;">
                            <h2 style="margin: 0 0 16px;">New 1-on-1 coaching booking</h2>
                            <table style="width: 100%; border-collapse: collapse; background: #F9FAFB; border-radius: 12px;">
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Slot</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${coachingSlotLabel(slot.id)}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Format</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${formatLabel}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Paid</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">$${amount}.00 USD</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Student</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${studentName || ""}${studentAge ? `, age ${studentAge}` : ""}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Parent</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${parentName || ""}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Email</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${email || ""}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Phone</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${phone || ""}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">School</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${schoolName || "—"}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Home ZIP</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${zipCode || "—"}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Photo/video permission</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${photoConsent ? "Yes" : "No"}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">PayPal order</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${orderID}</td></tr>
                            </table>
                            <p style="margin: 20px 0 4px; font-weight: 600;">What they want to work on</p>
                            <p style="margin: 0; white-space: pre-wrap;">${notes || "—"}</p>
                            <p style="margin: 20px 0 4px; font-weight: 600;">Anything else they told us</p>
                            <p style="margin: 0; white-space: pre-wrap;">${comments || "—"}</p>
                            <p style="margin: 24px 0 0; font-size: 13px; color: #6B7280;">Reply to this email to reach the parent directly. Remember to email them within two business days to schedule.</p>
                        </div>`
                });
            } else {
                console.warn("Email transporter not configured, coaching confirmation not sent");
            }
        } catch (emailErr) {
            console.error("Coaching email error:", emailErr);
        }

        res.json(capture);
    } catch (err) {
        console.error("Coaching capture error:", err);
        res.status(500).json({ error: "Error capturing order" });
    }
});

// Join the waitlist for the next round of coaching. No payment involved — this
// is just a list of families to contact when slots reopen.
app.post("/api/coaching/waitlist", async (req, res) => {
    try {
        const { parentName, email, phone, studentName, studentAge,
                preferredFormat, schoolName, zipCode, notes } = req.body;

        const required = { parentName, email, phone, studentName, studentAge, preferredFormat };
        const missing = Object.keys(required).filter(k => !String(required[k] || "").trim());
        if (missing.length) {
            return res.status(400).json({ error: "Please fill in every required field." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
            return res.status(400).json({ error: "Please enter a valid email address." });
        }

        if (preferredFormat !== "online" && preferredFormat !== "inPerson") {
            return res.status(400).json({ error: "Choose online or in person." });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const formatLabel = preferredFormat === "inPerson" ? "In person" : "Online";

        // Refresh first: our upload replaces the whole file, so we must start
        // from whatever another instance has already written.
        await refreshCoachingWaitlistFromGCS();

        const file = coachingWaitlistPath();
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, COACHING_WAITLIST_HEADERS.map(csvCell).join(",") + "\n");
        }

        // Someone signing up twice should not appear twice on the list.
        const existing = fs.readFileSync(file, "utf-8").split("\n").filter(l => l.trim());
        const emailIndex = COACHING_WAITLIST_HEADERS.indexOf("Email");
        const already = existing.slice(1)
            .some(line => (parseCSVLine(line)[emailIndex] || "").trim().toLowerCase() === cleanEmail);
        if (already) {
            return res.json({ success: true, alreadyOn: true });
        }

        const joinedAt = new Date();
        fs.appendFileSync(file, [
            joinedAt.toISOString(), parentName, cleanEmail, phone, studentName, studentAge,
            formatLabel, schoolName, zipCode, notes, ""
        ].map(csvCell).join(",") + "\n");
        await uploadCoachingWaitlistToGCS();

        // Onto the Coaching Waitlist tab, beside the bookings.
        await sendCoachingWaitlistToSpreadsheet({
            timestamp: joinedAt.toISOString(),
            parentName, parentEmail: cleanEmail, phone, studentName, studentAge,
            preferredFormat: formatLabel, schoolName, zipCode, notes
        });

        // Tell the admin, and confirm to the family. Neither failing should
        // lose someone's place on the list, so both are logged and swallowed.
        try {
            if (emailTransporter) {
                await emailTransporter.sendMail({
                    from: `"Almaden Voices Coaching" <${EMAIL_USER}>`,
                    replyTo: `"${parentName}" <${cleanEmail}>`,
                    to: EMAIL_TO,
                    subject: `Coaching waitlist: ${String(studentName).trim()} (${formatLabel})`,
                    html: `
                        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827; line-height: 1.6;">
                            <h2 style="margin: 0 0 16px;">New coaching waitlist signup</h2>
                            <table style="width: 100%; border-collapse: collapse; background: #F9FAFB; border-radius: 12px;">
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Student</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${studentName}${studentAge ? `, age ${studentAge}` : ""}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Prefers</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${formatLabel}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Parent</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${parentName}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Email</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${cleanEmail}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Phone</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${phone}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">School</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${schoolName || "—"}</td></tr>
                                <tr><td style="padding: 10px 16px; color: #6B7280;">Home ZIP</td><td style="padding: 10px 16px; font-weight: 600; text-align: right;">${zipCode || "—"}</td></tr>
                            </table>
                            <p style="margin: 20px 0 4px; font-weight: 600;">What they'd like to work on</p>
                            <p style="margin: 0; white-space: pre-wrap;">${notes || "—"}</p>
                            <p style="margin: 24px 0 0; font-size: 13px; color: #6B7280;">Reply to this email to reach the parent directly.</p>
                        </div>`
                });

                await emailTransporter.sendMail({
                    from: `"Almaden Voices" <${EMAIL_USER}>`,
                    to: cleanEmail,
                    subject: "You're on the coaching waitlist",
                    html: `
                        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827; line-height: 1.6;">
                            <h2 style="margin: 0 0 16px;">You&rsquo;re on the list</h2>
                            <p style="margin: 0 0 16px;">Hi ${parentName || "there"}, thanks for your interest in 1-on-1 coaching for ${String(studentName).trim() || "your student"}. Our current slots are full, so we&rsquo;ve added you to the waitlist.</p>
                            <p style="margin: 0 0 16px;">We&rsquo;ll email you as soon as the next round opens, before the slots go on the website. There&rsquo;s nothing to pay and nothing else to do for now.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Questions? Just reply to this email.</p>
                        </div>`
                });
            }
        } catch (emailErr) {
            console.error("Coaching waitlist email error:", emailErr);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Coaching waitlist error:", err);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

app.post("/api/paypal/orders", async (req, res) => {
    try {
        const { amount, frequency } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const order = await createOrder({
            amount: Number(amount),
            frequency: frequency || "once"
        });

        res.json({ id: order.id });
    } catch (err) {
        console.error("Create order error:", err);
        res.status(500).json({ error: "Error creating order: " + err.message });
    }
});

app.post("/api/paypal/orders/:orderID/capture", async (req, res) => {
    try {
        const { orderID } = req.params;
        const capture = await captureOrder(orderID);

        // Extract donor + payment info from PayPal capture response
        try {
            const payer = capture.payer || {};
            const donorEmail = payer.email_address || "";
            const donorFirstName = (payer.name && payer.name.given_name) || "";
            const donorLastName = (payer.name && payer.name.surname) || "";
            const donorName = `${donorFirstName} ${donorLastName}`.trim() || "Anonymous Donor";

            const purchaseUnit = (capture.purchase_units && capture.purchase_units[0]) || {};
            const captureDetails = (purchaseUnit.payments && purchaseUnit.payments.captures && purchaseUnit.payments.captures[0]) || {};
            const currency = (captureDetails.amount && captureDetails.amount.currency_code) || "USD";
            const transactionId = captureDetails.id || orderID;
            const description = purchaseUnit.description || "Donation to Almaden Voices";
            const donationDate = new Date().toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
            });

            // Pull authoritative breakdown from PayPal: what the donor paid,
            // PayPal's fee, and what Almaden Voices actually receives.
            const breakdown = captureDetails.seller_receivable_breakdown || {};
            const grossPaid = Number((breakdown.gross_amount && breakdown.gross_amount.value) || (captureDetails.amount && captureDetails.amount.value) || 0);
            const paypalFee = Number((breakdown.paypal_fee && breakdown.paypal_fee.value) || 0);
            const netReceived = Number((breakdown.net_amount && breakdown.net_amount.value) || (grossPaid - paypalFee));

            if (emailTransporter) {
                // Receipt email to donor
                if (donorEmail) {
                    const donorEmailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9FAFB; padding: 0; border-radius: 12px; overflow: hidden;">
                            <div style="background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); padding: 36px 28px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">Thank You for Your Donation!</h1>
                                <p style="color: #DBEAFE; margin: 0; font-size: 15px;">Your generosity is empowering young voices.</p>
                            </div>
                            <div style="background-color: #ffffff; padding: 32px 28px;">
                                <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi ${donorFirstName || "there"},</p>
                                <p style="font-size: 15px; color: #374151; line-height: 1.6;">
                                    Thank you for supporting Almaden Voices. Your gift helps students overcome stage fright, learn to speak clearly, and build lifelong confidence through our public speaking program. Below is your official donation receipt for your records.
                                </p>
                                <div style="background: #F3F6FF; border-left: 4px solid #2563EB; padding: 22px 24px; border-radius: 8px; margin: 24px 0;">
                                    <h3 style="margin: 0 0 16px 0; color: #1E40AF; font-size: 18px;">Donation Receipt</h3>
                                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                                        <tr><td style="padding: 6px 0; color: #6B7280;">Donor</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${donorName}</td></tr>
                                        <tr><td style="padding: 6px 0; color: #6B7280;">Date</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${donationDate}</td></tr>
                                        <tr><td style="padding: 6px 0; color: #6B7280;">Description</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${description}</td></tr>
                                        <tr><td style="padding: 6px 0; color: #6B7280;">Transaction ID</td><td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 12px;">${transactionId}</td></tr>
                                        <tr><td colspan="2" style="padding-top: 12px;"><div style="border-top: 1px solid #C7D2FE;"></div></td></tr>
                                        <tr><td style="padding: 8px 0 4px 0; color: #6B7280;">Total amount paid</td><td style="padding: 8px 0 4px 0; text-align: right; font-weight: 700; color: #2563EB; font-size: 16px;">$${grossPaid.toFixed(2)} ${currency}</td></tr>
                                        <tr><td style="padding: 4px 0; color: #6B7280;">PayPal processing fee</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">- $${paypalFee.toFixed(2)} ${currency}</td></tr>
                                        <tr><td style="padding: 4px 0; color: #1E40AF; font-weight: 700;">Net to Almaden Voices</td><td style="padding: 4px 0; text-align: right; font-weight: 700; color: #1E40AF;">$${netReceived.toFixed(2)} ${currency}</td></tr>
                                    </table>
                                </div>
                                <div style="background: #EFF6FF; padding: 16px 18px; border-radius: 8px; margin: 20px 0;">
                                    <p style="font-size: 13px; color: #1E3A8A; margin: 0; line-height: 1.6;">
                                        <strong>Tax Information:</strong> Almaden Voices is a registered 501(c)(3) nonprofit organization (EIN: 39-4978818). Your donation is tax-deductible to the fullest extent allowed by law. No goods or services were provided in exchange for this contribution. Please keep this receipt for your tax records.
                                    </p>
                                </div>
                                <p style="font-size: 15px; color: #374151; margin-top: 24px;">With gratitude,<br/><strong style="color: #2563EB;">The Almaden Voices Team</strong></p>
                            </div>
                            <div style="background-color: #1E3A8A; padding: 28px; text-align: center; color: #ffffff;">
                                <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 16px; letter-spacing: 1px; text-transform: uppercase;">Stay Connected</h3>
                                <p style="margin: 6px 0; font-size: 14px; color: #DBEAFE;">
                                    Website: <a href="https://almadenvoices.org" style="color: #93C5FD; text-decoration: none; font-weight: 600;">almadenvoices.org</a>
                                </p>
                                <p style="margin: 6px 0; font-size: 14px; color: #DBEAFE;">
                                    Email: <a href="mailto:almadenvoices@gmail.com" style="color: #93C5FD; text-decoration: none; font-weight: 600;">almadenvoices@gmail.com</a>
                                </p>
                                <p style="margin: 16px 0 0 0; font-size: 12px; color: #93C5FD;">
                                    Almaden Voices is a 501(c)(3) nonprofit (EIN: 39-4978818) based in San Jose, CA.
                                </p>
                            </div>
                        </div>
                    `;

                    await emailTransporter.sendMail({
                        from: `"Almaden Voices" <${EMAIL_USER}>`,
                        to: donorEmail,
                        subject: `Thank you for your donation - Receipt #${transactionId}`,
                        html: donorEmailHtml
                    });
                }

                // Notification email to admin
                const adminEmailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1E40AF;">New Donation Received</h2>
                        <hr style="border: 1px solid #eee;" />
                        <div style="background: #F3F6FF; border-left: 4px solid #2563EB; padding: 18px 22px; border-radius: 8px; margin: 16px 0;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                                <tr><td style="padding: 6px 0; color: #6B7280;">Donor charged (gross)</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">$${grossPaid.toFixed(2)} ${currency}</td></tr>
                                <tr><td style="padding: 6px 0; color: #6B7280;">PayPal fee</td><td style="padding: 6px 0; text-align: right; font-weight: 600; color: #B91C1C;">- $${paypalFee.toFixed(2)} ${currency}</td></tr>
                                <tr><td style="padding: 8px 0 6px 0; color: #1E40AF; font-weight: 700; border-top: 1px solid #C7D2FE;">Net received by Almaden Voices</td><td style="padding: 8px 0 6px 0; text-align: right; font-weight: 700; color: #1E40AF; font-size: 16px; border-top: 1px solid #C7D2FE;">$${netReceived.toFixed(2)} ${currency}</td></tr>
                            </table>
                        </div>
                        <p><strong>Donor:</strong> ${donorName}</p>
                        <p><strong>Email:</strong> ${donorEmail || "Not provided"}</p>
                        <p><strong>Description:</strong> ${description}</p>
                        <p><strong>Transaction ID:</strong> ${transactionId}</p>
                        <p><strong>Order ID:</strong> ${orderID}</p>
                        <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                `;

                await emailTransporter.sendMail({
                    from: `"Almaden Voices Donations" <${EMAIL_USER}>`,
                    replyTo: donorEmail || EMAIL_USER,
                    to: EMAIL_TO,
                    subject: `New Donation: $${netReceived.toFixed(2)} net from ${donorName}`,
                    html: adminEmailHtml
                });
            } else {
                console.warn("Email transporter not configured, donation receipts not sent");
            }
        } catch (emailErr) {
            // Don't fail the payment response if email fails
            console.error("Donation email error:", emailErr);
        }

        res.json(capture);
    } catch (err) {
        console.error("Capture order error:", err);
        res.status(500).json({ error: "Error capturing order" });
    }
});

// ---------- static React build ----------

// Path to React build
const CLIENT_BUILD_PATH = path.join(__dirname, "client", "build");

// Serve static files from React app
app.use(express.static(CLIENT_BUILD_PATH));

// For any non-API route, send React index.html
app.get("*", (req, res) => {
    // If the path starts with /api, let Express handle 404
    if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "Not found" });
    }

    res.sendFile(path.join(CLIENT_BUILD_PATH, "index.html"));
});

// Initialize configuration and start server
async function startServer() {
    try {
        // Load configuration
        await initConfig();

        // Initialize email transporter AFTER config is loaded
        initializeEmailTransporter();

        // Download persistent registrations + coaching bookings from GCS
        await downloadRegistrationsFromGCS();
        await downloadCoachingFromGCS();
        await downloadCoachingWaitlistFromGCS();

        // Start the server
        app.listen(PORT, () => {
            console.log(`✅ Server listening on http://localhost:${PORT}`);
            console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
            console.log(`💳 PayPal environment: ${process.env.PAYPAL_ENV || 'sandbox'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
