import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MAIN_PAGES, sectionHref, visibleSections } from "../../data/siteNav";
import s from "./Footer.module.css";

const HELP_LINKS = [
    { label: "FAQ", to: "/faq" },
    { label: "Contact us", to: "/contact" },
    { label: "Register", to: "/register" },
    { label: "Donate", to: "/donate" },
];

const DOCUMENTS = [
    { label: "IRS 501(c)(3) determination letter", href: "/docs/irs-letter-947-confirmation-of-501c3-status.pdf" },
    { label: "Articles of incorporation", href: "/docs/articles-of-incorporation.pdf" },
    { label: "Terms of service", href: "/docs/terms-of-service.html" },
    { label: "Privacy policy", href: "/docs/privacy-policy.html" },
];

function NewsletterSignup() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle | sending | done | error
    const [message, setMessage] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setStatus("error");
            setMessage("Please enter a valid email address.");
            return;
        }
        setStatus("sending");
        setMessage("");
        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                setStatus("done");
                setMessage(data.message || "Thanks. You're on the list.");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "That didn't go through. Please try again.");
            }
        } catch (err) {
            console.error("Subscribe error:", err);
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    }

    return (
        <form className={s.signup} onSubmit={onSubmit} noValidate>
            <h2 className={s.signupTitle}>Hear about the next workshop</h2>
            <p className={s.signupText}>
                One email a month, with new sessions and what our students have been up to.
            </p>
            <div className={s.signupRow}>
                <label htmlFor="footer-email" className={s.visuallyHidden}>Email address</label>
                <input
                    id="footer-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "sending"}
                    className={s.input}
                    aria-describedby={message ? "footer-email-status" : undefined}
                />
                <button type="submit" className={s.submit} disabled={status === "sending"}>
                    {status === "sending" ? "Subscribing..." : "Subscribe"}
                </button>
            </div>
            <p
                id="footer-email-status"
                role="status"
                className={`${s.status} ${status === "error" ? s.statusError : ""}`}
            >
                {message}
            </p>
        </form>
    );
}

export default function Footer() {
    return (
        <footer className={s.footer}>
            <div className={s.inner}>
                <div className={s.top}>
                    <div className={s.about}>
                        <Link to="/" aria-label="Almaden Voices home">
                            <img src="/almaden_voices_logo_transparent.png" alt="" className={s.logo} />
                        </Link>
                        <p className={s.aboutText}>
                            Almaden Voices is a registered 501(c)(3) nonprofit in San José, California.
                            Donations are tax-deductible to the fullest extent allowed by law.
                        </p>
                        <p className={s.aboutText}>
                            <a href="mailto:almadenvoices@gmail.com">almadenvoices@gmail.com</a>
                        </p>
                    </div>
                    <NewsletterSignup />
                </div>

                <nav aria-label="Footer" className={s.columns}>
                    {MAIN_PAGES.map((page) => (
                        <div key={page.key}>
                            <h2 className={s.colTitle}>
                                <Link to={page.path}>{page.label}</Link>
                            </h2>
                            <ul className={s.list}>
                                {visibleSections(page).map((section) => (
                                    <li key={section.id}>
                                        <Link to={sectionHref(page, section)}>{section.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div>
                        <h2 className={s.colTitle}>Help</h2>
                        <ul className={s.list}>
                            {HELP_LINKS.map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className={s.bottom}>
                    <p className={s.legal}>
                        © {new Date().getFullYear()} Almaden Voices. EIN 39-4978818.
                    </p>
                    <ul className={s.docs}>
                        {DOCUMENTS.map((doc) => (
                            <li key={doc.href}>
                                <a href={doc.href} target="_blank" rel="noopener noreferrer">
                                    {doc.label}
                                    <span className={s.visuallyHidden}> (opens in a new tab)</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
}
