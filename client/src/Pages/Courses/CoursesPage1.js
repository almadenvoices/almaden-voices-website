import React, { useState, useEffect } from 'react';
import s from "./Courses.module.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import GroupsIcon from "@mui/icons-material/Groups";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BoltIcon from "@mui/icons-material/Bolt";

// Bilingual labeled field: English label bold, Spanish label muted underneath.
// Defined at module scope so it isn't recreated on every render (which would
// remount the inputs and make them lose focus while typing).
const BilingualField = ({ labelEn, labelEs, children }) => (
    <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px' }}>
            <span style={{ display: 'block', fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{labelEn}</span>
            <span style={{ display: 'block', color: '#6B7280', fontStyle: 'italic', fontSize: '0.82rem' }}>{labelEs}</span>
        </label>
        {children}
    </div>
);

// Short bilingual (English / Spanish) interest form for an upcoming public
// speaking workshop. Collects family contact details and adds them to the
// mailing list via the existing /api/subscribe endpoint so they can be
// contacted individually when workshop details are ready.
const WorkshopInterestForm = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [childName, setChildName] = useState('');
    const [childGrade, setChildGrade] = useState('');
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fullName.trim() || !phone.trim() || !childName.trim() || !childGrade.trim()) {
            setStatus('error');
            setMessage('Please fill in all fields. / Por favor complete todos los campos.');
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address. / Por favor ingrese un correo electrónico válido.');
            return;
        }

        setStatus('submitting');
        setMessage('');

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    email,
                    phone,
                    childName,
                    childGrade,
                    interest: 'Public Speaking Workshop'
                })
            });
            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('');
                setFullName('');
                setEmail('');
                setPhone('');
                setChildName('');
                setChildGrade('');
            } else {
                setStatus('error');
                setMessage(result.error || 'Something went wrong. Please try again. / Algo salió mal. Por favor intente de nuevo.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please check your connection and try again. / Error de conexión. Por favor revise su conexión e intente de nuevo.');
        }
    };

    const inputStyle = {
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        fontSize: '0.95rem',
        outline: 'none'
    };

    return (
        <div style={{
            maxWidth: '560px',
            margin: '0 auto',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            padding: '32px 28px'
        }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: '0 0 4px', textAlign: 'center' }}>
                Interested in an upcoming public speaking workshop?
            </h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2563EB', fontStyle: 'italic', margin: '0 0 16px', textAlign: 'center' }}>
                ¿Le interesa un próximo taller de oratoria?
            </p>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 4px' }}>
                We&apos;re putting together a new public speaking workshop for families. Leave your contact below
                and we&apos;ll email you for updates on the workshop.
            </p>
            <p style={{ color: '#6B7280', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 24px' }}>
                Estamos organizando un nuevo taller de oratoria para familias. Deje su información a continuación
                y le enviaremos información sobre el taller por correo electrónico.
            </p>

            {status === 'success' ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '16px 18px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '10px',
                    color: '#065F46',
                    fontWeight: 500
                }}>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1.4 }}>✓</span>
                    <span>
                        Thank you! You&apos;re on our list and we&apos;ll reach out soon with workshop details.
                        <br />
                        <em>¡Gracias! Está en nuestra lista y nos comunicaremos pronto con los detalles del taller.</em>
                    </span>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <BilingualField labelEn="Full name" labelEs="Nombre completo">
                        <input
                            type="text"
                            placeholder="Full name / Nombre completo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
                    </BilingualField>

                    <BilingualField labelEn="Email" labelEs="Correo electrónico">
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
                    </BilingualField>

                    <BilingualField labelEn="Phone number" labelEs="Número de teléfono">
                        <input
                            type="tel"
                            placeholder="(000) 000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
                    </BilingualField>

                    <BilingualField labelEn="Child's name" labelEs="Nombre de su hijo/a">
                        <input
                            type="text"
                            placeholder="Child's name / Nombre de su hijo/a"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
                    </BilingualField>

                    <BilingualField labelEn="Child's grade" labelEs="Grado escolar de su hijo/a">
                        <select
                            value={childGrade}
                            onChange={(e) => setChildGrade(e.target.value)}
                            disabled={status === 'submitting'}
                            style={{ ...inputStyle, appearance: 'auto', backgroundColor: 'white', color: childGrade ? '#111827' : '#9CA3AF' }}
                        >
                            <option value="">Select grade / Seleccione el grado</option>
                            <option value="Pre-K">Pre-K / Preescolar</option>
                            <option value="Kindergarten">Kindergarten / Kínder</option>
                            <option value="1st grade">1st grade / 1er grado</option>
                            <option value="2nd grade">2nd grade / 2º grado</option>
                            <option value="3rd grade">3rd grade / 3er grado</option>
                            <option value="4th grade">4th grade / 4º grado</option>
                            <option value="5th grade">5th grade / 5º grado</option>
                            <option value="6th grade">6th grade / 6º grado</option>
                            <option value="7th grade">7th grade / 7º grado</option>
                            <option value="8th grade">8th grade / 8º grado</option>
                            <option value="9th grade">9th grade / 9º grado</option>
                            <option value="10th grade">10th grade / 10º grado</option>
                            <option value="11th grade">11th grade / 11º grado</option>
                            <option value="12th grade">12th grade / 12º grado</option>
                        </select>
                    </BilingualField>

                    {status === 'error' && (
                        <p style={{ color: '#DC2626', fontSize: '0.85rem', margin: '0 2px 12px' }}>{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        style={{
                            width: '100%',
                            padding: '13px 28px',
                            backgroundColor: status === 'submitting' ? '#93B4F5' : '#2563EB',
                            color: 'white',
                            border: 'none',
                            borderRadius: '999px',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => { if (status !== 'submitting') e.currentTarget.style.backgroundColor = '#1D4ED8'; }}
                        onMouseLeave={(e) => { if (status !== 'submitting') e.currentTarget.style.backgroundColor = '#2563EB'; }}
                    >
                        {status === 'submitting' ? 'Sending… / Enviando…' : 'Keep me posted / Manténganme informado'}
                    </button>

                    <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: '16px 2px 0', lineHeight: 1.6, textAlign: 'center' }}>
                        No spam — just workshop updates. You can unsubscribe anytime.
                        <br />
                        <em>Sin correo no deseado — solo información del taller. Puede darse de baja en cualquier momento.</em>
                    </p>
                </form>
            )}
        </div>
    );
};

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

            {sessions.length > 0 && (
                <section className={s.gridSection} style={{ backgroundColor: '#F9FAFB', border: 'none' }}>
                    <div className="container">
                        <div className={s.grid}>
                            {sessions.map(session => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Public speaking workshop interest form (bilingual) */}
            <section style={{ backgroundColor: '#F9FAFB', padding: '32px 20px 64px' }}>
                <WorkshopInterestForm />
            </section>

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
                            src="/images/teaching-glasses.jpg"
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
