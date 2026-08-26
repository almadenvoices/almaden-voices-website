import React, { useEffect, useMemo, useState } from "react";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import usePayPalScript from "../hooks/usePayPalScript";
import c from "./CoachingSlots.module.css";

/**
 * Five numbered one-hour 1-on-1 coaching slots. The slots aren't tied to dates
 * — scheduling happens by email after booking.
 *
 * The slot list, the prices, and which slots are closed all come from
 * /api/coaching/slots. The server is the source of truth so the amount charged
 * can't be changed from the browser. To close a slot by hand, flip its
 * `taken` flag in COACHING_SLOTS at the top of server.js.
 *
 * Flow: claim a slot -> pick online/in person -> fill in who it's for -> pay.
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
    const [comments, setComments] = useState("");
    // Which required fields the parent has been told about, and whether the
    // PayPal buttons have been unlocked yet.
    const [errors, setErrors] = useState({});
    const [showPayment, setShowPayment] = useState(false);
    // Photo/video permission is opt-in and required: "" until the parent picks.
    const [photoConsent, setPhotoConsent] = useState("");

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
                setLoadError("We couldn't load the coaching slots. Please refresh and try again.");
                setLoading(false);
            });
    };

    useEffect(loadSlots, []);

    const selectedSlot = slots.find(s => s.id === selectedId);
    const price = format === "inPerson" ? prices.inPerson : prices.online;
    const openSlots = slots.filter(s => !s.booked).length;
    const allTaken = slots.length > 0 && openSlots === 0;

    // Every required field, checked in one place so the submit button and the
    // red marks can never disagree about what's missing.
    const missingFields = useMemo(() => {
        const missing = {};
        if (!parentName.trim()) missing.parentName = "Required.";
        if (!studentName.trim()) missing.studentName = "Required.";
        if (!studentAge) missing.studentAge = "Required.";
        if (!email.trim()) missing.email = "Required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.email = "Please enter a valid email address.";
        if (!phone.trim()) missing.phone = "Required.";
        if (!notes.trim()) missing.notes = "Required.";
        if (!photoConsent) missing.photoConsent = "Please choose one.";
        return missing;
    }, [parentName, studentName, studentAge, email, phone, notes, photoConsent]);

    const detailsComplete = Object.keys(missingFields).length === 0;
    const readyToPay = Boolean(selectedSlot) && !selectedSlot?.booked && detailsComplete && showPayment;

    // Fixing a field clears its mark straight away rather than making the
    // parent press the button again to find out.
    useEffect(() => {
        setErrors(prev => {
            if (Object.keys(prev).length === 0) return prev;
            const next = {};
            Object.keys(prev).forEach(key => {
                if (missingFields[key]) next[key] = missingFields[key];
            });
            return Object.keys(next).length === Object.keys(prev).length ? prev : next;
        });
    }, [missingFields]);

    // Changing slot or format sends them back through the check.
    useEffect(() => { setShowPayment(false); }, [selectedId, format]);

    function onContinueToPayment() {
        if (!detailsComplete) {
            setErrors(missingFields);
            setShowPayment(false);
            // Bring the first problem into view.
            const firstBad = document.querySelector(`.${c.fieldErrorText}`);
            (firstBad || document.getElementById("coaching-pay-area"))
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setErrors({});
        setShowPayment(true);
    }

    // Render the PayPal buttons once a slot is claimed and the details are in.
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
        const details = {
            parentName, email, phone, studentName, studentAge, schoolName, zipCode, notes, comments,
            photoConsent: photoConsent === "yes",
            pressConsent: false,
        };

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
    }, [paypalLoaded, readyToPay, booked, selectedId, format, parentName, email, phone,
        studentName, studentAge, schoolName, zipCode, notes, comments, photoConsent,
        price, selectedSlot]);

    if (booked) {
        return (
            <div className={c.confirm}>
                <CheckCircleIcon style={{ fontSize: 52, color: "#059669" }} />
                <h3 className={c.confirmTitle}>You&apos;re booked!</h3>
                <p className={c.confirmLead}>Check your email for your payment receipt.</p>
                <p className={c.confirmBody}>
                    <strong>Next step:</strong> I&apos;ll email you within two business days to schedule
                    your session. Please reply to that email to confirm your time — your session
                    isn&apos;t scheduled until you do. If you don&apos;t hear from me within two business
                    days, check your spam folder or email{" "}
                    <a className={c.confirmLink} href="mailto:almadenvoices@gmail.com">almadenvoices@gmail.com</a>.
                </p>
            </div>
        );
    }

    return (
        <div className={c.wrap}>
            <div className={c.intro}>
                <h3 className={c.introTitle}>One-on-one coaching</h3>
                <p className={c.introBody}>
                    An hour of focused, personal coaching for students ages 5 to 14. We work on
                    whatever your student needs most — a speech they&apos;re preparing, a class
                    presentation, stage nerves, or building confidence from scratch.
                </p>
                <p className={c.introBody}>
                    Five slots are available. After you book, we&apos;ll email you within two business
                    days to find a time. Reply to that email to confirm your session — we can&apos;t
                    hold a slot without a reply.
                </p>
                <p className={c.introNote}>
                    <strong>${prices.online} online · ${prices.inPerson} in person.</strong>{" "}
                    Every dollar goes back into funding our free workshops.
                </p>
            </div>

            {loading && <p className={c.status}>Loading coaching slots…</p>}
            {loadError && <p className={c.statusError}>{loadError}</p>}

            {allTaken ? (
                <div className={c.waitlist}>
                    All coaching slots are currently filled. Email{" "}
                    <a className={c.waitlistLink} href="mailto:almadenvoices@gmail.com">almadenvoices@gmail.com</a>{" "}
                    to join the waitlist for the next round.
                </div>
            ) : slots.length > 0 && (
                <>
                    <p className={c.remaining}>
                        {openSlots} of {slots.length} slots remaining
                    </p>

                    <div className={c.slotGrid}>
                        {slots.map(slot => {
                            const isSelected = slot.id === selectedId;
                            return (
                                <div
                                    key={slot.id}
                                    className={`${c.slot} ${slot.booked ? c.slotTaken : ""} ${isSelected ? c.slotSelected : ""}`}
                                >
                                    <span className={c.slotLabel}>{slot.label}</span>
                                    <span className={c.slotMeta}>
                                        <ScheduleIcon className={c.slotIcon} />
                                        1 hour · scheduled with you after booking
                                    </span>
                                    <span className={c.slotPrice}>
                                        ${prices.online} online · ${prices.inPerson} in person
                                    </span>
                                    {slot.booked ? (
                                        <span className={c.slotBooked}>Booked</span>
                                    ) : (
                                        <button
                                            type="button"
                                            className={c.claimBtn}
                                            onClick={() => setSelectedId(isSelected ? "" : slot.id)}
                                        >
                                            {isSelected ? "Selected" : "Claim this slot"}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {selectedSlot && (
                <div className={c.bookingPanel}>
                    <h4 className={c.panelTitle}>Book {selectedSlot.label}</h4>

                    {/* Online vs in person — the total below follows this. */}
                    <fieldset className={c.formatSet}>
                        <legend className={c.fieldLabel}>How would you like to meet?</legend>
                        <div className={c.formatRow}>
                            {[
                                { key: "online", title: "Online", cost: prices.online },
                                { key: "inPerson", title: "In person", cost: prices.inPerson },
                            ].map(opt => (
                                <label
                                    key={opt.key}
                                    className={`${c.formatOpt} ${format === opt.key ? c.formatOptOn : ""}`}
                                >
                                    <input
                                        type="radio"
                                        name="coachFormat"
                                        value={opt.key}
                                        checked={format === opt.key}
                                        onChange={() => setFormat(opt.key)}
                                    />
                                    <span>{opt.title} — ${opt.cost}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div className={c.fieldGrid}>
                        <div>
                            <label className={c.fieldLabel} htmlFor="coach-parent">Parent/guardian name <span className={c.req}>*</span></label>
                            <input id="coach-parent" className={`${c.input} ${errors.parentName ? c.inputError : ""}`} value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Your name" />
                            {errors.parentName && <p className={c.fieldErrorText}>{errors.parentName}</p>}
                        </div>
                        <div>
                            <label className={c.fieldLabel} htmlFor="coach-student">Student&apos;s name <span className={c.req}>*</span></label>
                            <input id="coach-student" className={`${c.input} ${errors.studentName ? c.inputError : ""}`} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Child's name" />
                            {errors.studentName && <p className={c.fieldErrorText}>{errors.studentName}</p>}
                        </div>
                        <div>
                            <label className={c.fieldLabel} htmlFor="coach-age">Student&apos;s age <span className={c.req}>*</span></label>
                            <select id="coach-age" className={`${c.input} ${errors.studentAge ? c.inputError : ""}`} value={studentAge} onChange={e => setStudentAge(e.target.value)}>
                                <option value="">Select age…</option>
                                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(age => (
                                    <option key={age} value={String(age)}>{age} years old</option>
                                ))}
                            </select>
                            {errors.studentAge && <p className={c.fieldErrorText}>{errors.studentAge}</p>}
                        </div>
                        <div>
                            <label className={c.fieldLabel} htmlFor="coach-email">Email <span className={c.req}>*</span></label>
                            <input id="coach-email" type="email" className={`${c.input} ${errors.email ? c.inputError : ""}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
                            {errors.email && <p className={c.fieldErrorText}>{errors.email}</p>}
                        </div>
                        <div>
                            <label className={c.fieldLabel} htmlFor="coach-phone">Phone number <span className={c.req}>*</span></label>
                            <input id="coach-phone" type="tel" className={`${c.input} ${errors.phone ? c.inputError : ""}`} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (000) 000-0000" />
                            {errors.phone && <p className={c.fieldErrorText}>{errors.phone}</p>}
                        </div>
                        <div>
                            <label className={c.fieldLabel} htmlFor="coach-school">School name</label>
                            <input id="coach-school" className={c.input} value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Graystone Elementary" />
                            <p className={c.fieldHint}>Optional — this helps us understand which communities we&apos;re reaching and apply for grants.</p>
                        </div>
                        <div>
                            <label className={c.fieldLabel} htmlFor="coach-zip">Home ZIP code</label>
                            <input id="coach-zip" className={c.input} value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="e.g. 95120" />
                            <p className={c.fieldHint}>Optional — this helps us understand which communities we&apos;re reaching and apply for grants.</p>
                        </div>
                    </div>

                    <div className={c.notesField}>
                        <label className={c.fieldLabel} htmlFor="coach-notes">
                            What would you like to work on? <span className={c.req}>*</span>
                        </label>
                        <textarea id="coach-notes" rows="3" className={`${c.input} ${c.textarea} ${errors.notes ? c.inputError : ""}`} value={notes} onChange={e => setNotes(e.target.value)} placeholder="A speech they're preparing, stage nerves, a class presentation, anything else…" />
                        {errors.notes && <p className={c.fieldErrorText}>{errors.notes}</p>}
                    </div>

                    <div className={c.notesField}>
                        <label className={c.fieldLabel} htmlFor="coach-comments">
                            Any questions, concerns, or comments? (optional)
                        </label>
                        <textarea id="coach-comments" rows="3" className={`${c.input} ${c.textarea}`} value={comments} onChange={e => setComments(e.target.value)} placeholder="Anything else you'd like us to know…" />
                    </div>

                    {/* Same opt-in photo permission as the registration form. */}
                    <fieldset className={c.consentBlock}>
                        <legend className={c.consentTitle}>
                            Photo and video permission <span className={c.req}>*</span>
                        </legend>
                        <p className={c.consentIntro}>
                            We sometimes photograph or record students during sessions and showcases.
                            Please choose one:
                        </p>
                        <label className={c.check}>
                            <input
                                type="radio"
                                name="coachPhotoConsent"
                                value="yes"
                                checked={photoConsent === "yes"}
                                onChange={() => setPhotoConsent("yes")}
                            />
                            <span>
                                Yes, I give permission for photos or video of my child to appear on the
                                Almaden Voices website, program materials, and social media, identified
                                by first name only.
                            </span>
                        </label>
                        <label className={c.check}>
                            <input
                                type="radio"
                                name="coachPhotoConsent"
                                value="no"
                                checked={photoConsent === "no"}
                                onChange={() => setPhotoConsent("no")}
                            />
                            <span>No, please do not photograph or record my child.</span>
                        </label>
                        {errors.photoConsent && <p className={c.fieldErrorText}>{errors.photoConsent}</p>}
                    </fieldset>

                    <div className={c.payArea} id="coaching-pay-area">
                        <div className={c.totalRow}>
                            <span className={c.totalLabel}>Total</span>
                            <span className={c.totalAmount}>${price}.00</span>
                        </div>

                        <p className={c.reqNote}>
                            <span className={c.req}>*</span> Required
                        </p>

                        {/* Payment stays out of reach until every required field is
                            filled in, so nobody pays before we have what we need. */}
                        {!showPayment && (
                            <>
                                <button
                                    type="button"
                                    className={c.submitBtn}
                                    onClick={onContinueToPayment}
                                >
                                    Continue to payment
                                </button>
                                {Object.keys(errors).length > 0 && (
                                    <p className={c.statusError}>
                                        Please fill in the fields marked in red above, then try again.
                                    </p>
                                )}
                            </>
                        )}

                        {payError && <p className={c.statusError}>{payError}</p>}
                        {paypalError && <p className={c.statusError}>{paypalError}</p>}

                        {showPayment && (
                            <>
                                {!paypalLoaded && !paypalError && (
                                    <p className={c.status}>Loading secure payment…</p>
                                )}
                                <div id="coaching-paypal-container" />
                            </>
                        )}

                        <p className={c.payNote}>
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
