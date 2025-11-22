import React, { useMemo, useRef, useState, useEffect } from "react";
import s from "./FAQ.module.css";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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

            {/* Category cards with images */}
            <div className="container">
                <div className={s.grid}>
                    {CATEGORIES.map(c => (
                        <button
                            key={c.id}
                            className={`${s.card} ${activeCat===c.id ? s.cardActive : ""}`}
                            onClick={()=>{ setActiveCat(c.id); scrollToList(); }}
                        >
                            <div className={s.thumbWrap}>
                                <img className={s.thumb} src={c.image} alt={`${c.title} illustration`} />
                                <span className={s.iconBadge}>{c.icon}</span>
                            </div>
                            <div className={s.cardBody}>
                                <h3 className={s.cardTitle}>{c.title}</h3>
                                <p className={s.blurb}>{c.blurb}</p>
                                <span className={s.more}>
                  Explore <ArrowForwardIcon fontSize="small" />
                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Accordion list */}
            <div className="container" ref={listRef}>
                <div className={s.listHead}>
                    <div className={s.meta}>
                        {activeCat==="all" ? "All categories" : CATEGORIES.find(x=>x.id===activeCat)?.title}
                        {" · "}
                        {filteredFaqs.length} answer{filteredFaqs.length!==1?"s":""}
                    </div>
                    {activeCat!=="all" && (
                        <button className={s.clear} onClick={()=>setActiveCat("all")}>Show all</button>
                    )}
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
