import React, { useMemo, useRef, useState, useEffect } from "react";
import s from "./FAQ.module.css";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CATEGORIES, FAQS } from "./faqData";

export default function FAQPage(){
    const [query, setQuery] = useState("");
    const [activeCat, setActiveCat] = useState("all");
    const [openId, setOpenId] = useState(null);
    const listRef = useRef(null);

    useEffect(() => {
        const h = (window.location.hash || "").replace("#faq-", "");
        if (h) setOpenId(h);
    }, []);

    const filteredFaqs = useMemo(() => {
        const q = query.trim().toLowerCase();
        return FAQS.filter(i => {
            const inCat = activeCat === "all" || i.cat === activeCat;
            if (!q) return inCat;
            return inCat && (i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q));
        });
    }, [query, activeCat]);

    const scrollToList = () => listRef.current?.scrollIntoView({ behavior: "smooth" });

    return (
        <section className={s.section}>
            {/* Hero band */}
            <div className={s.hero}>
                <div className="container">
                    <h1 className={s.hTitle}>Hello. How can we help you?</h1>
                    <div className={s.searchWrap}>
                        <SearchIcon className={s.searchIcon} />
                        <input
                            value={query}
                            onChange={(e)=>setQuery(e.target.value)}
                            placeholder="Search for answers"
                            className={s.search}
                        />
                    </div>
                </div>
            </div>

            {/* Category filter pills */}
            <div className="container" style={{ paddingTop: 'clamp(18px, 3vw, 30px)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    <button
                        className={`${s.catPill} ${activeCat==="all" ? s.catPillActive : ""}`}
                        onClick={()=> setActiveCat("all")}
                    >
                        All
                    </button>
                    {CATEGORIES.map(c => (
                        <button
                            key={c.id}
                            className={`${s.catPill} ${activeCat===c.id ? s.catPillActive : ""}`}
                            onClick={()=>{ setActiveCat(c.id); scrollToList(); }}
                        >
                            {c.icon} {c.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grouped FAQ list */}
            <div className="container" ref={listRef} style={{ paddingTop: 'clamp(18px, 3vw, 30px)' }}>
                {activeCat === "all" ? (
                    CATEGORIES.map(cat => {
                        const catFaqs = filteredFaqs.filter(f => f.cat === cat.id);
                        if (!catFaqs.length) return null;
                        return (
                            <div key={cat.id} style={{ marginBottom: '32px' }}>
                                <h2 style={{
                                    fontSize: 'clamp(18px, 1.4vw, 22px)', fontWeight: 800, color: '#111827',
                                    margin: '0 0 12px', paddingBottom: '8px', borderBottom: '2px solid #E5E7EB',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}>
                                    <span>{cat.icon}</span> {cat.title}
                                </h2>
                                <div className={s.list}>
                                    {catFaqs.map(i => (
                                        <article key={i.id} id={`faq-${i.id}`} className={s.item}>
                                            <button
                                                className={s.summary}
                                                onClick={()=>{
                                                    setOpenId(prev=> prev===i.id ? null : i.id);
                                                    window.history.replaceState(null, "", `#faq-${i.id}`);
                                                }}
                                                aria-expanded={openId===i.id}
                                            >
                                                <span className={s.q}>{i.q}</span>
                                                <ExpandMoreIcon className={`${s.chev} ${openId===i.id ? s.rot : ""}`} />
                                            </button>
                                            <div className={s.panel} style={{ maxHeight: openId===i.id ? "2000px" : 0 }}>
                                                <p className={s.a}>{i.a}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <>
                        <div className={s.listHead}>
                            <div className={s.meta}>
                                {CATEGORIES.find(x=>x.id===activeCat)?.title}
                                {" · "}
                                {filteredFaqs.length} answer{filteredFaqs.length!==1?"s":""}
                            </div>
                        </div>
                        <div className={s.list}>
                            {filteredFaqs.map(i => (
                                <article key={i.id} id={`faq-${i.id}`} className={s.item}>
                                    <button
                                        className={s.summary}
                                        onClick={()=>{
                                            setOpenId(prev=> prev===i.id ? null : i.id);
                                            window.history.replaceState(null, "", `#faq-${i.id}`);
                                        }}
                                        aria-expanded={openId===i.id}
                                    >
                                        <span className={s.q}>{i.q}</span>
                                        <ExpandMoreIcon className={`${s.chev} ${openId===i.id ? s.rot : ""}`} />
                                    </button>
                                    <div className={s.panel} style={{ maxHeight: openId===i.id ? "2000px" : 0 }}>
                                        <p className={s.a}>{i.a}</p>
                                    </div>
                                </article>
                            ))}
                            {!filteredFaqs.length && (
                                <div className={s.empty}>
                                    No results. Try different keywords or <a className={s.link} href="/contact">contact us</a>.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Friendly CTA */}
            <div className={s.ctaBand}>
                <div className="container">
                    <div className={s.cta}>
                        <div>
                            <h3 className={s.ctaTitle}>Still need help?</h3>
                            <p className={s.ctaText}>If you didn’t find what you were looking for, our team is happy to help.</p>
                        </div>
                        <a className={s.ctaBtn} href="/contact">Contact Us</a>
                    </div>
                </div>
            </div>
        </section>
    );
}
