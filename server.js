// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 4000;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox"; // "live" in production

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.warn(
        "⚠️  Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET env vars. PayPal routes will fail until configured."
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

// ---------- API routes ----------

// health check (optional)
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
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
