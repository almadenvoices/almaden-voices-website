
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
const storage = new Storage();

async function downloadRegistrationsFromGCS() {
    try {
        const registrationsFile = path.join(__dirname, 'registrations.csv');
        await storage.bucket(GCS_BUCKET).file(GCS_FILE).download({ destination: registrationsFile });
        console.log("Downloaded registrations.csv from GCS");
    } catch (err) {
        if (err.code === 404) {
            console.log("No registrations.csv in GCS yet — starting fresh");
        } else {
            console.error("Error downloading registrations from GCS:", err.message);
        }
    }
}

async function uploadRegistrationsToGCS() {
    try {
        const registrationsFile = path.join(__dirname, 'registrations.csv');
        await storage.bucket(GCS_BUCKET).upload(registrationsFile, { destination: GCS_FILE });
        console.log("Uploaded registrations.csv to GCS");
    } catch (err) {
        console.error("Error uploading registrations to GCS:", err.message);
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
app.use(express.json());

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

async function createOrder({ amount, frequency }) {
    const accessToken = await generateAccessToken();

    const body = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: amount.toFixed(2)
                },
                description:
                    frequency === "monthly"
                        ? "Monthly donation to Almaden Voices"
                        : "One-time donation to Almaden Voices"
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

// Newsletter subscription endpoint
app.post("/api/subscribe", async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: "Please provide a valid email address" });
        }

        // Normalize email (lowercase and trim)
        const normalizedEmail = email.toLowerCase().trim();

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

        // Add new subscriber to CSV
        const timestamp = new Date().toISOString();
        const newSubscriber = `${normalizedEmail},${timestamp}\n`;

        fs.appendFileSync(subscribersFile, newSubscriber);

        // Send notification email to admin
        if (emailTransporter) {
            const adminEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Newsletter Subscriber</h2>
                    <hr style="border: 1px solid #eee;" />
                    <p><strong>Email:</strong> ${normalizedEmail}</p>
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
                    <p>Thank you for subscribing to our newsletter.</p>
                    <p>You'll receive updates about:</p>
                    <ul style="line-height: 1.8; color: #333;">
                        <li>Upcoming speech and debate sessions</li>
                        <li>Success stories from our community</li>
                        <li>Helpful public speaking tips</li>
                        <li>Special events and volunteer opportunities</li>
                    </ul>
                    <hr style="border: 1px solid #eee;" />
                    <p style="color: #666;">Best regards,<br/>Almaden Voices Team</p>
                    <p style="color: #888; font-size: 0.85rem; margin-top: 20px;">
                        You can <a href="${unsubscribeUrl}" style="color: #9c27b0; text-decoration: none;">unsubscribe at any time</a>.
                    </p>
                </div>
            `;

            await emailTransporter.sendMail({
                from: `"Almaden Voices" <${EMAIL_USER}>`,
                to: normalizedEmail,
                subject: "Welcome to Almaden Voices Newsletter!",
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
            'av-workshop-april8-2026': 'Free Public Speaking Workshop (April 8 & 9, 2026)'
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

// Temporary debug endpoint — remove after fixing PayPal
app.get("/api/paypal/debug", async (req, res) => {
    const cfg = getPayPalConfig();
    const id = cfg.clientId || "(not set)";
    const secret = cfg.clientSecret || "(not set)";
    const info = {
        clientIdFirst10: id.substring(0, 10) + "...",
        secretFirst10: secret.substring(0, 10) + "...",
        clientIdLength: id.length,
        secretLength: secret.length,
        env: cfg.env,
        base: cfg.base
    };
    try {
        const token = await generateAccessToken();
        info.authTest = "SUCCESS — got access token";
    } catch (err) {
        info.authTest = "FAILED — " + err.message;
    }
    res.json(info);
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

        // Parse CSV fields helper
        const parseCSVLine = (line) => {
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
        };

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
            const amount = (captureDetails.amount && captureDetails.amount.value) || "0.00";
            const currency = (captureDetails.amount && captureDetails.amount.currency_code) || "USD";
            const transactionId = captureDetails.id || orderID;
            const description = purchaseUnit.description || "Donation to Almaden Voices";
            const donationDate = new Date().toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
            });

            if (emailTransporter) {
                // Receipt email to donor
                if (donorEmail) {
                    const donorEmailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #9c27b0;">Thank you for your donation!</h2>
                            <p>Hi ${donorFirstName || "there"},</p>
                            <p>Thank you for supporting Almaden Voices. Your generosity helps young students build confidence through public speaking. Below is your official donation receipt for your records.</p>
                            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #333;">Donation Receipt</h3>
                                <p><strong>Donor:</strong> ${donorName}</p>
                                <p><strong>Date:</strong> ${donationDate}</p>
                                <p><strong>Amount:</strong> $${Number(amount).toFixed(2)} ${currency}</p>
                                <p><strong>Description:</strong> ${description}</p>
                                <p><strong>Transaction ID:</strong> <span style="font-family: monospace;">${transactionId}</span></p>
                            </div>
                            <p style="font-size: 13px; color: #555;">
                                Almaden Voices is a registered 501(c)(3) nonprofit organization
                                (EIN: 39-4978818). Your donation is tax-deductible to the fullest
                                extent allowed by law. No goods or services were provided in exchange for this contribution.
                            </p>
                            <p>Please keep this receipt for your tax records.</p>
                            <hr style="border: 1px solid #eee;" />
                            <p style="color: #666;">With gratitude,<br/>The Almaden Voices Team</p>
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
                        <h2 style="color: #333;">New Donation Received</h2>
                        <hr style="border: 1px solid #eee;" />
                        <p><strong>Amount:</strong> $${Number(amount).toFixed(2)} ${currency}</p>
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
                    subject: `New Donation: $${Number(amount).toFixed(2)} from ${donorName}`,
                    html: adminEmailHtml
                });
            } else {
                console.warn("Email transporter not configured — donation receipts not sent");
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

        // Download persistent registrations from GCS
        await downloadRegistrationsFromGCS();

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
