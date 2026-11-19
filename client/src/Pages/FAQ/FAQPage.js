import React from "react";
import { Link } from "react-router-dom";
import usePageMeta from "../../hooks/usePageMeta";
import { GROUPS, FAQS } from "./faqData";
import p from "../../styles/page.module.css";
import s from "./FAQ.module.css";

export default function FAQPage() {
    usePageMeta("FAQ", "Answers to common questions about Almaden Voices: who can join, what it costs, how to sign up and where sessions are held.");
    const openFromHash = (typeof window !== "undefined" ? window.location.hash : "").replace("#faq-", "");

    return (
        <section className={p.section}>
            <div className={p.narrow}>
                <h1 className={s.title}>Questions families ask</h1>
                {GROUPS.map((group) => (
                    <div key={group.id} className={s.group}>
                        <h2 className={s.groupTitle}>{group.title}</h2>
                        {FAQS.filter((f) => f.group === group.id).map((f) => (
                            <details key={f.id} id={`faq-${f.id}`} className={s.item} open={openFromHash === f.id}>
                                <summary className={s.q}>{f.q}</summary>
                                <p className={s.a}>{f.a}</p>
                            </details>
                        ))}
                    </div>
                ))}
                <p className={s.more}>
                    Didn't find it? <Link to="/contact" className={p.textLink}>Send us a message</Link>
                </p>
            </div>
        </section>
    );
}
