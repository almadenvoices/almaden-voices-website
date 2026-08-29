import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
/**
 * Shown in place of the slot grid once every slot is taken. Collects enough to
 * actually fill the next round — who the student is, how old, and whether they
 * want online or in person — rather than just an email address.
 *
 * Nothing here takes payment. Signing up puts a family on a list and nothing
 * more, which the copy says plainly so nobody thinks they have booked.
 */
function CoachingWaitlistForm() {
    const [parentName, setParentName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [studentName, setStudentName] = useState("");
    const [studentAge, setStudentAge] = useState("");
    const [preferredFormat, setPreferredFormat] = useState("either");
    const [schoolName, setSchoolName] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [notes, setNotes] = useState("");

    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle"); // idle | sending | done | error
    const [errorMsg, setErrorMsg] = useState("");
    const [alreadyOn, setAlreadyOn] = useState(false);

    const missing = () => {
        const m = {};
        if (!parentName.trim()) m.parentName = "Required.";
        if (!studentName.trim()) m.studentName = "Required.";
        if (!studentAge) m.studentAge = "Required.";
        if (!email.trim()) m.email = "Required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) m.email = "Please enter a valid email address.";
        if (!phone.trim()) m.phone = "Required.";
        return m;
    };

    async function onSubmit(e) {
        e.preventDefault();
        const bad = missing();
        if (Object.keys(bad).length) {
            setErrors(bad);
            document.querySelector(`.${c.fieldErrorText}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setErrors({});
        setStatus("sending");
        setErrorMsg("");

        try {
            const res = await fetch("/api/coaching/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    parentName, email, phone, studentName, studentAge,
                    preferredFormat, schoolName, zipCode, notes
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) throw new Error(data.error || "Please try again.");
            setAlreadyOn(Boolean(data.alreadyOn));
            setStatus("done");
        } catch (err) {
            setErrorMsg(err.message || "Something went wrong. Please try again.");
            setStatus("error");
        }
    }

    if (status === "done") {
        return (
            <div className={c.confirm}>
                <CheckCircleIcon style={{ fontSize: 52, color: "#059669" }} />
                <h3 className={c.confirmTitle}>
                    {alreadyOn ? "You're already on the list" : "You're on the list!"}
                </h3>
                <p className={c.confirmLead}>
                    {alreadyOn
                        ? "We already had this email on the waitlist, so there's nothing more to do."
                        : "Check your email — we've sent a confirmation."}
                </p>
                <p className={c.confirmBody}>
                    We&apos;ll email you as soon as the next round of coaching slots opens, before
                    they go up on the website. Nothing has been charged, and there&apos;s nothing
                    else you need to do.
                </p>
            </div>
        );
    }

    return (
        <form className={c.bookingPanel} onSubmit={onSubmit} noValidate>
            <h4 className={c.panelTitle}>Join the waitlist</h4>

            <div className={c.fieldGrid}>
                <div>
                    <label className={c.fieldLabel} htmlFor="wl-parent">Parent/guardian name <span className={c.req}>*</span></label>
                    <input id="wl-parent" className={`${c.input} ${errors.parentName ? c.inputError : ""}`} value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Your name" />
                    {errors.parentName && <p className={c.fieldErrorText}>{errors.parentName}</p>}
                </div>
                <div>
                    <label className={c.fieldLabel} htmlFor="wl-student">Student&apos;s name <span className={c.req}>*</span></label>
                    <input id="wl-student" className={`${c.input} ${errors.studentName ? c.inputError : ""}`} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Child's name" />
                    {errors.studentName && <p className={c.fieldErrorText}>{errors.studentName}</p>}
                </div>
                <div>
                    <label className={c.fieldLabel} htmlFor="wl-age">Student&apos;s age <span className={c.req}>*</span></label>
                    <select id="wl-age" className={`${c.input} ${errors.studentAge ? c.inputError : ""}`} value={studentAge} onChange={e => setStudentAge(e.target.value)}>
                        <option value="">Select an age</option>
                        {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    {errors.studentAge && <p className={c.fieldErrorText}>{errors.studentAge}</p>}
                </div>
                <div>
                    <label className={c.fieldLabel} htmlFor="wl-email">Email <span className={c.req}>*</span></label>
                    <input id="wl-email" type="email" className={`${c.input} ${errors.email ? c.inputError : ""}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
                    {errors.email && <p className={c.fieldErrorText}>{errors.email}</p>}
                </div>
                <div>
                    <label className={c.fieldLabel} htmlFor="wl-phone">Phone number <span className={c.req}>*</span></label>
                    <input id="wl-phone" type="tel" className={`${c.input} ${errors.phone ? c.inputError : ""}`} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (000) 000-0000" />
                    {errors.phone && <p className={c.fieldErrorText}>{errors.phone}</p>}
                </div>
                <div>
                    <label className={c.fieldLabel} htmlFor="wl-school">School name</label>
                    <input id="wl-school" className={c.input} value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Graystone Elementary" />
                </div>
                <div>
                    <label className={c.fieldLabel} htmlFor="wl-zip">Home ZIP code</label>
                    <input id="wl-zip" className={c.input} value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="e.g. 95120" />
                </div>
            </div>

            <fieldset className={c.formatSet}>
                <legend className={c.fieldLabel}>Which would you prefer?</legend>
                <div className={c.formatRow}>
                    {[
                        { key: "online", title: "Online" },
                        { key: "inPerson", title: "In person" },
                        { key: "either", title: "Either is fine" },
                    ].map(opt => (
                        <label key={opt.key} className={`${c.formatOpt} ${preferredFormat === opt.key ? c.formatOptOn : ""}`}>
                            <input
                                type="radio"
                                name="waitlistFormat"
                                value={opt.key}
                                checked={preferredFormat === opt.key}
                                onChange={() => setPreferredFormat(opt.key)}
                            />
                            <span>{opt.title}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <div className={c.notesField}>
                <label className={c.fieldLabel} htmlFor="wl-notes">
                    What would you like your student to work on?
                </label>
                <textarea id="wl-notes" rows="3" className={`${c.input} ${c.textarea}`} value={notes} onChange={e => setNotes(e.target.value)} placeholder="A speech they're preparing, stage nerves, a class presentation, anything else…" />
            </div>

            <p className={c.reqNote}><span className={c.req}>*</span> Required</p>

            {status === "error" && <p className={c.statusError}>{errorMsg}</p>}

            <button type="submit" className={c.submitBtn} disabled={status === "sending"}>
                {status === "sending" ? "Adding you…" : "Join the waitlist"}
            </button>

            <p className={c.payNote}>
                Joining the waitlist is free and doesn&apos;t book a slot — we&apos;ll email you
                when the next round opens and you can book then.
            </p>
        </form>
    );
}

export default function CoachingSlots() {
    const [slots, setSlots] = useState([]);
    // Only a placeholder for the moment before /api/coaching/slots answers —
    // the server is the authority on what anyone is actually charged.
    const [prices, setPrices] = useState({ online: 25, inPerson: 30 });
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
    // Shown above the slot grid when a slot is taken out from under someone.
    const [slotNotice, setSlotNotice] = useState("");
    const [checkingSlot, setCheckingSlot] = useState(false);
    const [booked, setBooked] = useState(null); // set once payment succeeds

    const { loaded: paypalLoaded, error: paypalError } = usePayPalScript();

    // Returns the fresh list as well as storing it, so a caller can check
    // whether a particular slot is still free before sending anyone to PayPal.
    const loadSlots = useCallback(() => {
        return fetch("/api/coaching/slots")
            .then(res => res.json())
            .then(data => {
                const fresh = data.slots || [];
                setSlots(fresh);
                if (data.prices) setPrices(data.prices);
                setLoading(false);
                return fresh;
            })
            .catch(() => {
                setLoadError("We couldn't load the coaching slots. Please refresh and try again.");
                setLoading(false);
                return null;
            });
    }, []);

    useEffect(() => { loadSlots(); }, [loadSlots]);

    // Someone else paid for the slot this parent was filling in the form for.
    // Send them back to the grid with a plain explanation instead of leaving a
    // dead PayPal button on screen — this is the single most common reason a
    // coaching payment fails.
    const handleSlotTaken = useCallback((message) => {
        setSlotNotice(message
            ? `${message} Please pick another slot below — you have not been charged.`
            : "That slot was just booked by someone else. Please pick another slot below — you have not been charged.");
        setSelectedId("");
        setShowPayment(false);
        setPayError("");
        loadSlots();
        setTimeout(() => {
            document.getElementById("coaching-slot-grid")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 60);
    }, [loadSlots]);

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

    // Changing slot or format sends them back through the check. The payment
    // error goes too — PayPal reports a cancelled order as an error after we
    // have already sent the parent back to the grid, and that message would
    // otherwise still be sitting there when they open the next slot.
    useEffect(() => {
        setShowPayment(false);
        setPayError("");
    }, [selectedId, format]);

    async function onContinueToPayment() {
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

        // Filling in the form takes a few minutes, and the slot list on screen
        // was loaded before any of it. Re-check now rather than finding out at
        // the moment of payment that the slot has gone.
        setCheckingSlot(true);
        const fresh = await loadSlots();
        setCheckingSlot(false);
        if (fresh && !fresh.some(slot => slot.id === selectedId && !slot.booked)) {
            handleSlotTaken();
            return;
        }

        setSlotNotice("");
        setShowPayment(true);
    }

    // The PayPal button below is built once and then left alone, so it can't
    // read state directly — anything it needs at click time is kept here and
    // refreshed after every render.
    const latest = useRef({});
    useEffect(() => {
        latest.current = {
            selectedSlot,
            price,
            details: {
                parentName, email, phone, studentName, studentAge, schoolName, zipCode,
                notes, comments,
                photoConsent: photoConsent === "yes",
                pressConsent: false,
            },
        };
    });

    // Render the PayPal buttons once a slot is claimed and the details are in.
    //
    // The dependencies here are deliberately all primitives. They used to
    // include the selected slot object and every form field, and because the
    // slot object is rebuilt on each render this effect re-ran constantly —
    // tearing the live PayPal button out of the page mid-click and leaving the
    // parent with a payment that only worked on the second try. Anything that
    // changes as the parent types is read from `latest` at click time instead.
    useEffect(() => {
        if (!paypalLoaded || !readyToPay || booked) return;
        if (!window.paypal) return;

        const container = document.getElementById("coaching-paypal-container");
        if (!container) return;
        container.innerHTML = "";
        setPayError("");

        // Captured here so the handlers below use the slot and format as they
        // were when the buttons were rendered. Changing either re-runs the
        // effect, which builds a fresh button for the new choice.
        const slotId = selectedId;
        const chosenFormat = format;

        let cancelled = false;

        const buttons = window.paypal.Buttons({
            style: { layout: "vertical", shape: "rect", color: "gold", label: "pay" },

            createOrder: async () => {
                const res = await fetch("/api/coaching/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slotId, format: chosenFormat })
                });
                const data = await res.json().catch(() => ({}));

                // Someone else got there first while this form was open.
                if (res.status === 409 || data.code === "SLOT_TAKEN") {
                    handleSlotTaken(data.error);
                    throw new Error(data.error || "That slot was just taken.");
                }
                if (!res.ok || !data.id) {
                    setPayError(data.error || "We couldn't start the payment. Please try again.");
                    throw new Error(data.error || `Server ${res.status}`);
                }
                return data.id;
            },

            onApprove: (data) => fetch(`/api/coaching/orders/${data.orderID}/capture`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slotId,
                    format: chosenFormat,
                    ...latest.current.details
                })
            })
                .then(async res => {
                    if (!res.ok) throw new Error("Failed to capture payment");
                    await res.json();
                    setBooked({
                        slot: latest.current.selectedSlot,
                        format: chosenFormat,
                        price: latest.current.price
                    });
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
        });

        buttons.render("#coaching-paypal-container").catch(err => {
            // A button torn down before it finished mounting is expected —
            // only a genuine failure should reach the parent.
            if (cancelled) return;
            console.error("PayPal render error:", err);
            setPayError("We couldn't load the payment button. Please refresh and try again.");
        });

        // Close the button properly instead of wiping the container out from
        // under it, which is what used to break the first payment attempt.
        return () => {
            cancelled = true;
            try {
                const closing = buttons.close();
                if (closing && typeof closing.catch === "function") closing.catch(() => {});
            } catch (err) {
                /* already gone */
            }
        };
    }, [paypalLoaded, readyToPay, booked, selectedId, format, handleSlotTaken, loadSlots]);

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
                    {/* Counted rather than written out, so opening another round of
                        slots never leaves the wrong number sitting here. */}
                    {openSlots > 0 && (
                        <>{openSlots === 1 ? "One slot is" : `${openSlots} slots are`} currently available. </>
                    )}
                    After you book, we&apos;ll email you within two business
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

            {slots.length > 0 && (
                <>
                    <p className={c.remaining}>
                        {allTaken
                            ? `All ${slots.length} slots are booked`
                            : `${openSlots} of ${slots.length} slots remaining`}
                    </p>

                    {slotNotice && <p className={c.statusError}>{slotNotice}</p>}

                    <div className={c.slotGrid} id="coaching-slot-grid">
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

            {/* Sold out — the booked slots stay on screen above this, so the
                page still shows what was on offer and that it all went. */}
            {allTaken && (
                <>
                    <div className={c.waitlist}>
                        All coaching slots are currently filled. Leave your details below and
                        we&apos;ll email you as soon as the next round opens — before the slots
                        go up on the website.
                    </div>
                    <CoachingWaitlistForm />
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
                                    disabled={checkingSlot}
                                >
                                    {checkingSlot ? "Checking availability…" : "Continue to payment"}
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
