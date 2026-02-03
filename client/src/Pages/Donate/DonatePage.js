import React, { useEffect, useMemo, useState } from "react";
import s from "./Donate.module.css";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShieldIcon from "@mui/icons-material/Shield";
import VerifiedIcon from "@mui/icons-material/Verified";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SendIcon from "@mui/icons-material/Send";

/**
 * ====== CONFIG – UPDATE THESE ======
 */

// Use relative URL so it works on both localhost and production
const API_BASE_URL = "";

// Use your real PayPal CLIENT ID (same as backend env)
const PAYPAL_CLIENT_ID = "AXjQeGEP8yRg32Ze14iVZFB24aYw37Gp8M3udPPwRewK3etierQ7tmSGnU3LI8ZNskzhjpgJMgBWERoZ";

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
    const [freq, setFreq] = useState("monthly"); // 'once' | 'monthly'

    // cover processing fee
    const [coverFee, setCoverFee] = useState(true);

    // "online" = PayPal (handles PayPal wallet + Visa/Mastercard/Amex)
    // "check"  = offline check by mail
    const [method, setMethod] = useState("online");
    const [processing, setProcessing] = useState(false);
    const [paypalStatus, setPaypalStatus] = useState("");

    const { loaded: paypalLoaded, error: paypalError } = usePayPalScript();

    const displayAmount = useMemo(() => {
        const v = Number(custom || amount);
        return isFinite(v) && v > 0 ? v : 0;
    }, [amount, custom]);

    // PayPal fee: 2.89% + $0.49. Inverse formula ensures full amount reaches us.
    const feeAmount = useMemo(() => {
        if (!displayAmount) return 0;
        const total = (displayAmount + 0.49) / (1 - 0.0289);
        return Math.round((total - displayAmount) * 100) / 100;
    }, [displayAmount]);

    const chargeAmount = coverFee ? Math.round((displayAmount + feeAmount) * 100) / 100 : displayAmount;

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
        if (!paypalLoaded || method !== "online" || !displayAmount) return;
        if (!window.paypal) return;

        const container = document.getElementById("paypal-buttons-container");
        if (!container) return;
        container.innerHTML = "";

        setPaypalStatus("");

        // Render without fundingSource — PayPal automatically shows
        // both "PayPal" and "Debit or Credit Card" buttons
        window.paypal
            .Buttons({
                style: {
                    layout: "vertical",
                    shape: "rect",
                    color: "gold",
                    label: "paypal"
                },

                createOrder: () => {
                    setProcessing(true);
                    return fetch(`${API_BASE_URL}/api/paypal/orders`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            amount: chargeAmount,
                            frequency: freq
                        })
                    })
                        .then(async (res) => {
                            if (!res.ok) {
                                const body = await res.text();
                                throw new Error(`Server ${res.status}: ${body}`);
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
                            alert("PayPal order error: " + err.message);
                        });
                },

                onApprove: (data) => {
                    return fetch(
                        `${API_BASE_URL}/api/paypal/orders/${data.orderID}/capture`,
                        { method: "POST" }
                    )
                        .then((res) => {
                            if (!res.ok) throw new Error("Failed to capture order");
                            return res.json();
                        })
                        .then((details) => {
                            setProcessing(false);
                            setPaypalStatus("Thank you! Your donation was successful.");
                            console.log("Capture details:", details);
                            alert("Thank you! Your donation has been processed successfully.");
                        })
                        .catch((err) => {
                            console.error(err);
                            setProcessing(false);
                            alert("There was a problem capturing your payment. Please contact us if this continues.");
                        });
                },

                onError: (err) => {
                    console.error("PayPal error:", err);
                    setProcessing(false);
                    alert("PayPal SDK error: " + (err.message || err));
                },

                onCancel: () => {
                    setProcessing(false);
                    setPaypalStatus("You cancelled the PayPal checkout.");
                }
            })
            .render("#paypal-buttons-container");
    }, [paypalLoaded, method, displayAmount, chargeAmount, freq]);

    function handleCheckSubmit(e) {
        e.preventDefault();
        if (!displayAmount) {
            alert("Please enter a donation amount greater than $0.");
            return;
        }
        alert(
            `To donate by check:\n\n1. Make your check payable to: Almaden Voices\n2. Amount: $${displayAmount.toFixed(
                2
            )}\n3. Mail to:\nPO Box 1234\nSan Jose, CA 95120\n\nInclude your email if you'd like a digital receipt.\nThank you for your support!`
        );
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
                                    <VerifiedIcon /> Registered California nonprofit
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

                            {/* cover processing fee */}
                            {displayAmount > 0 && (
                                <div
                                    className={s.coverFee}
                                    onClick={() => setCoverFee(!coverFee)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <input
                                        type="checkbox"
                                        checked={coverFee}
                                        onChange={(e) => setCoverFee(e.target.checked)}
                                        className={s.coverFeeCheck}
                                    />
                                    <div className={s.coverFeeText}>
                                        <strong>
                                            I'll cover the ${feeAmount.toFixed(2)} processing fee so 100% of
                                            my ${displayAmount} donation reaches Almaden Voices.
                                        </strong>
                                        <span className={s.coverFeeDetail}>
                                            {coverFee
                                                ? `You'll be charged $${chargeAmount.toFixed(2)} — every dollar of your $${displayAmount} donation goes directly to students.`
                                                : `Without fee coverage, approximately $${(displayAmount - feeAmount).toFixed(2)} of your $${displayAmount} donation will reach us.`
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* payment method toggle */}
                            <div className={s.methods}>
                                <button
                                    type="button"
                                    className={`${s.method} ${method === "online" ? s.methodActive : ""}`}
                                    onClick={() => setMethod("online")}
                                    aria-pressed={method === "online"}
                                >
                                    <span className={s.mIcon}><AccountBalanceWalletIcon /></span>
                                    <span>Pay Online</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${s.method} ${method === "check" ? s.methodActive : ""}`}
                                    onClick={() => setMethod("check")}
                                    aria-pressed={method === "check"}
                                >
                                    <span className={s.mIcon}><AttachMoneyIcon /></span>
                                    <span>Check by Mail</span>
                                </button>
                            </div>

                            {method === "online" && (
                                <p className={s.helper}>
                                    Pay securely with PayPal, Visa, Mastercard, or other cards — no PayPal account required.
                                </p>
                            )}

                            {/* ONLINE: PayPal Smart Buttons (shows PayPal + Card automatically) */}
                            {method === "online" && (
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

                            {/* OFFLINE: Check by Mail */}
                            {method === "check" && (
                                <form onSubmit={handleCheckSubmit}>
                                    <div className={s.options}>
                                        <label className={s.chk}>
                                            <input type="checkbox" /> Give anonymously
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
                                        <span>See check mailing instructions</span>
                                        <SendIcon fontSize="small" />
                                    </button>
                                </form>
                            )}

                            <p className={s.legal}>
                                Almaden Voices is a registered California nonprofit.
                                We are currently pursuing 501(c)(3) status — donations are not
                                tax-deductible at this time. You'll receive a confirmation
                                receipt via PayPal when you pay online.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* IMPACT + OTHER SECTIONS … keep your existing ones here */}
        </main>
    );
}
