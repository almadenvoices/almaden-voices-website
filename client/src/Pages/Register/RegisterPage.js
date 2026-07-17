import React, { useState, useEffect } from "react";
import s from "./Register.module.css";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import SendIcon from "@mui/icons-material/Send";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import GroupsIcon from "@mui/icons-material/Groups";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HomeIcon from "@mui/icons-material/Home";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

// ============================================================
// UPCOMING SESSIONS — Add new sessions here!
// Copy this template and fill in the details:
//
// {
//     id: "unique-id",
//     title: "Session Title Here",
//     date: "Month Day, Year",
//     time: "Start – End Time",
//     location: "Location Name",
//     grades: "Grades X–Y",
//     capacity: 12,
//     enrolled: 0,
//     description: "Short description of the session.",
//     status: "Open",  // "Open" or "Full"
// }
// ============================================================
const upcomingSessions = [
    {
        id: "intl-workshop-jul-2026",
        title: "Free International Public Speaking Workshop for Kids",
        date: "July 21 & 23, 2026",
        time: "10–11 AM IST · 12:30–1:30 PM Singapore · 4:30 AM UTC",
        location: "Online via Webex",
        grades: "Kids of all levels welcome",
        capacity: 500,
        enrolled: 0,
        description: "A free two-day online workshop where kids learn the fundamentals of public speaking — how to speak clearly and confidently, overcome nervousness, and present in front of others. Runs Tuesday, July 21 and Thursday, July 23 (1 hour each day) live on Webex. Join from anywhere in the world! You're welcome to attend one or both days.",
        status: "Open",
        online: true,
    },
];

const emptyStudent = () => ({ firstName: "", lastName: "", age: "" });

export default function RegisterPage() {
    const [agreed, setAgreed] = useState(false);
    const [photoConsent, setPhotoConsent] = useState(false);
    const [futureContact, setFutureContact] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [enrollmentCounts, setEnrollmentCounts] = useState({});
    const [students, setStudents] = useState([emptyStudent()]);
    const [donationAmount, setDonationAmount] = useState(5);
    const [parentFirstName, setParentFirstName] = useState("");
    const [parentLastName, setParentLastName] = useState("");

    // Google Apps Script web app URL — replace with your deployed URL
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxrbVWSjMpAB4Ru1mm_DSywPdfFS3KfMMA07Ie_e1VbXGeW_ILtNQ-vE8rQrIYubjFI/exec";

    // Detect when the parent's full name matches any student's full name
    // (a common mistake where parents type their child's name in the parent field, or vice versa)
    const normalizeName = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
    const parentFullName = `${normalizeName(parentFirstName)} ${normalizeName(parentLastName)}`.trim();
    const hasNameConflict = parentFullName.length > 0 && students.some(st => {
        const studentFullName = `${normalizeName(st.firstName)} ${normalizeName(st.lastName)}`.trim();
        return studentFullName.length > 0 && studentFullName === parentFullName;
    });

    useEffect(() => {
        fetch("/api/sessions/enrollment")
            .then(res => res.json())
            .then(data => setEnrollmentCounts(data))
            .catch(() => {});
    }, []);

    const sessions = upcomingSessions.map(ses => ({
        ...ses,
        enrolled: ses.enrolled + (enrollmentCounts[ses.id] || 0),
    }));
    const selectedSession = sessions.find(ses => ses.id === selectedSessionId);
    const spotsRemaining = selectedSession ? selectedSession.capacity - selectedSession.enrolled : 0;

    function updateStudent(index, field, value) {
        setStudents(prev => prev.map((st, i) => i === index ? { ...st, [field]: value } : st));
    }

    function addStudent() {
        if (students.length < 5 && students.length < spotsRemaining) {
            setStudents(prev => [...prev, emptyStudent()]);
        }
    }

    function removeStudent(index) {
        if (students.length > 1) {
            setStudents(prev => prev.filter((_, i) => i !== index));
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        if (hasNameConflict) {
            setError("The parent/guardian name cannot be the same as the child's name. Please enter the parent's actual name.");
            return;
        }

        if (!agreed) {
            setError("Please agree to the Privacy Policy to continue.");
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData(e.target);
        const sessionLabel = selectedSession ? `${selectedSession.title} — ${selectedSession.date}` : "";

        // Google Apps Script payload
        const appsScriptData = {
            parentName: `${parentFirstName} ${parentLastName}`.trim(),
            email: formData.get("email"),
            phone: formData.get("phone"),
            students: students,
            sessionType: formData.get("sessionType"),
            sessionLabel: sessionLabel,
            country: formData.get("country"),
            streetAddress: formData.get("streetAddress"),
            city: formData.get("city"),
            state: formData.get("state"),
            zipCode: formData.get("zipCode"),
            additionalInfo: formData.get("additionalInfo"),
            privacyAgreed: agreed,
            photoConsent: photoConsent,
            futureContact: futureContact,
        };

        try {
            // Submit to Google Apps Script.
            // Use text/plain to avoid a CORS preflight so we can read the response.
            const response = await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(appsScriptData),
            });

            const result = response.ok ? await response.json() : null;

            if (result && result.success) {
                setSubmitted(true);
                setShowToast(true);
                const shouldDonate = donationAmount > 0;
                const donateAmt = donationAmount;
                e.target.reset();
                setAgreed(false);
                setPhotoConsent(false);
                setFutureContact(false);
                setStudents([emptyStudent()]);
                setDonationAmount(5);
                setParentFirstName("");
                setParentLastName("");
                // Refresh enrollment counts
                fetch("/api/sessions/enrollment")
                    .then(r => r.json())
                    .then(data => setEnrollmentCounts(data))
                    .catch(() => {});
                if (shouldDonate) {
                    setTimeout(() => {
                        window.location.href = `/donate?amount=${donateAmt}`;
                    }, 2500);
                } else {
                    document.getElementById("register-success")?.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                setError((result && result.error) || "Failed to submit registration. Please try again.");
            }
        } catch (err) {
            console.error("Registration form error:", err);
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className={s.page}>
            {/* Header */}
            <section className={s.hero}>
                <div className="container">
                    <div className={s.heroBadge}>
                        <EventIcon fontSize="small" /> Limited Spots Available
                    </div>
                    <h1 className={s.heroTitle}>Register for a Session</h1>
                    <p className={s.heroSub}>
                        Sign up your child for our upcoming speech & debate sessions and watch them grow into confident communicators.
                    </p>
                </div>
            </section>

            <div className="container">
                {/* Card: left rail + form */}
                <section className={s.card}>
                    {/* LEFT RAIL */}
                    <aside className={s.info}>
                        <div className={s.block}>
                            <div className={s.iconCircle}>
                                <PersonIcon />
                            </div>
                            <h3>Who Can Join?</h3>
                            <p className={s.muted}>
                                This free workshop is open to kids ages 5 to 15, anywhere in the world. No experience needed — all levels welcome!
                            </p>
                        </div>

                        <div className={s.block}>
                            <div className={s.iconCircle}>
                                <SchoolIcon />
                            </div>
                            <h3>What You'll Learn</h3>
                            <p className={s.muted}>
                                The fundamentals of public speaking — how to speak clearly and confidently, overcome nervousness, and present in front of others.
                            </p>
                        </div>

                        <div className={s.block}>
                            <div className={s.iconCircle}>
                                <EventIcon />
                            </div>
                            <h3>What to Expect</h3>
                            <p className={s.muted}>
                                Two 1-hour live sessions on Webex — Tuesday, July 21 & Thursday, July 23. Come to one or both days. We'll email your join link and reminders after you register.
                            </p>
                        </div>
                    </aside>

                    <div className={s.divider} aria-hidden="true" />

                    {/* RIGHT FORM */}
                    <form className={s.form} onSubmit={onSubmit}>
                        {error && (
                            <div className={s.errorBox}>
                                {error}
                            </div>
                        )}

                        {/* Step 1: Choose a session FIRST */}
                        <h2 className={s.formTitle}><EventIcon /> Choose a Session</h2>

                        {sessions.length > 0 ? (
                            <div className={s.field}>
                                <label>Which session are you registering for? <span className={s.req}>*</span></label>
                                <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "0 0 8px" }}>
                                    Not sure which session is right? <a href="/courses1" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Browse our upcoming sessions</a> to learn more.
                                </p>
                                <select
                                    name="sessionType"
                                    required
                                    disabled={isSubmitting}
                                    className={s.select}
                                    value={selectedSessionId}
                                    onChange={(e) => setSelectedSessionId(e.target.value)}
                                >
                                    <option value="">Select a session...</option>
                                    {sessions.map(ses => (
                                        <option key={ses.id} value={ses.id} disabled={ses.enrolled >= ses.capacity}>
                                            {ses.title} — {ses.date}{ses.enrolled >= ses.capacity ? " (Full)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: "center",
                                padding: "32px 24px",
                                backgroundColor: "#F9FAFB",
                                borderRadius: "12px",
                                border: "2px dashed #E5E7EB",
                            }}>
                                <p style={{ fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                                    No sessions are open for registration right now
                                </p>
                                <p style={{ color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 auto", maxWidth: "380px" }}>
                                    New sessions are announced regularly. <a href="/contact" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Contact us</a> to be the first to know!
                                </p>
                            </div>
                        )}

                        {selectedSession && (
                            <div style={{
                                background: "#F0F6FF",
                                border: "1px solid #BFDBFE",
                                borderRadius: "12px",
                                padding: "20px",
                                marginBottom: "8px",
                            }}>
                                <h4 style={{ margin: "0 0 12px", color: "#111827", fontSize: "1rem", fontWeight: 700 }}>
                                    {selectedSession.title}
                                </h4>
                                <p style={{ margin: "0 0 12px", color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.6 }}>
                                    {selectedSession.description}
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", fontSize: "0.85rem", color: "#374151" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <CalendarMonthIcon style={{ fontSize: 16, color: "#2563EB" }} /> {selectedSession.date}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <AccessTimeIcon style={{ fontSize: 16, color: "#2563EB" }} /> {selectedSession.time}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <PlaceIcon style={{ fontSize: 16, color: "#2563EB" }} /> {selectedSession.location}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <GroupsIcon style={{ fontSize: 16, color: "#2563EB" }} /> {selectedSession.grades}
                                    </span>
                                </div>
                                {selectedSession.status !== "Open" && (
                                    <p style={{ margin: "12px 0 0", fontSize: "0.85rem", color: "#DC2626", fontWeight: 600 }}>
                                        This session is full — submit your form to join the waitlist
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step 2: Only show the rest of the form after a session is selected */}
                        {selectedSession && (
                            <>
                                <h2 className={s.formTitle}><SchoolIcon /> Student Information</h2>

                                <div className={s.field}>
                                    <label>How many children are you registering? <span className={s.req}>*</span></label>
                                    <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "0 0 8px" }}>
                                        Registering multiple children? Add them all here — no need to fill out the form again!
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <button
                                            type="button"
                                            onClick={() => removeStudent(students.length - 1)}
                                            disabled={students.length <= 1 || isSubmitting}
                                            className={s.counterBtn}
                                        >
                                            <RemoveIcon style={{ fontSize: 20 }} />
                                        </button>
                                        <span style={{ fontSize: "1.25rem", fontWeight: 700, minWidth: "28px", textAlign: "center" }}>
                                            {students.length}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={addStudent}
                                            disabled={students.length >= 5 || students.length >= spotsRemaining || isSubmitting}
                                            className={s.counterBtn}
                                        >
                                            <AddIcon style={{ fontSize: 20 }} />
                                        </button>
                                    </div>
                                </div>

                                {students.map((student, index) => (
                                    <div key={index} className={s.studentBlock}>
                                        {students.length > 1 && (
                                            <div className={s.studentHeader}>
                                                <span className={s.studentLabel}>Child {index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeStudent(index)}
                                                    disabled={isSubmitting}
                                                    className={s.removeBtn}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        <div className={s.grid}>
                                            <div className={s.field}>
                                                <label>{students.length > 1 ? "First Name" : "Student First Name"} <span className={s.req}>*</span></label>
                                                <input
                                                    placeholder="First name"
                                                    required
                                                    disabled={isSubmitting}
                                                    value={student.firstName}
                                                    onChange={(e) => updateStudent(index, "firstName", e.target.value)}
                                                />
                                            </div>

                                            <div className={s.field}>
                                                <label>{students.length > 1 ? "Last Name" : "Student Last Name"} <span className={s.req}>*</span></label>
                                                <input
                                                    placeholder="Last name"
                                                    required
                                                    disabled={isSubmitting}
                                                    value={student.lastName}
                                                    onChange={(e) => updateStudent(index, "lastName", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className={s.field}>
                                            <label>Age <span className={s.req}>*</span></label>
                                            <select
                                                required
                                                disabled={isSubmitting}
                                                className={s.select}
                                                value={student.age}
                                                onChange={(e) => updateStudent(index, "age", e.target.value)}
                                            >
                                                <option value="">Select age...</option>
                                                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(age => (
                                                    <option key={age} value={String(age)}>{age} years old</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}

                                {students.length > 1 && students.length < 5 && students.length < spotsRemaining && (
                                    <button
                                        type="button"
                                        onClick={addStudent}
                                        disabled={isSubmitting}
                                        className={s.addChildBtn}
                                    >
                                        <AddIcon style={{ fontSize: 18 }} /> Add Another Child
                                    </button>
                                )}

                                <h2 className={s.formTitle}><PersonIcon /> Parent/Guardian Information</h2>

                                <div className={s.grid}>
                                    <div className={s.field}>
                                        <label>Parent/Guardian First Name <span className={s.req}>*</span></label>
                                        <input
                                            name="parentFirstName"
                                            placeholder="First name"
                                            required
                                            disabled={isSubmitting}
                                            value={parentFirstName}
                                            onChange={(e) => setParentFirstName(e.target.value)}
                                            style={hasNameConflict ? { borderColor: "#DC2626", boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)" } : undefined}
                                        />
                                    </div>

                                    <div className={s.field}>
                                        <label>Parent/Guardian Last Name <span className={s.req}>*</span></label>
                                        <input
                                            name="parentLastName"
                                            placeholder="Last name"
                                            required
                                            disabled={isSubmitting}
                                            value={parentLastName}
                                            onChange={(e) => setParentLastName(e.target.value)}
                                            style={hasNameConflict ? { borderColor: "#DC2626", boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)" } : undefined}
                                        />
                                    </div>
                                </div>
                                {hasNameConflict && (
                                    <div style={{
                                        background: "#FEF2F2",
                                        border: "1px solid #FECACA",
                                        borderRadius: "8px",
                                        padding: "10px 14px",
                                        marginTop: "-8px",
                                        marginBottom: "8px",
                                        color: "#B91C1C",
                                        fontSize: "0.85rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}>
                                        <InfoOutlinedIcon style={{ fontSize: 16 }} />
                                        Parent/guardian name cannot be the same as the child's name. Please enter the parent's actual name.
                                    </div>
                                )}

                                <div className={s.grid}>
                                    <div className={s.field}>
                                        <label>Email <span className={s.req}>*</span></label>
                                        <input name="email" type="email" placeholder="you@email.com" required disabled={isSubmitting} />
                                    </div>
                                </div>

                                <div className={s.grid}>
                                    <div className={s.field}>
                                        <label>Phone Number <span className={s.req}>*</span></label>
                                        <input name="phone" type="tel" placeholder="+1 (000) 000-0000" required disabled={isSubmitting} />
                                    </div>
                                </div>

                                {selectedSession.online ? (
                                    <div className={s.grid}>
                                        <div className={s.field}>
                                            <label>Country <span className={s.req}>*</span></label>
                                            <input name="country" placeholder="e.g. India, Singapore, United States" required disabled={isSubmitting} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className={s.formTitle}>
                                            <HomeIcon /> Mailing Address
                                        </h2>
                                        <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "-4px 0 16px", lineHeight: 1.5 }}>
                                            <InfoOutlinedIcon style={{ fontSize: 14, color: "#9CA3AF", verticalAlign: "middle", marginRight: "4px" }} />
                                            We send personalized welcome letters and certificates to our students by mail. Your address is never shared with third parties.
                                        </p>

                                        <div className={s.field}>
                                            <label>Street Address <span className={s.req}>*</span></label>
                                            <input name="streetAddress" placeholder="123 Main St" required disabled={isSubmitting} />
                                        </div>

                                        <div className={s.grid}>
                                            <div className={s.field}>
                                                <label>City <span className={s.req}>*</span></label>
                                                <input name="city" placeholder="San Jose" required disabled={isSubmitting} />
                                            </div>
                                            <div className={s.field}>
                                                <label>State <span className={s.req}>*</span></label>
                                                <input name="state" placeholder="CA" required disabled={isSubmitting} />
                                            </div>
                                        </div>

                                        <div className={s.grid}>
                                            <div className={s.field}>
                                                <label>ZIP Code <span className={s.req}>*</span></label>
                                                <input name="zipCode" placeholder="95120" required disabled={isSubmitting} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className={s.field}>
                                    <label>Additional Information</label>
                                    <textarea
                                        name="additionalInfo"
                                        rows="4"
                                        placeholder="Any special requirements, allergies, or information we should know..."
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Optional Donation */}
                                <div style={{
                                    background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)",
                                    border: "1px solid #FDE68A",
                                    borderRadius: "16px",
                                    padding: "24px",
                                    marginTop: "8px",
                                }}>
                                    <h2 className={s.formTitle} style={{ marginTop: 0, borderBottomColor: "#F59E0B" }}>
                                        <VolunteerActivismIcon style={{ color: "#F59E0B" }} /> Support Our Workshop
                                    </h2>
                                    <p style={{ fontSize: "0.9rem", color: "#6B7280", lineHeight: 1.7, margin: "0 0 16px" }}>
                                        This workshop is <strong>completely free</strong> — no donation is required to register. {selectedSession.online
                                            ? "However, a small $5–$10 contribution helps us cover the cost of hosting the workshop online over Webex. Every bit helps us keep these workshops free and accessible for families around the world!"
                                            : "However, a small $5–$10 contribution helps us cover the cost of the library room, materials, and supplies. Every bit helps us keep these workshops accessible for all families!"}
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                                        {[0, 5, 10].map(amt => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setDonationAmount(amt)}
                                                disabled={isSubmitting}
                                                style={{
                                                    flex: "1 1 80px",
                                                    padding: "12px 16px",
                                                    borderRadius: "12px",
                                                    border: donationAmount === amt ? "2px solid #F59E0B" : "2px solid #E5E7EB",
                                                    background: donationAmount === amt ? "#FEF3C7" : "#FFFFFF",
                                                    color: donationAmount === amt ? "#92400E" : "#374151",
                                                    fontWeight: 700,
                                                    fontSize: "1rem",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                {amt === 0 ? "No thanks" : `$${amt}`}
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: "0.8rem", color: "#9CA3AF", margin: 0, textAlign: "center" }}>
                                        {donationAmount > 0
                                            ? "Thank you for your generosity! You'll be directed to complete your donation after registering."
                                            : "No worries at all — your spot is secured either way!"}
                                    </p>
                                </div>

                                <div className={s.actions}>
                                    {/* Checkbox 1 (optional): Photo/video consent */}
                                    <label className={s.check}>
                                        <input
                                            type="checkbox"
                                            checked={photoConsent}
                                            onChange={(e) => setPhotoConsent(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        <span>
                                            I give permission for Almaden Voices to photograph or record my child for promotional use.
                                        </span>
                                    </label>

                                    {/* Checkbox 2 (optional): Future contact opt-in */}
                                    <label className={s.check}>
                                        <input
                                            type="checkbox"
                                            checked={futureContact}
                                            onChange={(e) => setFutureContact(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        <span>
                                            I would like to be contacted about future Almaden Voices sessions and events.
                                        </span>
                                    </label>

                                    {/* Checkbox 3 (required): Privacy Policy + Terms */}
                                    <label className={s.check}>
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        <span>
                                            I have read and agree to the Almaden Voices <a className={s.link} href="/docs/privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy <OpenInNewIcon style={{ fontSize: 14, verticalAlign: 'middle' }} /></a> and <a className={s.link} href="/docs/terms-of-service.html" target="_blank" rel="noopener noreferrer">Terms of Service <OpenInNewIcon style={{ fontSize: 14, verticalAlign: 'middle' }} /></a>. <span className={s.req}>*</span>
                                        </span>
                                    </label>

                                    <button className={s.btn} disabled={!agreed || isSubmitting || hasNameConflict}>
                                        <span>{isSubmitting ? "Submitting..." : students.length > 1 ? `Register ${students.length} Children` : "Register Now"}</span>
                                        <SendIcon fontSize="small" />
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </section>

                {/* Success message */}
                {submitted && (
                    <section id="register-success" className={s.success}>
                        <h2>Registration Confirmed!</h2>
                        <p>Thank you for registering! Your spot is confirmed. A confirmation email with workshop details has been sent to your email.</p>
                    </section>
                )}
            </div>

            {/* Toast */}
            <div className={`${s.toast} ${showToast ? s.toastShow : ""}`} onAnimationEnd={() => setShowToast(false)}>
                Registration submitted! Check your email for confirmation.
            </div>
        </div>
    );
}
