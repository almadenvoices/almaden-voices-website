import React, { useMemo, useState, useEffect } from "react";
import s from "./Courses.module.css";
import { courses } from "./coursesData";

// optional icons (if you already use MUI icons)
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import GroupsIcon from "@mui/icons-material/Groups";
import BoltIcon from "@mui/icons-material/Bolt";

function formatRange(a, b){
    const to = (d)=> new Date(d).toLocaleDateString(undefined,{ month:"short", day:"numeric"});
    return `${to(a)} – ${to(b)}`;
}

function CourseCard({ c, dim=false }){
    return (
        <article className={`${s.card} ${dim ? s.dim : ""}`}>
            <div className={s.coverWrap}>
                <img src={c.cover} alt={c.title} />
                {c.badge && <span className={s.badge}>{c.badge}</span>}
                {c.status === "past" && <span className={s.ribbon}>Past</span>}
                {c.status === "current" && <span className={`${s.ribbon} ${s.ribbonCurrent}`}>Now Enrolling</span>}
            </div>

            <div className={s.body}>
                <h3 className={s.title}>{c.title}</h3>
                <p className={s.blurb}>{c.blurb}</p>

                <ul className={s.meta}>
                    <li><CalendarMonthIcon /> {formatRange(c.startDate, c.endDate)} · {c.dayTime}</li>
                    <li><PlaceIcon /> {c.location} · {c.format}</li>
                    <li><GroupsIcon /> Grades {c.grades} · {c.level}</li>
                </ul>

                <div className={s.row}>
                    <div className={s.price}>
                        <span className={s.currency}>$</span>
                        <span className={s.amount}>{c.price}</span>
                    </div>
                    <div className={s.tags}>
                        {c.seatsRemaining > 0
                            ? <span className={`${s.tag} ${s.tagOk}`}>{c.seatsRemaining} seats left</span>
                            : <span className={`${s.tag} ${s.tagFull}`}>Full</span>}
                        <span className={s.tag}>{c.format}</span>
                    </div>
                </div>

                <div className={s.actions}>
                    {c.status === "current" ? (
                        <a className={s.primary} href={c.ctaLink}>
                            <BoltIcon /> Enroll Now
                        </a>
                    ) : (
                        c.recapLink ? <a className={s.secondary} href={c.recapLink}>See Recap</a>
                            : <span className={s.secondaryDisabled}>Completed</span>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function CoursesPage(){
    const [tab, setTab] = useState("current");   // "current" | "past"
    const [q, setQ] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const { current, past } = useMemo(()=>{
        const sorted = [...courses].sort(
            (a,b)=> new Date(a.startDate) - new Date(b.startDate)
        );
        const filterQ = (list) => list.filter(c =>
            (c.title + c.blurb + c.location + c.level + c.grades)
                .toLowerCase().includes(q.toLowerCase())
        );
        return {
            current: filterQ(sorted.filter(c=>c.status==="current")),
            past:    filterQ(sorted.filter(c=>c.status==="past")).reverse()
        };
    }, [q]);

    const list = tab === "current" ? current : past;
    const features = [
        { title: "100% Free", description: "All sessions are completely free for the community" },
        { title: "Expert Instructors", description: "Certified speech therapists and educators" },
        { title: "Small Groups", description: "Limited class sizes for personalized attention" },
        { title: "Proven Results", description: "95% of parents report improvement in their child's speech" }
    ];

    return (
        <main className={s.page}>
            <section className={s.hero}>
                <div className="container">
                    <div className={s.heroInner}>
                        <div>
                            <p className={s.eyebrow}>Programs & Sessions</p>
                            <h1 className={s.h1}>Courses</h1>
                            <p className={s.lead}>
                                Pick a session that fits your student. Every cohort ends with a short
                                showcase talk so families can celebrate progress.
                            </p>
                        </div>
                        <div className={s.searchWrap}>
                            <input
                                className={s.search}
                                placeholder="Search by title, location, grade, or level…"
                                value={q}
                                onChange={(e)=>setQ(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    style={{
                                        textAlign: 'center',
                                        padding: '32px',
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        border: '1px solid #f0f0f0',
                                        transition: 'all 0.3s ease',
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                        transitionDelay: `${index * 100}ms`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(156, 39, 176, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                                        {index === 0 && '❤️'}
                                        {index === 1 && '🎤'}
                                        {index === 2 && '👥'}
                                        {index === 3 && '🏆'}
                                    </div>
                                    <h3 style={{ fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>{feature.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={s.tabs}>
                        <button
                            className={`${s.tab} ${tab==="current" ? s.active : ""}`}
                            onClick={()=>setTab("current")}
                        >
                            Current Courses
                        </button>
                        <button
                            className={`${s.tab} ${tab==="past" ? s.active : ""}`}
                            onClick={()=>setTab("past")}
                        >
                            Past Courses
                        </button>
                    </div>
                </div>
            </section>

            <section className={s.gridSection}>
                <div className="container">
                    {list.length ? (
                        <div className={s.grid}>
                            {list.map(c => (
                                <CourseCard key={c.id} c={c} dim={tab==="past"} />
                            ))}
                        </div>
                    ) : (
                        <div className={s.empty}>
                            No {tab==="current" ? "current" : "past"} courses match your search.
                        </div>
                    )}
                </div>
            </section>

            {/* Optional: highlight other ways to get notified */}
            <section className={s.ctaBand}>
                <div className="container">
                    <div className={s.cta}>
                        <div>
                            <h3 className={s.ctaTitle}>Want a heads-up on new sessions?</h3>
                            <p className={s.ctaText}>Join our email list and we’ll notify you when enrollment opens.</p>
                        </div>
                        <a className={s.ctaBtn} href="/contact">Contact Us</a>
                    </div>
                </div>
            </section>
        </main>
    );
}
