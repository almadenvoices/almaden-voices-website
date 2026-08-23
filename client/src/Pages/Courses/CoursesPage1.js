import React, { useState, useEffect } from 'react';
import s from "./Courses.module.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import GroupsIcon from "@mui/icons-material/Groups";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BoltIcon from "@mui/icons-material/Bolt";

const CoursesPage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [enrollmentCounts, setEnrollmentCounts] = useState({});

    useEffect(() => {
        setIsVisible(true);
        fetch("/api/sessions/enrollment")
            .then(res => res.json())
            .then(data => setEnrollmentCounts(data))
            .catch(() => {});
    }, []);

    // Scroll to a section when the page is opened with a #hash.
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, []);

    // ============================================================
    // UPCOMING SESSIONS — Add new sessions here!
    // Copy this template and fill in the details:
    //
    // {
    //     id: 1,
    //     title: "Session Title Here",
    //     date: "Month Day, Year",
    //     time: "Start Time - End Time",
    //     location: "Location Name",
    //     ageGroup: "Grades X-Y",
    //     capacity: 12,
    //     enrolled: 0,
    //     instructor: "Instructor Name",
    //     description: "Short description of the session.",
    //     status: "Open",  // "Open" or "Full"
    //     cover: "/images/your-image.jpg"
    // }
    // ============================================================
    const upcomingSessions = [];

    const sessions = upcomingSessions.map(ses => ({
        ...ses,
        enrolled: ses.enrolled + (enrollmentCounts[ses.id] || 0),
    }));

    const SessionCard = ({ session, isPast = false }) => (
        <article className={`${s.card} ${isPast ? s.dim : ""}`}>
            <div className={s.coverWrap}>
                <img src={session.cover} alt={session.title} />
                {!isPast && session.status === "Open" && (
                    <span className={`${s.ribbon} ${s.ribbonCurrent}`}>Open</span>
                )}
                {!isPast && session.status === "Full" && (
                    <span className={s.ribbon}>Full</span>
                )}
                {isPast && <span className={s.ribbon}>Completed</span>}
            </div>

            <div className={s.body}>
                <h3 className={s.title}>{session.title}</h3>
                <p className={s.blurb}>{session.description || session.feedback}</p>

                <ul className={s.meta}>
                    <li><CalendarMonthIcon /> {session.date}</li>
                    <li><AccessTimeIcon /> {session.time}</li>
                    <li><PlaceIcon /> {session.location}</li>
                    <li><GroupsIcon /> {session.ageGroup} {!isPast && !session.online && session.capacity != null && `· ${session.enrolled}/${session.capacity} enrolled`}</li>
                </ul>

                <div className={s.row}>
                    <div className={s.price}>
                        <span className={s.currency}>$</span>
                        <span className={s.amount}>0</span>
                        <span style={{ color: '#6B7280', fontSize: '14px', marginLeft: '4px' }}>Free</span>
                    </div>
                    <div className={s.tags}>
                        {!isPast ? (
                            session.status === "Open" ? (
                                <span className={`${s.tag} ${s.tagOk}`}>{session.online
                                    ? "Online · Free"
                                    : session.capacity == null
                                        ? "Open · Free"
                                        : `${session.capacity - session.enrolled} seats left`}</span>
                            ) : (
                                <span className={`${s.tag} ${s.tagFull}`}>Full</span>
                            )
                        ) : (
                            <span className={s.tag}>Rating: {session.rating}/5</span>
                        )}
                    </div>
                </div>

                <div className={s.actions}>
                    {!isPast ? (
                        session.status === "Open" ? (
                            <a className={s.primary} href="/register">
                                <BoltIcon /> Register Now
                            </a>
                        ) : (
                            <span className={s.secondaryDisabled}>Waitlist</span>
                        )
                    ) : (
                        <span className={s.secondaryDisabled}>Completed</span>
                    )}
                </div>
            </div>
        </article>
    );

    return (
        <main className={s.page}>
            {/* What We Teach Hero Banner */}
            <div style={{ position: 'relative', width: '100%', height: 'clamp(180px, 26vw, 240px)', overflow: 'hidden' }}>
                <img
                    src="/images/teaching-beginner.JPG"
                    alt="What We Teach"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(transparent 20%, rgba(0,0,0,0.55))',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    padding: '24px 20px',
                }}>
                    <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', margin: 0, textAlign: 'center', letterSpacing: '-0.02em' }}>
                        What We Teach
                    </h1>
                </div>
            </div>

            {/* Our Approach Section */}
            <div style={{ backgroundColor: '#F9FAFB', padding: '64px 20px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <p style={{ fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, color: '#2563EB', textAlign: 'center', margin: '0 0 12px' }}>
                        How We Teach
                    </p>
                    <h2 style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.5rem)', fontWeight: 800, color: '#111827', textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 24px' }}>
                        Our Approach
                    </h2>
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#6B7280', marginBottom: '24px', textAlign: 'center' }}>
                        We are different because we emphasize:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '32px' }}>
                        {[
                            'Final Showcase — real practice in front of an audience',
                            'Accessibility — low-cost or free programming for families',
                            'Inclusivity — welcoming students of all skill levels',
                            'Hands-on learning — real practice, not just lectures',
                            'Small groups — personalized feedback for every student',
                            'Community focus — supporting families and underserved students',
                            'Leadership development — encouraging students to speak with purpose',
                        ].map((item, i) => (
                            <li key={i} style={{ fontSize: '1rem', lineHeight: 1.8, color: '#6B7280', marginBottom: '6px' }}>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <img
                            src="/images/our-approach.JPG"
                            alt="Our Approach"
                            style={{ flex: '1 1 300px', height: '300px', objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderRadius: '8px' }}
                        />
                        <img
                            src="/images/teaching-glasses.jpg"
                            alt="Working one-on-one with a student"
                            style={{ flex: '1 1 300px', height: '300px', objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderRadius: '8px' }}
                        />
                    </div>
                </div>
            </div>

            {/* What We Teach Content */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '48px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: '24px' }}>
                        In our beginner session, students will be introduced to…
                    </h2>
                    <img
                        src="/images/beginner-session-bullet.png"
                        alt="Beginner Session Overview"
                        style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    />

                </div>
            </div>

            {/* Advanced + Debate - wider row */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '0 20px 48px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
                    {/* Advanced Session - Left */}
                    <div style={{ flex: '1 1 480px' }}>
                        <h2 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: '24px' }}>
                            In our advanced session, key differences are…
                        </h2>
                        <img
                            src="/images/advanced-session-bullet.png"
                            alt="Advanced Session Overview"
                            style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                        />
                    </div>

                    {/* Debate Session - Right */}
                    <div style={{ flex: '1 1 480px' }}>
                        <h2 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: '24px' }}>
                            In our debate session, we teach…
                        </h2>
                        <img
                            src="/images/debate-session-bullet.png"
                            alt="Debate Session Overview"
                            style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Upcoming Sessions Header + Grid */}
            {sessions.length > 0 && (
                <>
                    <div style={{ backgroundColor: '#F9FAFB', padding: '48px 20px 0' }}>
                        <p style={{ fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, color: '#2563EB', textAlign: 'center', margin: '0 0 12px' }}>
                            Now Enrolling
                        </p>
                        <h2 style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.5rem)', fontWeight: 800, color: '#111827', textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 16px' }}>
                            Free Public Speaking Workshop
                        </h2>
                        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '1rem', marginBottom: '0' }}>
                            A free one-hour introduction to public speaking for kids. Register below and we&apos;ll email you the location and all the details before the workshop.
                        </p>
                    </div>

                    <section className={s.gridSection} style={{ backgroundColor: '#F9FAFB', border: 'none' }}>
                        <div className="container">
                            <div className={s.grid}>
                                {sessions.map(session => (
                                    <SessionCard key={session.id} session={session} />
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* CTA Section */}
            <section className={s.ctaBand}>
                <div className="container">
                    <div className={s.cta}>
                        <div>
                            <h3 className={s.ctaTitle}>Want a heads-up on new sessions?</h3>
                            <p className={s.ctaText}>Join our email list and we'll notify you when enrollment opens.</p>
                        </div>
                        <a className={s.ctaBtn} href="/contact">Contact Us</a>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CoursesPage;
