
// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const fs = require("fs");
const crypto = require("crypto");
const { initConfig } = require("./config");

const app = express();

const PORT = process.env.PORT || 5001;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox"; // "live" in production

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO || "almadenvoices@gmail.com";
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`;

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
// Note: This will be initialized after config loads in startServer()
let emailTransporter = null;

function initializeEmailTransporter() {
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;

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
                        <li>Upcoming speech therapy sessions</li>
                        <li>Success stories from our community</li>
                        <li>Helpful speech therapy tips</li>
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
            studentFirstName,
            studentLastName,
            gradeLevel,
            parentName,
            email,
            phone,
            sessionType,
            additionalInfo
        } = req.body;

        // Validate required fields
        if (!studentFirstName || !studentLastName || !gradeLevel || !parentName || !email || !phone || !sessionType) {
            return res.status(400).json({ error: "Missing required fields" });
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
            'communication': 'Communication Skills'
        };

        const sessionLabel = sessionLabels[sessionType] || sessionType;

        // Path to registrations file
        const registrationsFile = path.join(__dirname, 'registrations.csv');

        // Create CSV header if file doesn't exist
        if (!fs.existsSync(registrationsFile)) {
            const header = 'Confirmation,Student First Name,Student Last Name,Grade,Parent Name,Email,Phone,Session Type,Additional Info,Registered At\n';
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

        // Add registration to CSV
        const newRegistration = [
            sanitize(confirmationNumber),
            sanitize(studentFirstName),
            sanitize(studentLastName),
            sanitize(gradeLevel),
            sanitize(parentName),
            sanitize(email),
            sanitize(phone),
            sanitize(sessionType),
            sanitize(additionalInfo || ''),
            sanitize(timestamp)
        ].join(',') + '\n';

        fs.appendFileSync(registrationsFile, newRegistration);

        // Send notification email to admin
        if (emailTransporter) {
            const adminEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563EB;">New Session Registration</h2>
                    <p><strong>Confirmation Number:</strong> ${confirmationNumber}</p>
                    <hr style="border: 1px solid #eee;" />

                    <h3 style="color: #333;">Student Information</h3>
                    <p><strong>Name:</strong> ${studentFirstName} ${studentLastName}</p>
                    <p><strong>Grade Level:</strong> ${gradeLevel}th Grade</p>
                    <p><strong>Session:</strong> ${sessionLabel}</p>

                    <h3 style="color: #333;">Parent/Guardian Information</h3>
                    <p><strong>Name:</strong> ${parentName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>

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
                replyTo: `"${parentName}" <${email}>`,
                to: EMAIL_TO,
                subject: `New Registration: ${studentFirstName} ${studentLastName} - ${sessionLabel} - ${confirmationNumber}`,
                html: adminEmailHtml
            });
        }

        // Send confirmation email to parent
        if (emailTransporter) {
            const parentEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563EB;">Registration Confirmed!</h2>
                    <p>Dear ${parentName},</p>
                    <p>Thank you for registering ${studentFirstName} for our <strong>${sessionLabel}</strong> program!</p>

                    <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0 0 10px;"><strong>Confirmation Number:</strong></p>
                        <p style="font-size: 24px; font-family: monospace; color: #2563EB; font-weight: bold; letter-spacing: 2px; margin: 0;">${confirmationNumber}</p>
                    </div>

                    <h3 style="color: #333;">Registration Details</h3>
                    <ul style="line-height: 1.8; color: #333;">
                        <li><strong>Student:</strong> ${studentFirstName} ${studentLastName}</li>
                        <li><strong>Grade:</strong> ${gradeLevel}th Grade</li>
                        <li><strong>Program:</strong> ${sessionLabel}</li>
                    </ul>

                    <h3 style="color: #333;">What's Next?</h3>
                    <p>Our team will review your registration and contact you within 2-3 business days with:</p>
                    <ul style="line-height: 1.8; color: #333;">
                        <li>Session schedule and location details</li>
                        <li>Materials needed for the program</li>
                        <li>Any additional forms required</li>
                    </ul>

                    <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:info@almadenvoices.org" style="color: #2563EB;">info@almadenvoices.org</a>.</p>

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

// Initialize configuration and start server
async function startServer() {
    try {
        // Load configuration
        await initConfig();

        // Initialize email transporter AFTER config is loaded
        initializeEmailTransporter();

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
