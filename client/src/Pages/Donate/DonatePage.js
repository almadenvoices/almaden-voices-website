import React, { useEffect, useMemo, useState } from "react";
import s from "./Donate.module.css";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AppleIcon from "@mui/icons-material/Apple";
import GoogleIcon from "@mui/icons-material/Google";
import ShieldIcon from "@mui/icons-material/Shield";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SendIcon from "@mui/icons-material/Send";

function DonatePage1() {
    // amount + frequency
    const [amount, setAmount] = useState(50);
    const [custom, setCustom] = useState("");
    const [freq, setFreq] = useState("once"); // 'once' | 'monthly'
    // payment method
    const METHODS = [
        { id: "card", label: "Credit/Debit Card", icon: <CreditCardIcon /> },
        { id: "paypal", label: "PayPal", icon: <AccountBalanceWalletIcon /> },
        { id: "apple", label: "Apple Pay", icon: <AppleIcon /> },
        { id: "google", label: "Google Pay", icon: <GoogleIcon /> },
        { id: "zelle", label: "Zelle", icon: <LocalAtmIcon /> },
        { id: "check", label: "Check", icon: <AttachMoneyIcon /> }
    ];
    const [method, setMethod] = useState("paypal");
    const displayAmount = useMemo(() => {
        const v = Number(custom || amount);
        return isFinite(v) && v > 0 ? v : 0;
    }, [amount, custom]);

    const handlePreset = (val) => {
        setCustom("");
        setAmount(val);
    };

    const onCustomChange = (e) => {
        // keep only digits/decimal
        const raw = e.target.value.replace(/[^\d.]/g, "");
        setCustom(raw);
    };

    const labelPay =
        method === "paypal"
            ? "Donate with PayPal"
            : method === "card"
                ? "Donate with Card"
                : method === "apple"
                    ? "Donate with Apple Pay"
                    : method === "google"
                        ? "Donate with Google Pay"
                        : method === "zelle"
                            ? "Donate via Zelle"
                            : "Give by Check";

    function submitDonation(e) {
        e.preventDefault();
        const cents = Math.round(displayAmount * 100);
        if (!cents) return;

        // ---- Integration notes (replace these cases when you wire real payments) ----
        switch (method) {
            case "paypal":
                // Example: place your PayPal hosted button id here
                // window.location.href = "https://www.paypal.com/donate?hosted_button_id=YOUR_ID";
                alert(
                    `[Demo] Redirect to PayPal\nAmount: $${displayAmount} (${freq}).`
                );
                break;
            case "card":
            case "apple":
            case "google":
                // Use Stripe Checkout/Payment Request button here
                alert(
                    `[Demo] Open Stripe Checkout (${labelPay}).\nAmount: $${displayAmount} (${freq}).`
                );
                break;
            case "zelle":
                alert(
                    `[Demo] Show Zelle QR/handle info (e.g., donations@almadenvoices.org).\nAmount: $${displayAmount} (${freq}).`
                );
                break;
            case "check":
                alert(
                    `[Demo] Show mailing address/instructions for checks.\nAmount: $${displayAmount} (${freq}).`
                );
                break;
            default:
                break;
        }
    }

    return (
        <main className={s.page}>
            {/* HERO */}
            <section className={s.hero}>
                <div className="container">
                    <div className={s.heroWrap}>
                        <div className={s.heroText}>
                            <h1 className={s.title}>
                                Fuel a child’s <span className={s.highlight}>voice</span>.
                            </h1>
                            <p className={s.sub}>
                                Your gift helps students overcome stage fright, learn to speak
                                clearly, and build lifelong confidence through our four-week
                                public speaking program in Almaden Valley.
                            </p>
                            <ul className={s.bullets}>
                                <li>
                                    <VerifiedIcon /> Tax-deductible · CA 501(c)(3) nonprofit
                                </li>
                                <li>
                                    <ShieldIcon /> Secure payments (SSL & industry-standard
                                    processors)
                                </li>
                            </ul>
                        </div>

                        <form className={s.giveCard} onSubmit={submitDonation}>
                            <header className={s.giveHead}>
                                <VolunteerActivismIcon />
                                <span>Make a Donation</span>
                            </header>

                            {/* frequency */}
                            <div className={s.freq}>
                                <button
                                    type="button"
                                    className={`${s.freqBtn} ${freq === "once" ? s.active : ""}`}
                                    onClick={() => setFreq("once")}
                                >
                                    One-time
                                </button>
                                <button
                                    type="button"
                                    className={`${s.freqBtn} ${freq === "monthly" ? s.active : ""}`}
                                    onClick={() => setFreq("monthly")}
                                >
                                    Monthly
                                    <span className={s.pill}>Most impact</span>
                                </button>
                            </div>

                            {/* presets */}
                            <div className={s.presetWrap}>
                                {[25, 50, 100, 250, 500].map((v) => (
                                    <button
                                        type="button"
                                        key={v}
                                        className={`${s.preset} ${
                                            !custom && amount === v ? s.active : ""
                                        }`}
                                        onClick={() => handlePreset(v)}
                                    >
                                        ${v}
                                    </button>
                                ))}
                                <div className={s.customBox}>
                                    <span>$</span>
                                    <input
                                        inputMode="decimal"
                                        placeholder="Other"
                                        value={custom}
                                        onChange={onCustomChange}
                                        aria-label="Custom amount"
                                    />
                                </div>
                            </div>

                            {/* summary */}
                            <div className={s.summary}>
                                <span>Donation</span>
                                <strong>
                                    {displayAmount ? `$${displayAmount}` : "$0"}{" "}
                                    <em>/{freq === "monthly" ? "month" : "once"}</em>
                                </strong>
                            </div>

                            {/* payment methods */}
                            <div className={s.methods}>
                                {METHODS.map((m) => (
                                    <button
                                        type="button"
                                        key={m.id}
                                        className={`${s.method} ${
                                            method === m.id ? s.methodActive : ""
                                        }`}
                                        onClick={() => setMethod(m.id)}
                                        aria-pressed={method === m.id}
                                    >
                                        <span className={s.mIcon}>{m.icon}</span>
                                        <span>{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* donor options */}
                            <div className={s.options}>
                                <label className={s.chk}>
                                    <input type="checkbox" /> Give anonymously
                                </label>
                                <label className={s.chk}>
                                    <input type="checkbox" /> This gift is in honor of someone
                                </label>
                                <textarea
                                    className={s.note}
                                    rows="3"
                                    placeholder="Add an optional note or dedication…"
                                />
                            </div>

                            <button
                                type="submit"
                                className={s.payBtn}
                                disabled={!displayAmount}
                            >
                                <span>{labelPay}</span>
                                <SendIcon fontSize="small" />
                            </button>

                            <p className={s.legal}>
                                Almaden Voices is a California 501(c)(3) nonprofit. Contributions
                                are tax-deductible to the extent allowed by law. You’ll receive
                                an email receipt for your records.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* IMPACT STRIP */}
            <section className={s.impact}>
                <div className="container">
                    <ul className={s.impactGrid}>
                        <li>
                            <strong>$50</strong>
                            <span>Provides materials for a student</span>
                        </li>
                        <li>
                            <strong>$100</strong>
                            <span>Funds a full session for one student</span>
                        </li>
                        <li>
                            <strong>$250</strong>
                            <span>Supports a small showcase event</span>
                        </li>
                        <li>
                            <strong>$500</strong>
                            <span>Scholarship for a low-income student</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* OTHER WAYS */}
            <section className={s.otherWays}>
                <div className="container">
                    <h2>Other Ways to Give</h2>
                    <div className={s.cards}>
                        <div className={s.card}>
                            <h3>Employer Match</h3>
                            <p>
                                Many companies match charitable gifts. Ask your employer about
                                matching contributions to “Almaden Voices”.
                            </p>
                        </div>
                        <div className={s.card}>
                            <h3>Check by Mail</h3>
                            <p>
                                Make checks payable to <strong>Almaden Voices</strong> and mail
                                to: PO Box 1234, San Jose, CA 95120.
                            </p>
                        </div>
                        <div className={s.card}>
                            <h3>In-Kind Support</h3>
                            <p>
                                We also welcome equipment, event space, and professional
                                services. <a href="/contact">Contact us</a> to discuss.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ MINI */}
            <section className={s.faqMini}>
                <div className="container">
                    <h2>Donation Questions</h2>
                    <div className={s.faqList}>
                        <details>
                            <summary>Will I get a receipt for tax purposes?</summary>
                            <p>
                                Yes. You’ll receive an emailed receipt immediately after your
                                donation is processed.
                            </p>
                        </details>
                        <details>
                            <summary>Can I cancel a monthly donation?</summary>
                            <p>
                                Absolutely. You can cancel anytime—just reply to your receipt or{" "}
                                <a href="/contact">contact us</a>.
                            </p>
                        </details>
                        <details>
                            <summary>Is my payment information secure?</summary>
                            <p>
                                We use industry-standard processors (PayPal/Stripe) and never
                                store card details on our servers.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* HELP CTA */}
            <section className={s.help}>
                <div className="container">
                    <div className={s.helpBox}>
                        <div>
                            <h3>Need help with your donation?</h3>
                            <p>
                                We’re happy to assist with receipts, matching gifts, or other
                                questions.
                            </p>
                        </div>
                        <a className={s.helpBtn} href="/contact">
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}

/**
 * ====== CONFIG – UPDATE THESE ======
 */

// For local dev (backend on port 4000):
const API_BASE_URL = "http://localhost:5000";

// Use your real PayPal CLIENT ID (same as backend env)
const PAYPAL_CLIENT_ID = "Ae6F40G7NNDTFDTJt57-bGBewNA_Gc9eBYUQVDlgeBHjY14q8HyCBVe7739I2zZ9STIykDc6NSctXudt";

/**
 * Dynamically load PayPal JS SDK script
 */
function usePayPalScript() {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (window.paypal) {
            setLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
        script.async = true;
        script.onload = () => {
            if (window.paypal) setLoaded(true);
            else setError("PayPal SDK failed to load.");
        };
        script.onerror = () => setError("PayPal SDK failed to load.");
        document.body.appendChild(script);

        return () => {
            // optional: do nothing; PayPal script can stay cached
        };
    }, []);

    return { loaded, error };
}

export default function DonatePage() {
    // amount + frequency
    const [amount, setAmount] = useState(50);
    const [custom, setCustom] = useState("");
    const [freq, setFreq] = useState("once"); // 'once' | 'monthly'

    // UI: how donor *thinks* they’ll pay; PayPal handles wallet vs card internally
    const METHODS = [
        { id: "paypal", label: "PayPal", icon: <AccountBalanceWalletIcon /> },
        {
            id: "card",
            label: "Visa / Mastercard",
            icon: <CreditCardIcon />
        },
        {
            id: "apple",
            label: "Apple Pay*",
            icon: <AppleIcon />
        },
        {
            id: "google",
            label: "Google Pay*",
            icon: <GoogleIcon />
        },
        { id: "zelle", label: "Zelle", icon: <LocalAtmIcon /> },
        { id: "check", label: "Check", icon: <AttachMoneyIcon /> }
    ];

    const [method, setMethod] = useState("paypal");
    const [processing, setProcessing] = useState(false);
    const [paypalStatus, setPaypalStatus] = useState("");

    const { loaded: paypalLoaded, error: paypalError } = usePayPalScript();

    const displayAmount = useMemo(() => {
        const v = Number(custom || amount);
        return isFinite(v) && v > 0 ? v : 0;
    }, [amount, custom]);

    const handlePreset = (val) => {
        setCustom("");
        setAmount(val);
    };

    const onCustomChange = (e) => {
        const raw = e.target.value.replace(/[^\d.]/g, "");
        setCustom(raw);
    };

    /**
     * Renders PayPal buttons whenever:
     *  - the SDK is loaded
     *  - the selected online method is PayPal / card / apple / google
     *  - the amount or frequency changes
     *
     * NOTE: The *actual* funding source (wallet vs card) is chosen
     * inside the PayPal window; this is still all on PayPal rails.
     */
    useEffect(() => {
        const isOnline =
            method === "paypal" || method === "card" || method === "apple" || method === "google";

        if (!paypalLoaded || !isOnline || !displayAmount) return;
        if (!window.paypal) return;

        // Clear previous buttons
        const container = document.getElementById("paypal-buttons-container");
        if (!container) return;
        container.innerHTML = "";

        const fundingHint =
            method === "card"
                ? window.paypal.FUNDING.CARD
                : window.paypal.FUNDING.PAYPAL; // let PayPal decide wallet/cards/pay later etc.

        setPaypalStatus("");

        window.paypal
            .Buttons({
                style: {
                    layout: "vertical",
                    shape: "rect",
                    color: "gold",
                    label: "paypal"
                },

                // Keep track of chosen funding source (PayPal, card, etc.)
                onClick: (data) => {
                    // data.fundingSource e.g. paypal.FUNDING.PAYPAL, paypal.FUNDING.CARD, etc. :contentReference[oaicite:4]{index=4}
                    setPaypalStatus(
                        `You’re paying via: ${data.fundingSource || "PayPal"}.`
                    );
                },

                fundingSource: fundingHint,

                // Create order on your server
                createOrder: () => {
                    setProcessing(true);
                    return fetch(`${API_BASE_URL}/api/paypal/orders`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            amount: displayAmount,
                            frequency: freq
                        })
                    })
                        .then((res) => {
                            if (!res.ok) {
                                throw new Error("Failed to create order");
                            }
                            return res.json();
                        })
                        .then((data) => {
                            if (!data.id) throw new Error("Missing order id");
                            return data.id;
                        })
                        .catch((err) => {
                            console.error(err);
                            setProcessing(false);
                            alert(
                                "There was a problem creating your PayPal order. Please try again."
                            );
                        });
                },

                // Capture payment after buyer approves
                onApprove: (data) => {
                    return fetch(
                        `${API_BASE_URL}/api/paypal/orders/${data.orderID}/capture`,
                        {
                            method: "POST"
                        }
                    )
                        .then((res) => {
                            if (!res.ok) {
                                throw new Error("Failed to capture order");
                            }
                            return res.json();
                        })
                        .then((details) => {
                            setProcessing(false);
                            setPaypalStatus("Thank you! Your donation was successful.");
                            console.log("Capture details:", details);
                            alert(
                                "Thank you! Your donation has been processed successfully."
                            );
                        })
                        .catch((err) => {
                            console.error(err);
                            setProcessing(false);
                            alert(
                                "There was a problem capturing your payment. Please contact us if this continues."
                            );
                        });
                },

                onError: (err) => {
                    console.error("PayPal error:", err);
                    setProcessing(false);
                    alert(
                        "There was an issue with PayPal checkout. Please try again or contact us."
                    );
                },

                onCancel: () => {
                    setProcessing(false);
                    setPaypalStatus("You cancelled the PayPal checkout.");
                }
            })
            .render("#paypal-buttons-container");
    }, [paypalLoaded, method, displayAmount, freq]);

    function handleOfflineSubmit(e) {
        e.preventDefault();
        if (!displayAmount) {
            alert("Please enter a donation amount greater than $0.");
            return;
        }

        if (method === "zelle") {
            alert(
                `To donate via Zelle:\n\n1. Open your bank's Zelle app.\n2. Send $${displayAmount.toFixed(
                    2
                )} to: donations@almadenvoices.org\n3. Add a note: "Almaden Voices donation".\n\nThank you for your support!`
            );
        } else if (method === "check") {
            alert(
                `To donate by check:\n\n1. Make your check payable to: Almaden Voices\n2. Amount: $${displayAmount.toFixed(
                    2
                )}\n3. Mail to:\nPO Box 1234\nSan Jose, CA 95120\n\nInclude your email if you’d like a digital receipt.\nThank you for your support!`
            );
        }
    }

    const isOnlineMethod =
        method === "paypal" || method === "card" || method === "apple" || method === "google";

    const methodHelperText = (() => {
        if (method === "paypal") {
            return "You’ll complete your donation securely with PayPal. Inside PayPal you can use your PayPal balance, bank, or linked cards.";
        }
        if (method === "card") {
            return "You’ll pay with Visa, Mastercard, or another card via PayPal’s secure checkout — no PayPal account required.";
        }
        if (method === "apple") {
            return "If Apple Pay is available on your device and enabled in our PayPal account, you can choose Apple Pay in the PayPal window.";
        }
        if (method === "google") {
            return "If Google Pay is available on your device and enabled in our PayPal account, you can choose Google Pay in the PayPal window.";
        }
        if (method === "zelle") {
            return "We’ll show step-by-step instructions to complete your Zelle transfer.";
        }
        if (method === "check") {
            return "We’ll show mailing instructions to send a check.";
        }
        return "";
    })();

    return (
        <main className={s.page}>
            {/* HERO */}
            <section className={s.hero}>
                <div className="container">
                    <div className={s.heroWrap}>
                        <div className={s.heroText}>
                            <h1 className={s.title}>
                                Fuel a child’s <span className={s.highlight}>voice</span>.
                            </h1>
                            <p className={s.sub}>
                                Your gift helps students overcome stage fright, learn to speak
                                clearly, and build lifelong confidence through our four-week
                                public speaking program in Almaden Valley.
                            </p>
                            <ul className={s.bullets}>
                                <li>
                                    <VerifiedIcon /> Tax-deductible · CA 501(c)(3) nonprofit
                                </li>
                                <li>
                                    <ShieldIcon /> All online payments are processed securely by
                                    PayPal.
                                </li>
                            </ul>
                        </div>

                        {/* DONATE CARD */}
                        <div className={s.giveCard}>
                            <header className={s.giveHead}>
                                <VolunteerActivismIcon />
                                <span>Make a Donation</span>
                            </header>

                            {/* frequency */}
                            <div className={s.freq}>
                                <button
                                    type="button"
                                    className={`${s.freqBtn} ${freq === "once" ? s.active : ""}`}
                                    onClick={() => setFreq("once")}
                                >
                                    One-time
                                </button>
                                <button
                                    type="button"
                                    className={`${s.freqBtn} ${
                                        freq === "monthly" ? s.active : ""
                                    }`}
                                    onClick={() => setFreq("monthly")}
                                >
                                    Monthly
                                    <span className={s.pill}>Most impact</span>
                                </button>
                            </div>

                            {/* amount presets */}
                            <div className={s.presetWrap}>
                                {[25, 50, 100, 250, 500].map((v) => (
                                    <button
                                        type="button"
                                        key={v}
                                        className={`${s.preset} ${
                                            !custom && amount === v ? s.active : ""
                                        }`}
                                        onClick={() => handlePreset(v)}
                                    >
                                        ${v}
                                    </button>
                                ))}
                                <div className={s.customBox}>
                                    <span>$</span>
                                    <input
                                        inputMode="decimal"
                                        placeholder="Other"
                                        value={custom}
                                        onChange={onCustomChange}
                                        aria-label="Custom amount"
                                    />
                                </div>
                            </div>

                            {/* summary */}
                            <div className={s.summary}>
                                <span>Donation</span>
                                <strong>
                                    {displayAmount ? `$${displayAmount}` : "$0"}{" "}
                                    <em>/{freq === "monthly" ? "month" : "once"}</em>
                                </strong>
                            </div>

                            {/* methods */}
                            <div className={s.methods}>
                                {METHODS.map((m) => (
                                    <button
                                        type="button"
                                        key={m.id}
                                        className={`${s.method} ${
                                            method === m.id ? s.methodActive : ""
                                        }`}
                                        onClick={() => setMethod(m.id)}
                                        aria-pressed={method === m.id}
                                    >
                                        <span className={s.mIcon}>{m.icon}</span>
                                        <span>{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            {methodHelperText && (
                                <p className={s.helper}>{methodHelperText}</p>
                            )}

                            {/* ONLINE: PayPal buttons */}
                            {isOnlineMethod && (
                                <div className={s.paypalArea}>
                                    {!displayAmount && (
                                        <p className={s.helperWarning}>
                                            Enter a donation amount to enable checkout.
                                        </p>
                                    )}

                                    {paypalError && (
                                        <p className={s.error}>
                                            {paypalError} Please check your internet connection or
                                            refresh the page.
                                        </p>
                                    )}

                                    {!paypalError && (
                                        <div id="paypal-buttons-container" className={s.paypalBtns} />
                                    )}

                                    {paypalStatus && (
                                        <p className={s.paypalStatus}>{paypalStatus}</p>
                                    )}

                                    {processing && (
                                        <p className={s.processing}>
                                            <SendIcon fontSize="small" /> Starting secure PayPal
                                            checkout…
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* OFFLINE: Zelle / Check */}
                            {!isOnlineMethod && (
                                <form onSubmit={handleOfflineSubmit}>
                                    <div className={s.options}>
                                        <label className={s.chk}>
                                            <input type="checkbox" /> Give anonymously
                                        </label>
                                        <label className={s.chk}>
                                            <input type="checkbox" /> This gift is in honor of someone
                                        </label>
                                        <textarea
                                            className={s.note}
                                            rows="3"
                                            placeholder="Add an optional note or dedication…"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={s.payBtn}
                                        disabled={!displayAmount}
                                    >
                    <span>
                      {method === "zelle"
                          ? "See Zelle instructions"
                          : "See check mailing instructions"}
                    </span>
                                        <SendIcon fontSize="small" />
                                    </button>
                                </form>
                            )}

                            <p className={s.legal}>
                                Almaden Voices is a California 501(c)(3) nonprofit.
                                Contributions are tax-deductible to the extent allowed by law.
                                You’ll receive an email receipt for your records when you pay
                                online via PayPal.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* IMPACT + OTHER SECTIONS … keep your existing ones here */}
        </main>
    );
}
