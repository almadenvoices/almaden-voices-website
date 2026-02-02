import React, { useState } from "react";
import s from "./Contact.module.css";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";

export default function ContactPage() {
    const [agreed, setAgreed] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmationNumber, setConfirmationNumber] = useState("");
    const [error, setError] = useState("");

    async function onSubmit(e){
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const formData = new FormData(e.target);
        const data = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            country: formData.get("country"),
            message: formData.get("message")
        };

        try {
            const response = await fetch("/api/contact", {
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
                document.getElementById("contact-success")?.scrollIntoView({ behavior: "smooth" });
            } else {
                setError(result.error || "Failed to send message. Please try again.");
            }
        } catch (err) {
            console.error("Contact form error:", err);
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className={s.page}>
            {/* Header (optional; hide if you want the pure card view) */}
            <section className={s.hero}>
                <div className="container">
                    <h1 className={s.heroTitle}>Get in touch</h1>
                    <p className={s.heroSub}>
                        We&apos;d love to hear from you. Our friendly team is always here to chat.
                    </p>
                </div>
            </section>
            <div className="container">
                {/* Card: left rail + form */}
                <section className={s.card}>
                    {/* LEFT RAIL */}
                    <aside className={s.info}>
                        <div className={s.block}>
                            <h3>Chat to us</h3>
                            <p className={s.muted}>Our friendly team is here to help.</p>
                            <div className={s.row}>
                                <EmailIcon fontSize="small" />
                                <a href="mailto:almadenvoices@gmail.com" className={s.link}>almadenvoices@gmail.com</a>
                            </div>
                        </div>

                    </aside>

                    <div className={s.divider} aria-hidden="true" />

                    {/* RIGHT FORM */}
                    <form className={s.form} onSubmit={onSubmit}>
                        {error && (
                            <div style={{
                                backgroundColor: "#fee",
                                border: "1px solid #fcc",
                                color: "#c00",
                                padding: "12px",
                                borderRadius: "6px",
                                marginBottom: "16px"
                            }}>
                                {error}
                            </div>
                        )}

                        <div className={`${s.grid} ${s.grid3}`}>
                            <div className={s.field}>
                                <label>First name <span className={s.req}>*</span></label>
                                <input name="firstName" placeholder="First name" required disabled={isSubmitting} />
                            </div>

                            <div className={s.field}>
                                <label>Last name <span className={s.req}>*</span></label>
                                <input name="lastName" placeholder="Last name" required disabled={isSubmitting} />
                            </div>

                            <div className={`${s.field} ${s.fullWidth}`}>
                                <label>Email <span className={s.req}>*</span></label>
                                <input name="email" type="email" placeholder="you@company.com" required disabled={isSubmitting} />
                            </div>
                        </div>

                        {/* Phone (country + number) */}
                        <div className={`${s.grid} ${s.grid1}`}>
                            <div className={s.field}>
                                <label>Phone number</label>
                                <div className={s.phoneRow}>
                                    <select name="country" defaultValue="US" aria-label="Country" className={s.select} disabled={isSubmitting}>
                                        <option value="US">US</option>
                                        <option value="CA">CA</option>
                                        <option value="IN">IN</option>
                                        <option value="UK">UK</option>
                                    </select>
                                    <input name="phone" type="tel" placeholder="+1 (000) 000-0000" disabled={isSubmitting} />
                                </div>
                            </div>
                        </div>

                        <div className={`${s.grid} ${s.grid1}`}>
                            <div className={s.field}>
                                <label>Message <span className={s.req}>*</span></label>
                                <textarea name="message" rows="6" placeholder="Leave us a message..." required disabled={isSubmitting} />
                            </div>
                        </div>

                        <div className={`${s.grid} ${s.actions}`}>
                            <label className={s.check}>
                                <input type="checkbox" checked={agreed} onChange={(e)=>setAgreed(e.target.checked)} disabled={isSubmitting} />
                                <span>
                  You agree to our friendly <a className={s.link} href="/docs/privacy-policy.html" target="_blank" rel="noopener noreferrer">privacy policy</a>.
                </span>
                            </label>
                            <button className={`${s.btn} ${s.btnPrimary}`} disabled={!agreed || isSubmitting}>
                                <span>{isSubmitting ? "Sending..." : "Send message"}</span>
                                <SendIcon fontSize="small" />
                            </button>
                        </div>
                    </form>
                </section>

                {/* Success message (below card) */}
                {confirmationNumber && (
                    <section id="contact-success" className={s.success} style={{
                        backgroundColor: "#f0f9ff",
                        border: "2px solid #0ea5e9",
                        padding: "24px",
                        borderRadius: "12px",
                        marginTop: "24px",
                        textAlign: "center"
                    }}>
                        <h2 style={{ color: "#0369a1", marginBottom: "16px" }}>✓ Message Sent Successfully!</h2>
                        <p style={{ marginBottom: "16px" }}>Thank you for reaching out. We&apos;ve received your message and will get back to you within 24–48 hours.</p>
                        <div style={{
                            backgroundColor: "white",
                            padding: "16px",
                            borderRadius: "8px",
                            display: "inline-block"
                        }}>
                            <p style={{ marginBottom: "8px", fontWeight: "600", color: "#333" }}>Your Confirmation Number:</p>
                            <p style={{
                                fontSize: "24px",
                                fontFamily: "monospace",
                                color: "#0369a1",
                                fontWeight: "bold",
                                letterSpacing: "2px"
                            }}>{confirmationNumber}</p>
                            <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>Please save this number for your records</p>
                        </div>
                    </section>
                )}

                {/* Map (optional copy) */}
                {/*<section className={s.mapCard}>*/}
                {/*    <div className={s.map}>*/}
                {/*        <iframe title="Almaden Voices Area" width="100%" height="100%" style={{ border: 0 }}*/}
                {/*                loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"*/}
                {/*                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3173.1303!2d-121.891!3d37.226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e33!2sAlmaden%20Valley%2C%20San%20Jose%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000"*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*    <div className={s.mapCopy}>*/}
                {/*        <h3>Visit our area</h3>*/}
                {/*        <p className={s.muted}>We host programs around Almaden Valley, San Jose. Exact locations are shared after enrollment.</p>*/}
                {/*        <hr />*/}
                {/*        <p className={`${s.muted} ${s.small}`}>Parking and accessibility details are provided with each session reminder.</p>*/}
                {/*    </div>*/}
                {/*</section>*/}
            </div>

            {/* Toast */}
            <div className={`${s.toast} ${showToast ? s.toastShow : ""}`} onAnimationEnd={()=>setShowToast(false)}>
                ✓ Message sent! Confirmation: {confirmationNumber}
            </div>
        </div>
    );
}
