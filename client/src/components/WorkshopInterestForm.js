import React, { useState } from 'react';

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
                Interested in a free public speaking workshop?
            </h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2563EB', fontStyle: 'italic', margin: '0 0 16px', textAlign: 'center' }}>
                ¿Le interesa un taller de oratoria gratuito?
            </p>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 4px' }}>
                We&apos;re putting together a new public speaking workshop for families. Leave your contact below
                and we&apos;ll email you for updates on the workshop.
            </p>
            <p style={{ color: '#6B7280', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 16px' }}>
                Estamos organizando un nuevo taller de oratoria para familias. Deje su información a continuación
                y le enviaremos información sobre el taller por correo electrónico.
            </p>
            <div style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                padding: '14px 16px',
                margin: '0 0 24px'
            }}>
                <p style={{ color: '#065F46', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                    ✓ This workshop is 100% free, and signing up doesn&apos;t commit you to anything — you&apos;re
                    just letting us know you&apos;re interested.
                </p>
                <p style={{ color: '#047857', fontStyle: 'italic', fontSize: '0.92rem', lineHeight: 1.6, margin: '4px 0 0' }}>
                    ✓ Este taller es 100% gratis, y registrarse no lo compromete a nada — solo nos deja saber
                    que le interesa.
                </p>
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

export default WorkshopInterestForm;
