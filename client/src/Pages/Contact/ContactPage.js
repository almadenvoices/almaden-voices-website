import React, { useState } from "react";
import s from "./Contact.module.css";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function ContactPage() {
    const [agreed, setAgreed] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmationNumber, setConfirmationNumber] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    function validate(data) {
        const errors = {};
        if (!data.firstName.trim()) errors.firstName = "First name is required.";
        if (!data.lastName.trim()) errors.lastName = "Last name is required.";
        if (!data.email.trim()) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = "Please enter a valid email address.";
        }
        if (data.phone && !/^[\d\s()+-]*$/.test(data.phone)) {
            errors.phone = "Please enter a valid phone number.";
        }
        if (!data.message.trim()) {
            errors.message = "Message is required.";
        } else if (data.message.trim().length < 10) {
            errors.message = "Message must be at least 10 characters.";
        }
        return errors;
    }

    async function onSubmit(e){
        e.preventDefault();
        setError("");
        setFieldErrors({});
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

        const errors = validate(data);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setIsSubmitting(false);
            return;
        }

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
                            <h3>Message us</h3>
                            <p className={s.muted}>Our friendly team is here to help.</p>
                            <div className={s.row}>
                                <EmailIcon fontSize="small" />
                                <a href="mailto:almadenvoices@gmail.com" className={s.link}>almadenvoices@gmail.com</a>
                            </div>
                        </div>

                    </aside>

                    <div className={s.divider} aria-hidden="true" />

                    {/* RIGHT FORM */}
                    <form className={s.form} onSubmit={onSubmit} style={{ position: 'relative' }}>
                        {confirmationNumber && (
                            <div className={s.successOverlay} style={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255,255,255,0.97)',
                                borderRadius: '12px',
                            }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    backgroundColor: '#ecfdf5', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 16,
                                }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h2 style={{ color: '#111827', fontSize: '22px', fontWeight: 700, marginBottom: 8 }}>Message Sent!</h2>
                                <p style={{ color: '#6B7280', marginBottom: 20, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
                                    Thank you for reaching out. We'll get back to you within 24–48 hours.
                                </p>
                                <div style={{
                                    backgroundColor: '#f0f9ff', padding: '14px 24px',
                                    borderRadius: 8, textAlign: 'center',
                                }}>
                                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Confirmation Number</p>
                                    <p style={{
                                        fontSize: 20, fontFamily: 'monospace',
                                        color: '#0369a1', fontWeight: 700, letterSpacing: 2,
                                    }}>{confirmationNumber}</p>
                                </div>
                                <button type="button" onClick={() => setConfirmationNumber("")} style={{
                                    marginTop: 24, padding: '10px 28px', border: '1px solid #d1d5db',
                                    borderRadius: 8, backgroundColor: 'white', color: '#374151',
                                    cursor: 'pointer', fontSize: 14, fontWeight: 500,
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                                >Send another message</button>
                            </div>
                        )}
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
                                <input name="firstName" placeholder="First name" required disabled={isSubmitting} style={fieldErrors.firstName ? { borderColor: '#c00' } : {}} />
                                {fieldErrors.firstName && <span style={{ color: '#c00', fontSize: '13px', marginTop: '4px' }}>{fieldErrors.firstName}</span>}
                            </div>

                            <div className={s.field}>
                                <label>Last name <span className={s.req}>*</span></label>
                                <input name="lastName" placeholder="Last name" required disabled={isSubmitting} style={fieldErrors.lastName ? { borderColor: '#c00' } : {}} />
                                {fieldErrors.lastName && <span style={{ color: '#c00', fontSize: '13px', marginTop: '4px' }}>{fieldErrors.lastName}</span>}
                            </div>

                            <div className={`${s.field} ${s.fullWidth}`}>
                                <label>Email <span className={s.req}>*</span></label>
                                <input name="email" type="email" placeholder="you@company.com" required disabled={isSubmitting} style={fieldErrors.email ? { borderColor: '#c00' } : {}} />
                                {fieldErrors.email && <span style={{ color: '#c00', fontSize: '13px', marginTop: '4px' }}>{fieldErrors.email}</span>}
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
                                    <input name="phone" type="tel" placeholder="(000) 000-0000" disabled={isSubmitting} style={fieldErrors.phone ? { borderColor: '#c00' } : {}} />
                                </div>
                                {fieldErrors.phone && <span style={{ color: '#c00', fontSize: '13px', marginTop: '4px' }}>{fieldErrors.phone}</span>}
                            </div>
                        </div>

                        <div className={`${s.grid} ${s.grid1}`}>
                            <div className={s.field}>
                                <label>Message <span className={s.req}>*</span></label>
                                <textarea name="message" rows="3" placeholder="Leave us a message..." required disabled={isSubmitting} style={fieldErrors.message ? { borderColor: '#c00' } : {}} />
                                {fieldErrors.message && <span style={{ color: '#c00', fontSize: '13px', marginTop: '4px' }}>{fieldErrors.message}</span>}
                            </div>
                        </div>

                        <div className={`${s.grid} ${s.actions}`}>
                            <label className={s.check}>
                                <input type="checkbox" checked={agreed} onChange={(e)=>setAgreed(e.target.checked)} disabled={isSubmitting} />
                                <span>
                  You agree to our friendly <a className={s.link} href="/docs/privacy-policy.html" target="_blank" rel="noopener noreferrer">privacy policy <OpenInNewIcon style={{ fontSize: 14, verticalAlign: 'middle' }} /></a>.
                </span>
                            </label>
                            <button className={`${s.btn} ${s.btnPrimary}`} disabled={!agreed || isSubmitting}>
                                <span>{isSubmitting ? "Sending..." : "Send message"}</span>
                                <SendIcon fontSize="small" />
                            </button>
                        </div>
                    </form>
                </section>


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
