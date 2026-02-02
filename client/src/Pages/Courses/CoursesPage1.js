import React, { useState, useEffect } from 'react';
import s from "./Courses.module.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import GroupsIcon from "@mui/icons-material/Groups";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BoltIcon from "@mui/icons-material/Bolt";

const CoursesPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
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
    const upcomingSessions = [
    ];

    const features = [
        { title: "100% Free", description: "All sessions are completely free for the community" },
        { title: "Expert Instructors", description: "Experienced speech and debate coaches and educators" },
        { title: "Small Groups", description: "Limited class sizes for personalized attention" },
        { title: "Proven Results", description: "95% of parents report improvement in their child's speech" }
    ];

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
                    <li><GroupsIcon /> {session.ageGroup} {!isPast && `· ${session.enrolled}/${session.capacity} enrolled`}</li>
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
                                <span className={`${s.tag} ${s.tagOk}`}>{session.capacity - session.enrolled} seats left</span>
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
            <div style={{ position: 'relative', width: '100%', height: '340px', overflow: 'hidden' }}>
                <img
                    src="/images/teaching-beginner.JPG"
                    alt="What We Teach"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(transparent 20%, rgba(0,0,0,0.55))',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    padding: '32px 20px',
                }}>
                    <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', margin: 0, textAlign: 'center' }}>
                        What We Teach
                    </h1>
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
            <div style={{ backgroundColor: '#F9FAFB', padding: '48px 20px 0' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: '8px' }}>
                    Upcoming Sessions
                </h2>
                <div style={{ width: '80px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px', margin: '0 auto 8px' }}></div>
                <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '1rem', marginBottom: '0' }}>
                    Browse our upcoming sessions and register today.
                </p>
            </div>

            <section className={s.gridSection} style={{ backgroundColor: '#F9FAFB', border: 'none' }}>
                <div className="container">
                    {upcomingSessions.length > 0 ? (
                        <div className={s.grid}>
                            {upcomingSessions.map(session => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 24px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            border: '2px dashed #E5E7EB',
                            maxWidth: '500px',
                            margin: '0 auto',
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#D1D5DB' }}>
                                <CalendarMonthIcon style={{ fontSize: 56 }} />
                            </div>
                            <h3 style={{ fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                                No upcoming sessions right now
                            </h3>
                            <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '380px', margin: '0 auto 20px' }}>
                                New sessions are announced regularly. Contact us to be the first to know!
                            </p>
                            <a
                                href="/contact"
                                style={{
                                    display: 'inline-block',
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    padding: '12px 32px',
                                    borderRadius: '999px',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                }}
                            >
                                Get Notified
                            </a>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
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
                                border: '1px solid #E5E7EB',
                                transition: 'all 0.3s ease',
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                transitionDelay: `${index * 100}ms`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.15)';
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
                            <h3 style={{ fontWeight: 600, marginBottom: '8px', color: '#111827' }}>{feature.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Our Approach Section */}
            <div style={{ backgroundColor: '#F9FAFB', padding: '64px 20px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '8px', color: '#111827', textAlign: 'center' }}>
                        Our Approach
                    </h2>
                    <div style={{ width: '80px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px', margin: '0 auto 24px' }}></div>
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
                            src="/images/teaching-glasses.png"
                            alt="Working one-on-one with a student"
                            style={{ flex: '1 1 300px', height: '300px', objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderRadius: '8px' }}
                        />
                    </div>
                </div>
            </div>

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
