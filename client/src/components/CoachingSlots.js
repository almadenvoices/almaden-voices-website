import React, { useEffect, useMemo, useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VideocamIcon from "@mui/icons-material/Videocam";
import PlaceIcon from "@mui/icons-material/Place";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import usePayPalScript from "../hooks/usePayPalScript";
import c from "./CoachingSlots.module.css";

/**
 * Five one-hour 1-on-1 coaching slots. The slot list, their prices, and which
 * ones are already taken all come from /api/coaching/slots — the server is the
 * source of truth so the amount charged can't be changed from the browser.
 *
 * Flow: pick a slot -> pick online/in person -> fill in who it's for -> pay.
 * The booking is only recorded once PayPal confirms the payment.
 */
export default function CoachingSlots() {
    const [slots, setSlots] = useState([]);
    const [prices, setPrices] = useState({ online: 20, inPerson: 30 });
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [selectedId, setSelectedId] = useState("");
    const [format, setFormat] = useState("online");
    const [parentName, setParentName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [studentName, setStudentName] = useState("");
    const [studentAge, setStudentAge] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [notes, setNotes] = useState("");

    const [payError, setPayError] = useState("");
    const [booked, setBooked] = useState(null); // set once payment succeeds

    const { loaded: paypalLoaded, error: paypalError } = usePayPalScript();

    const loadSlots = () => {
        fetch("/api/coaching/slots")
            .then(res => res.json())
            .then(data => {
                setSlots(data.slots || []);
                if (data.prices) setPrices(data.prices);
                setLoading(false);
            })
            .catch(() => {
                setLoadError("We couldn't load the available sessions. Please refresh and try again.");
                setLoading(false);
            });
    };

    useEffect(loadSlots, []);

    const selectedSlot = slots.find(s => s.id === selectedId);
    const price = format === "inPerson" ? prices.inPerson : prices.online;

    // Every field the confirmation email depends on must be filled in before we
    // let anyone reach the PayPal buttons.
    const detailsComplete = useMemo(() => (
        parentName.trim() && studentName.trim() && phone.trim() &&
        schoolName.trim() && zipCode.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ), [parentName, studentName, phone, schoolName, zipCode, email]);

    const readyToPay = Boolean(selectedSlot) && !selectedSlot?.booked && detailsComplete;

    // Render the PayPal buttons once a slot is chosen and the details are in.
    useEffect(() => {
        if (!paypalLoaded || !readyToPay || booked) return;
        if (!window.paypal) return;

        const container = document.getElementById("coaching-paypal-container");
        if (!container) return;
        container.innerHTML = "";
        setPayError("");

        // Captured here so the handlers below use the values as they were when
        // the buttons were rendered.
        const slotId = selectedId;
        const chosenFormat = format;
        const details = { parentName, email, phone, studentName, studentAge, schoolName, zipCode, notes };

        window.paypal.Buttons({
            style: { layout: "vertical", shape: "rect", color: "gold", label: "pay" },

            createOrder: () => fetch("/api/coaching/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slotId, format: chosenFormat })
            })
                .then(async res => {
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data.error || `Server ${res.status}`);
                    if (!data.id) throw new Error("Missing order id");
                    return data.id;
                })
                .catch(err => {
                    setPayError(err.message);
                    // A 409 means someone else took the slot while this form was open.
                    loadSlots();
                    throw err;
                }),

            onApprove: (data) => fetch(`/api/coaching/orders/${data.orderID}/capture`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slotId, format: chosenFormat, ...details })
            })
                .then(async res => {
                    if (!res.ok) throw new Error("Failed to capture payment");
                    await res.json();
                    setBooked({ slot: selectedSlot, format: chosenFormat, price });
                    loadSlots();
                })
                .catch(() => {
                    setPayError("Your payment went through but we couldn't confirm the booking. Please email us and we'll sort it out right away.");
                }),

            onError: (err) => {
                console.error("PayPal error:", err);
                setPayError("Something went wrong with PayPal. Please try again.");
            },

            onCancel: () => setPayError("")
        }).render("#coaching-paypal-container");
    }, [paypalLoaded, readyToPay, booked, selectedId, format, parentName, email, phone, studentName, studentAge, schoolName, zipCode, notes, price, selectedSlot]);

    const inputStyle = {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 14px",
        borderRadius: "8px",
        border: "1px solid #D1D5DB",
        fontSize: "0.95rem",
        fontFamily: "inherit",
        outline: "none",
    };

    const labelStyle = { display: "block", marginBottom: "6px", fontWeight: 600, color: "#111827", fontSize: "0.9rem" };

    if (booked) {
        return (
            <div style={{ maxWidth: "620px", margin: "0 auto", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "16px", padding: "32px 28px", textAlign: "center" }}>
                <CheckCircleIcon style={{ fontSize: 52, color: "#059669" }} />
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#065F46", margin: "12px 0 8px" }}>
                    Your session is booked!
                </h3>
                <p style={{ color: "#047857", margin: "0 0 6px", fontWeight: 600 }}>
                    {booked.slot.date} · {booked.slot.time}
                </p>
                <p style={{ color: "#047857", margin: 0 }}>
                    {booked.format === "inPerson" ? "In person" : "Online"} · ${booked.price}.00 paid
                </p>
                <p style={{ color: "#065F46", fontSize: "0.9rem", margin: "16px 0 0", lineHeight: 1.6 }}>
                    A confirmation email is on its way. We&apos;ll send the {booked.format === "inPerson" ? "location" : "join link"} before your session.
                </p>
            </div>
        );
    }

    return (
        <div className={c.wrap}>
            <div className={c.intro}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
                    1-on-1 Coaching Sessions
                </h3>
                <p style={{ color: "#6B7280", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 8px" }}>
                    One hour of focused, personal coaching — we work on whatever your child needs most,
                    whether that&apos;s a speech they&apos;re preparing, nerves, or building confidence from scratch.
                </p>
                <p style={{ color: "#6B7280", fontSize: "0.88rem", lineHeight: 1.7, margin: 0 }}>
                    <strong style={{ color: "#111827" }}>${prices.online} online · ${prices.inPerson} in person.</strong>{" "}
                    Every dollar goes straight back into funding our free workshops.
                </p>
            </div>

            {loading && <p style={{ textAlign: "center", color: "#6B7280" }}>Loading available sessions…</p>}
            {loadError && (
                <p style={{ textAlign: "center", color: "#DC2626", fontSize: "0.9rem" }}>{loadError}</p>
            )}

            {/* Slot boxes — five across, collapsing on narrower screens */}
            <div className={c.slotGrid}>
                {slots.map(slot => {
                    const isSelected = slot.id === selectedId;
                    return (
                        <button
                            key={slot.id}
                            type="button"
                            disabled={slot.booked}
                            onClick={() => setSelectedId(isSelected ? "" : slot.id)}
                            style={{
                                textAlign: "left",
                                padding: "16px 14px",
                                borderRadius: "14px",
                                border: isSelected ? "2px solid #2563EB" : "2px solid #E5E7EB",
                                background: slot.booked ? "#F9FAFB" : isSelected ? "#F0F6FF" : "#FFFFFF",
                                cursor: slot.booked ? "not-allowed" : "pointer",
                                opacity: slot.booked ? 0.6 : 1,
                                fontFamily: "inherit",
                                transition: "border-color 0.2s, background-color 0.2s",
                            }}
                        >
                            <span style={{ display: "block", fontWeight: 700, color: "#111827", marginBottom: "8px", fontSize: "0.95rem" }}>
                                {slot.label}
                                {slot.booked && <span style={{ display: "block", color: "#DC2626", fontWeight: 600, fontSize: "0.8rem" }}>Booked</span>}
                            </span>
                            <span style={{ display: "flex", alignItems: "flex-start", gap: "5px", color: "#374151", fontSize: "0.83rem", lineHeight: 1.4 }}>
                                <CalendarMonthIcon style={{ fontSize: 14, color: "#2563EB", flex: "none", marginTop: "2px" }} /> {slot.date}
                            </span>
                            <span style={{ display: "flex", alignItems: "flex-start", gap: "5px", color: "#374151", fontSize: "0.83rem", marginTop: "3px", lineHeight: 1.4 }}>
                                <AccessTimeIcon style={{ fontSize: 14, color: "#2563EB", flex: "none", marginTop: "2px" }} /> {slot.time}
                            </span>
                            <span style={{ display: "block", marginTop: "10px", fontWeight: 700, color: "#2563EB", fontSize: "0.83rem", lineHeight: 1.5 }}>
                                ${prices.online} online
                                <br />
                                ${prices.inPerson} in person
                            </span>
                        </button>
                    );
                })}
            </div>

            {selectedSlot && (
                <div className={c.bookingPanel}>
                    <h4 style={{ margin: "0 0 18px", fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
                        Book {selectedSlot.label} — {selectedSlot.date}
                    </h4>

                    {/* Online vs in person */}
                    <div style={{ marginBottom: "20px" }}>
                        <span style={labelStyle}>How would you like to meet?</span>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {[
                                { key: "online", icon: <VideocamIcon style={{ fontSize: 18 }} />, title: "Online", cost: prices.online },
                                { key: "inPerson", icon: <PlaceIcon style={{ fontSize: 18 }} />, title: "In person", cost: prices.inPerson },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setFormat(opt.key)}
                                    style={{
                                        flex: "1 1 140px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        borderRadius: "12px",
                                        border: format === opt.key ? "2px solid #2563EB" : "2px solid #E5E7EB",
                                        background: format === opt.key ? "#F0F6FF" : "#FFFFFF",
                                        color: format === opt.key ? "#1D4ED8" : "#374151",
                                        fontWeight: 700,
                                        fontFamily: "inherit",
                                        cursor: "pointer",
                                    }}
                                >
                                    {opt.icon} {opt.title} · ${opt.cost}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                        <div>
                            <label style={labelStyle} htmlFor="coach-parent">Parent/guardian name</label>
                            <input id="coach-parent" style={inputStyle} value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Your name" />
                        </div>
                        <div>
                            <label style={labelStyle} htmlFor="coach-student">Student&apos;s name</label>
                            <input id="coach-student" style={inputStyle} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Child's name" />
                        </div>
                        <div>
                            <label style={labelStyle} htmlFor="coach-email">Email</label>
                            <input id="coach-email" type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
                        </div>
                        <div>
                            <label style={labelStyle} htmlFor="coach-phone">Phone number</label>
                            <input id="coach-phone" type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (000) 000-0000" />
                        </div>
                        <div>
                            <label style={labelStyle} htmlFor="coach-school">School name</label>
                            <input id="coach-school" style={inputStyle} value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Graystone Elementary" />
                        </div>
                        <div>
                            <label style={labelStyle} htmlFor="coach-zip">Home ZIP code</label>
                            <input id="coach-zip" style={inputStyle} value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="e.g. 95120" />
                        </div>
                        <div>
                            <label style={labelStyle} htmlFor="coach-age">Student&apos;s age</label>
                            <select id="coach-age" style={{ ...inputStyle, backgroundColor: "#FFFFFF" }} value={studentAge} onChange={e => setStudentAge(e.target.value)}>
                                <option value="">Select age…</option>
                                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(age => (
                                    <option key={age} value={String(age)}>{age} years old</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                        <label style={labelStyle} htmlFor="coach-notes">What would you like to work on? (optional)</label>
                        <textarea id="coach-notes" rows="3" style={{ ...inputStyle, resize: "vertical" }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="A speech they're preparing, stage nerves, anything else we should know…" />
                    </div>

                    <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #E5E7EB" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <span style={{ fontWeight: 600, color: "#374151" }}>Total</span>
                            <span style={{ fontWeight: 700, fontSize: "1.3rem", color: "#111827" }}>${price}.00</span>
                        </div>

                        {!detailsComplete && (
                            <p style={{ color: "#6B7280", fontSize: "0.88rem", margin: "0 0 12px", textAlign: "center" }}>
                                Fill in your name, your child&apos;s name, email, phone, school and ZIP to continue to payment.
                            </p>
                        )}
                        {payError && (
                            <p style={{ color: "#DC2626", fontSize: "0.88rem", margin: "0 0 12px", textAlign: "center" }}>{payError}</p>
                        )}
                        {paypalError && (
                            <p style={{ color: "#DC2626", fontSize: "0.88rem", margin: "0 0 12px", textAlign: "center" }}>{paypalError}</p>
                        )}

                        <div id="coaching-paypal-container" />

                        <p style={{ color: "#9CA3AF", fontSize: "0.78rem", margin: "14px 0 0", textAlign: "center", lineHeight: 1.6 }}>
                            Payment is handled by PayPal — you can pay with a card without a PayPal account.
                            <br />
                            This is a payment for coaching, not a tax-deductible donation.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
