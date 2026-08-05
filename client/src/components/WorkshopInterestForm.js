import React, { useState } from 'react';

// Bilingual labeled field: English label bold, Spanish label muted underneath.
// `lang` ("en" | "es" | "both") comes from the register page's language toggle;
// it defaults to "both", which is how this form has always rendered.
// Defined at module scope so it isn't recreated on every render (which would
// remount the inputs and make them lose focus while typing).
const BilingualField = ({ labelEn, labelEs, lang = 'both', children }) => (
    <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px' }}>
            {lang !== 'es' && (
                <span style={{ display: 'block', fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{labelEn}</span>
            )}
            {lang !== 'en' && (
                <span style={{
                    display: 'block',
                    color: lang === 'es' ? '#111827' : '#6B7280',
                    fontWeight: lang === 'es' ? 600 : 400,
                    fontStyle: lang === 'es' ? 'normal' : 'italic',
                    fontSize: lang === 'es' ? '0.9rem' : '0.82rem',
                }}>{labelEs}</span>
            )}
        </label>
        {children}
    </div>
);

// Pick one language, or both joined with a slash — for placeholders and
// button text that can't hold markup.
const pick = (en, es, lang) => (lang === 'en' ? en : lang === 'es' ? es : `${en} / ${es}`);

// Short bilingual (English / Spanish) interest form for an upcoming public
// speaking workshop. Collects family contact details and adds them to the
// mailing list via the existing /api/subscribe endpoint so they can be
// contacted individually when workshop details are ready.
const WorkshopInterestForm = ({ lang = 'both' }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [childName, setChildName] = useState('');
    const [childGrade, setChildGrade] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fullName.trim() || !phone.trim() || !childName.trim() || !childGrade.trim() ||
            !schoolName.trim() || !zipCode.trim()) {
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
                    schoolName,
                    zipCode,
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
                setSchoolName('');
                setZipCode('');
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
            {lang !== 'es' && (
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: '0 0 4px', textAlign: 'center' }}>
                    Interested in a free public speaking workshop?
                </h3>
            )}
            {lang !== 'en' && (
                lang === 'es'
                    ? <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: '0 0 16px', textAlign: 'center' }}>
                        ¿Le interesa un taller de oratoria gratuito?
                    </h3>
                    : <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2563EB', fontStyle: 'italic', margin: '0 0 16px', textAlign: 'center' }}>
                        ¿Le interesa un taller de oratoria gratuito?
                    </p>
            )}
            {lang !== 'es' && (
                <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 4px' }}>
                    We&apos;re putting together a new public speaking workshop for families. Leave your contact below
                    and we&apos;ll email you for updates on the workshop.
                </p>
            )}
            {lang !== 'en' && (
                <p style={{ color: '#6B7280', fontStyle: lang === 'es' ? 'normal' : 'italic', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 16px' }}>
                    Estamos organizando un nuevo taller de oratoria para familias. Deje su información a continuación
                    y le enviaremos información sobre el taller por correo electrónico.
                </p>
            )}
            <div style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                padding: '14px 16px',
                margin: '0 0 24px'
            }}>
                {lang !== 'es' && (
                    <p style={{ color: '#065F46', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                        ✓ This workshop is 100% free, and signing up doesn&apos;t commit you to anything — you&apos;re
                        just letting us know you&apos;re interested.
                    </p>
                )}
                {lang !== 'en' && (
                    <p style={{ color: lang === 'es' ? '#065F46' : '#047857', fontWeight: lang === 'es' ? 600 : 400, fontStyle: lang === 'es' ? 'normal' : 'italic', fontSize: '0.92rem', lineHeight: 1.6, margin: lang === 'es' ? 0 : '4px 0 0' }}>
                        ✓ Este taller es 100% gratis, y registrarse no lo compromete a nada — solo nos deja saber
                        que le interesa.
                    </p>
                )}
            </div>

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
                        {lang !== 'es' && 'Thank you! You\u2019re on our list and we\u2019ll reach out soon with workshop details.'}
                        {lang === 'both' && <br />}
                        {lang !== 'en' && (
                            lang === 'es'
                                ? '¡Gracias! Está en nuestra lista y nos comunicaremos pronto con los detalles del taller.'
                                : <em>¡Gracias! Está en nuestra lista y nos comunicaremos pronto con los detalles del taller.</em>
                        )}
                    </span>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <BilingualField lang={lang} labelEn="Full name" labelEs="Nombre completo">
                        <input
                            type="text"
                            placeholder={pick('Full name', 'Nombre completo', lang)}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
                    </BilingualField>

                    <BilingualField lang={lang} labelEn="Email" labelEs="Correo electrónico">
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
                    </BilingualField>

                    <BilingualField lang={lang} labelEn="Phone number" labelEs="Número de teléfono">
                        <input
                            type="tel"
                            placeholder="(000) 000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
                    </BilingualField>

                    <BilingualField lang={lang} labelEn="Child's name" labelEs="Nombre de su hijo/a">
                        <input
                            type="text"
                            placeholder={pick("Child's name", "Nombre de su hijo/a", lang)}
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
                    </BilingualField>

                    <BilingualField lang={lang} labelEn="Child's grade" labelEs="Grado escolar de su hijo/a">
                        <select
                            value={childGrade}
                            onChange={(e) => setChildGrade(e.target.value)}
                            disabled={status === 'submitting'}
                            style={{ ...inputStyle, appearance: 'auto', backgroundColor: 'white', color: childGrade ? '#111827' : '#9CA3AF' }}
                        >
                            <option value="">{pick('Select grade', 'Seleccione el grado', lang)}</option>
                            <option value="Pre-K">{pick('Pre-K', 'Preescolar', lang)}</option>
                            <option value="Kindergarten">{pick('Kindergarten', 'Kínder', lang)}</option>
                            <option value="1st grade">{pick('1st grade', '1er grado', lang)}</option>
                            <option value="2nd grade">{pick('2nd grade', '2º grado', lang)}</option>
                            <option value="3rd grade">{pick('3rd grade', '3er grado', lang)}</option>
                            <option value="4th grade">{pick('4th grade', '4º grado', lang)}</option>
                            <option value="5th grade">{pick('5th grade', '5º grado', lang)}</option>
                            <option value="6th grade">{pick('6th grade', '6º grado', lang)}</option>
                            <option value="7th grade">{pick('7th grade', '7º grado', lang)}</option>
                            <option value="8th grade">{pick('8th grade', '8º grado', lang)}</option>
                            <option value="9th grade">{pick('9th grade', '9º grado', lang)}</option>
                            <option value="10th grade">{pick('10th grade', '10º grado', lang)}</option>
                            <option value="11th grade">{pick('11th grade', '11º grado', lang)}</option>
                            <option value="12th grade">{pick('12th grade', '12º grado', lang)}</option>
                        </select>
                    </BilingualField>

                    <BilingualField lang={lang} labelEn="School name" labelEs="Nombre de la escuela">
                        <input
                            type="text"
                            placeholder={pick('School name', 'Nombre de la escuela', lang)}
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
                    </BilingualField>

                    <BilingualField lang={lang} labelEn="Home ZIP code" labelEs="Código postal de su casa">
                        <input
                            type="text"
                            placeholder="e.g. 95120"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            disabled={status === 'submitting'}
                            style={inputStyle}
                        />
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
                        {status === 'submitting' ? pick('Sending…', 'Enviando…', lang) : pick('Keep me posted', 'Manténganme informado', lang)}
                    </button>

                    <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: '16px 2px 0', lineHeight: 1.6, textAlign: 'center' }}>
                        {lang !== 'es' && 'No spam — just workshop updates. You can unsubscribe anytime.'}
                        {lang === 'both' && <br />}
                        {lang !== 'en' && (
                            lang === 'es'
                                ? 'Sin correo no deseado — solo información del taller. Puede darse de baja en cualquier momento.'
                                : <em>Sin correo no deseado — solo información del taller. Puede darse de baja en cualquier momento.</em>
                        )}
                    </p>
                </form>
            )}
        </div>
    );
};

export default WorkshopInterestForm;
