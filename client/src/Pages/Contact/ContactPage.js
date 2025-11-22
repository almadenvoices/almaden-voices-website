import React, { useState } from "react";
import s from "./Contact.module.css";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SmsIcon from "@mui/icons-material/Sms";

export default function ContactPage() {
    const [agreed, setAgreed] = useState(false);
    const [showToast, setShowToast] = useState(false);

    function onSubmit(e){
        e.preventDefault();
        setShowToast(true);
        document.getElementById("contact-success")?.scrollIntoView({ behavior: "smooth" });
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
                                <a href="mailto:info@almadenvoices.org" className={s.link}>info@almadenvoices.org</a>
                            </div>
                        </div>

                        <div className={s.block}>
                            <h3>Office</h3>
                            <p className={s.muted}>Come say hello at our office HQ.</p>
                            <div className={s.row}>
                                <LocationOnIcon fontSize="small" />
                                <div>
                                    <div className={s.link} style={{ textDecoration: "none" }}>100 Smith Street</div>
                                    <div className={s.link} style={{ textDecoration: "none" }}>Almaden Valley, San Jose CA</div>
                                </div>
                            </div>
                        </div>

                        <div className={s.block}>
                            <h3>Phone</h3>
                            <p className={s.muted}>Mon–Fri from 8am to 5pm.</p>
                            <div className={s.row}>
                                <PhoneIcon fontSize="small" />
                                <span className={s.strong}>+1 (555) 000-0000</span>
                            </div>
                        </div>
                    </aside>

                    <div className={s.divider} aria-hidden="true" />

                    {/* RIGHT FORM */}
                    <form className={s.form} onSubmit={onSubmit}>
                        <div className={`${s.grid} ${s.grid3}`}>
                            <div className={s.field}>
                                <label>First name <span className={s.req}>*</span></label>
                                <input placeholder="First name" required />
                            </div>

                            <div className={s.field}>
                                <label>Last name <span className={s.req}>*</span></label>
                                <input placeholder="Last name" required />
                            </div>

                            <div className={`${s.field} ${s.fullWidth}`}>
                                <label>Email <span className={s.req}>*</span></label>
                                <input type="email" placeholder="you@company.com" required />
                            </div>
                        </div>

                        {/* Phone (country + number) */}
                        <div className={`${s.grid} ${s.grid1}`}>
                            <div className={s.field}>
                                <label>Phone number</label>
                                <div className={s.phoneRow}>
                                    <select defaultValue="US" aria-label="Country" className={s.select}>
                                        <option value="US">US</option>
                                        <option value="CA">CA</option>
                                        <option value="IN">IN</option>
                                        <option value="UK">UK</option>
                                    </select>
                                    <input type="tel" placeholder="+1 (000) 000-0000" />
                                </div>
                            </div>
                        </div>

                        <div className={`${s.grid} ${s.grid1}`}>
                            <div className={s.field}>
                                <label>Message <span className={s.req}>*</span></label>
                                <textarea rows="6" placeholder="Leave us a message..." required />
                            </div>
                        </div>

                        <div className={`${s.grid} ${s.actions}`}>
                            <label className={s.check}>
                                <input type="checkbox" checked={agreed} onChange={(e)=>setAgreed(e.target.checked)} />
                                <span>
                  You agree to our friendly <a className={s.link} href="/privacy">privacy policy</a>.
                </span>
                            </label>
                            <button className={`${s.btn} ${s.btnPrimary}`} disabled={!agreed}>
                                <span>Send message</span>
                                <SendIcon fontSize="small" />
                            </button>
                        </div>
                    </form>
                </section>

                {/* Success message (below card) */}
                {/*<section id="contact-success" className={s.success}>*/}
                {/*    <h2>Thanks for reaching out</h2>*/}
                {/*    <p>We typically reply within 24–48 hours with dates and next steps.</p>*/}
                {/*</section>*/}

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

            {/* Floating actions (unchanged) */}
            <div className={s.float}>
                <a className={`${s.fab} ${s.whatsapp}`} href="https://wa.me/14080000000" target="_blank" rel="noopener noreferrer"><WhatsAppIcon /></a>
                <a className={`${s.fab} ${s.sms}`} href="sms:+14080000000"><SmsIcon /></a>
            </div>

            {/* Toast */}
            <div className={`${s.toast} ${showToast ? s.toastShow : ""}`} onAnimationEnd={()=>setShowToast(false)}>
                Thanks! Your message has been sent.
            </div>
        </div>
    );
}
