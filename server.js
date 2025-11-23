// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 4000;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox"; // "live" in production

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO || "almadenvoices@gmail.com";

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.warn(
        "⚠️ Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET env vars. PayPal routes will fail until configured."
    );
}

const PAYPAL_BASE =
    PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

// ---------- middleware ----------

app.use(cors());
app.use(express.json());

// ---------- PayPal helpers ----------

async function generateAccessToken() {
    const auth = Buffer.from(
        `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
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
        throw new Error("Failed to generate PayPal access token");
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

    const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
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
        throw new Error("Failed to create PayPal order");
    }

    return response.json();
}

async function captureOrder(orderID) {
    const accessToken = await generateAccessToken();

    const response = await fetch(
        `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
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

let emailTransporter = null;
if (EMAIL_USER && EMAIL_PASS) {
    emailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
} else {
    console.warn("⚠️ Missing EMAIL_USER or EMAIL_PASS env vars. Contact form will fail until configured.");
}

// Generate unique confirmation number
function generateConfirmationNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `AV-${timestamp}-${random}`;
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
        res.status(500).json({ error: "Error creating order" });
    }
});

app.post("/api/paypal/orders/:orderID/capture", async (req, res) => {
    try {
        const { orderID } = req.params;
        const capture = await captureOrder(orderID);
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

app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
});
