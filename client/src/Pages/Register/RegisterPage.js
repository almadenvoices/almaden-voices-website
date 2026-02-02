import React, { useState } from "react";
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

const upcomingSessions = [
    {
        id: "intro-public-speaking",
        title: "Introduction to Public Speaking",
        date: "December 15, 2024",
        time: "10:00 AM – 11:30 AM",
        location: "Almaden Community Center",
        grades: "Grades 2–5",
        capacity: 12,
        enrolled: 8,
        description: "Learn the basics of voice projection, eye contact, and overcoming stage fright through fun activities. Ends with a final showcase for parents.",
        status: "Open",
    },
    {
        id: "adv-pronunciation",
        title: "Advanced Pronunciation Workshop",
        date: "December 22, 2024",
        time: "2:00 PM – 3:30 PM",
        location: "Online via Zoom",
        grades: "Grades 5–8",
        capacity: 15,
        enrolled: 12,
        description: "Build on foundational skills with persuasive speaking, impromptu drills, and audience Q&A practice. Ends with a final showcase for parents.",
        status: "Open",
    },
    {
        id: "storytime-speech",
        title: "Story Time & Speech Practice",
        date: "January 5, 2025",
        time: "11:00 AM – 12:00 PM",
        location: "Almaden Library",
        grades: "Grades 2–4",
        capacity: 10,
        enrolled: 10,
        description: "Interactive storytelling combined with speech exercises to improve language and presentation skills.",
        status: "Full",
    },
];

export default function RegisterPage() {
    const [agreed, setAgreed] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmationNumber, setConfirmationNumber] = useState("");
    const [error, setError] = useState("");
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const selectedSession = upcomingSessions.find(ses => ses.id === selectedSessionId);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const formData = new FormData(e.target);
        const data = {
            studentFirstName: formData.get("studentFirstName"),
            studentLastName: formData.get("studentLastName"),
            gradeLevel: formData.get("gradeLevel"),
            parentName: formData.get("parentName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            sessionType: formData.get("sessionType"),
            streetAddress: formData.get("streetAddress"),
            city: formData.get("city"),
            state: formData.get("state"),
            zipCode: formData.get("zipCode"),
            additionalInfo: formData.get("additionalInfo")
        };

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                setConfirmationNumber(result.confirmationNumber);
                setShowToast(true);
                e.target.reset();
                setAgreed(false);
                document.getElementById("register-success")?.scrollIntoView({ behavior: "smooth" });
            } else {
                setError(result.error || "Failed to submit registration. Please try again.");
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
                                Students in grades 2-8 are welcome. Programs vary by grade level — specific eligibility is listed for each session.
                            </p>
                        </div>

                        <div className={s.block}>
                            <div className={s.iconCircle}>
                                <SchoolIcon />
                            </div>
                            <h3>Session Types</h3>
                            <p className={s.muted}>
                                We offer Beginner, Advanced, and Debate sessions. Choose one from the dropdown to see full details.
                            </p>
                        </div>

                        <div className={s.block}>
                            <div className={s.iconCircle}>
                                <EventIcon />
                            </div>
                            <h3>What to Expect</h3>
                            <p className={s.muted}>
                                Sessions run 4–6 weeks and end with a final showcase for parents. You'll receive schedule details after registration.
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
                                {upcomingSessions.map(ses => (
                                    <option key={ses.id} value={ses.id} disabled={ses.status === "Full"}>
                                        {ses.title} — {ses.date}{ses.status === "Full" ? " (Full)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                {selectedSession.status === "Open" ? (
                                    <p style={{ margin: "12px 0 0", fontSize: "0.85rem", color: "#059669", fontWeight: 600 }}>
                                        {selectedSession.capacity - selectedSession.enrolled} spots remaining
                                    </p>
                                ) : (
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

                                <div className={s.grid}>
                                    <div className={s.field}>
                                        <label>Student First Name <span className={s.req}>*</span></label>
                                        <input name="studentFirstName" placeholder="First name" required disabled={isSubmitting} />
                                    </div>

                                    <div className={s.field}>
                                        <label>Student Last Name <span className={s.req}>*</span></label>
                                        <input name="studentLastName" placeholder="Last name" required disabled={isSubmitting} />
                                    </div>
                                </div>

                                <div className={s.field}>
                                    <label>Grade Level <span className={s.req}>*</span></label>
                                    <select name="gradeLevel" required disabled={isSubmitting} className={s.select}>
                                        <option value="">Select grade...</option>
                                        <option value="2">2nd Grade</option>
                                        <option value="3">3rd Grade</option>
                                        <option value="4">4th Grade</option>
                                        <option value="5">5th Grade</option>
                                        <option value="6">6th Grade</option>
                                        <option value="7">7th Grade</option>
                                        <option value="8">8th Grade</option>
                                    </select>
                                </div>

                                <h2 className={s.formTitle}><PersonIcon /> Parent/Guardian Information</h2>

                                <div className={s.grid}>
                                    <div className={s.field}>
                                        <label>Parent/Guardian Name <span className={s.req}>*</span></label>
                                        <input name="parentName" placeholder="Full name" required disabled={isSubmitting} />
                                    </div>

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

                                <div className={s.field}>
                                    <label>Additional Information</label>
                                    <textarea
                                        name="additionalInfo"
                                        rows="4"
                                        placeholder="Any special requirements, allergies, or information we should know..."
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className={s.actions}>
                                    <label className={s.check}>
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        <span>
                                            I agree to the <a className={s.link} href="/docs/terms-of-service.html" target="_blank" rel="noopener noreferrer">terms of service</a> and <a className={s.link} href="/docs/privacy-policy.html" target="_blank" rel="noopener noreferrer">privacy policy</a>.
                                        </span>
                                    </label>
                                    <button className={s.btn} disabled={!agreed || isSubmitting}>
                                        <span>{isSubmitting ? "Submitting..." : "Register Now"}</span>
                                        <SendIcon fontSize="small" />
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </section>

                {/* Success message */}
                {confirmationNumber && (
                    <section id="register-success" className={s.success}>
                        <h2>Registration Submitted Successfully!</h2>
                        <p>Thank you for registering. We've received your submission and will contact you within 2-3 business days with session details.</p>
                        <div className={s.confirmationBox}>
                            <p className={s.confirmLabel}>Your Confirmation Number:</p>
                            <p className={s.confirmNumber}>{confirmationNumber}</p>
                            <p className={s.confirmNote}>Please save this number for your records</p>
                        </div>
                    </section>
                )}
            </div>

            {/* Toast */}
            <div className={`${s.toast} ${showToast ? s.toastShow : ""}`} onAnimationEnd={() => setShowToast(false)}>
                Registration submitted! Confirmation: {confirmationNumber}
            </div>
        </div>
    );
}
