import React, { useState, useEffect } from "react";
import s from "./Register.module.css";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import SendIcon from "@mui/icons-material/Send";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import GroupsIcon from "@mui/icons-material/Groups";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HomeIcon from "@mui/icons-material/Home";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import WorkshopInterestForm from "../../components/WorkshopInterestForm";
import CoachingSlots from "../../components/CoachingSlots";
import { T, t, Bi, LANG_STORAGE_KEY, DEFAULT_LANG } from "../../i18n/registerText";
import { APPS_SCRIPT_URL } from "../../data/appsScript";

// Which panel each chooser button opens, and the id it scrolls to.
const PANEL_IDS = {
    interest: "workshop-signup",
    workshop: "session-signup",
    coaching: "coaching-signup",
};

// The 1-on-1 coaching slots take real payments. Set this to false to pull the
// booking option off the register page without touching anything else.
const SHOW_COACHING = true;

// ============================================================
// UPCOMING SESSIONS — Add new sessions here!
// Copy this template and fill in the details:
//
// {
//     id: "unique-id",
//     title: "Session Title Here",
//     date: "Month Day, Year",
//     time: "Start – End Time",
//     location: "Location Name",
//     grades: "Grades X–Y",
//     capacity: 12,
//     enrolled: 0,
//     description: "Short description of the session.",
//     status: "Open",  // "Open" or "Full"
// }
// ============================================================
const upcomingSessions = [
    {
        id: "nj-workshop-aug-2026",
        title: "New Jersey Public Speaking Workshop",
        date: "August 29 & 30, 2026",
        time: "2–3 PM ET",
        location: "Online",
        grades: "Ages 5–14",
        // capacity: null means no limit — no seat count and it never shows as full.
        capacity: null,
        enrolled: 0,
        description: "A free two-day online workshop for kids in New Jersey. We cover the fundamentals — speaking clearly, standing with confidence, and settling the nerves that come with presenting to a group. No experience needed. Runs Saturday, August 29 and Sunday, August 30, 2–3 PM ET; we'll email you the join link before day one.",
        status: "Open",
        online: true,
    },
    {
        id: "intro-workshop-sep-2026",
        title: "Introductory Public Speaking Workshop",
        titleEs: "Taller introductorio de oratoria",
        date: "September 4, 2026",
        dateEs: "4 de septiembre de 2026",
        time: "6–7 PM",
        timeEs: "6–7 PM",
        location: "To be announced",
        locationEs: "Por confirmar",
        grades: "Ages 5–14",
        gradesEs: "Edades 5 a 14",
        // capacity: null means no limit — no seat count and it never shows as full.
        capacity: null,
        enrolled: 0,
        description: "A free one-hour introduction to public speaking for kids. We cover the fundamentals — speaking clearly, standing with confidence, and settling the nerves that come with presenting to a group. No experience needed. Runs Friday, September 4 from 6–7 PM; we'll email you the location as soon as it's confirmed.",
        descriptionEs: "Una introducción gratuita de una hora a la oratoria para niños. Cubrimos los fundamentos: hablar con claridad, mantener una postura segura y calmar los nervios de presentar ante un grupo. No se necesita experiencia. Se realiza el viernes 4 de septiembre de 6 a 7 PM; le enviaremos la ubicación por correo en cuanto esté confirmada.",
        status: "Open",
        online: false,
    },
];

// Wraps a session field and its Spanish twin into the {en, es} shape <Bi> wants.
// Sessions keep plain English fields as well, because those are what get written
// to the spreadsheet and the confirmation emails; the Spanish is display only.
// A session with no Spanish for a field simply shows the English in both modes.
const bi = (en, es) => ({ en, es: es || en });

// A session with no capacity set takes unlimited registrations.
const hasSeatLimit = (ses) => ses && ses.capacity != null;
const isSessionFull = (ses) => hasSeatLimit(ses) && ses.enrolled >= ses.capacity;

const emptyStudent = () => ({ firstName: "", lastName: "", age: "" });

export default function RegisterPage() {
    const [agreed, setAgreed] = useState(false);
    // Photo/video permission is opt-in and required: "" until the parent picks.
    const [photoConsent, setPhotoConsent] = useState("");
    const [futureContact, setFutureContact] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [enrollmentCounts, setEnrollmentCounts] = useState({});
    const [students, setStudents] = useState([emptyStudent()]);
    const [donationAmount, setDonationAmount] = useState(5);
    const [parentFirstName, setParentFirstName] = useState("");
    const [parentLastName, setParentLastName] = useState("");
    // Which of the chooser buttons is open: "" | "interest" | "workshop"
    const [choice, setChoice] = useState("");
    // Display language: "en" | "es" | "both". Remembered between visits.
    const [lang, setLang] = useState(() => {
        try {
            return localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;
        } catch {
            return DEFAULT_LANG;
        }
    });

    function chooseLang(next) {
        setLang(next);
        try {
            localStorage.setItem(LANG_STORAGE_KEY, next);
        } catch {
            /* Safari private mode blocks writes — the choice just won't persist. */
        }
    }


    // Detect when the parent's full name matches any student's full name
    // (a common mistake where parents type their child's name in the parent field, or vice versa)
    const normalizeName = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
    const parentFullName = `${normalizeName(parentFirstName)} ${normalizeName(parentLastName)}`.trim();
    const hasNameConflict = parentFullName.length > 0 && students.some(st => {
        const studentFullName = `${normalizeName(st.firstName)} ${normalizeName(st.lastName)}`.trim();
        return studentFullName.length > 0 && studentFullName === parentFullName;
    });

    useEffect(() => {
        fetch("/api/sessions/enrollment")
            .then(res => res.json())
            .then(data => setEnrollmentCounts(data))
            .catch(() => {});
    }, []);

    // Open the matching chooser panel and scroll to it when the page is opened
    // with a #hash (e.g. the footer's "Free Workshop Sign-Up" link ->
    // /register#workshop-signup, or /register#session-signup).
    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;
        const match = Object.keys(PANEL_IDS).find(key => `#${PANEL_IDS[key]}` === hash);
        if (match) setChoice(match);
        setTimeout(() => {
            document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        }, 150);
    }, []);

    // Open a chooser panel (clicking the open one closes it again) and bring it
    // into view. Only scroll when we're opening — there's nothing to scroll to
    // on the way back.
    function pickChoice(next) {
        const opening = choice !== next;
        setChoice(opening ? next : "");
        if (!opening) return;
        setTimeout(() => {
            document.getElementById(PANEL_IDS[next])?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
    }

    const sessions = upcomingSessions.map(ses => ({
        ...ses,
        enrolled: ses.enrolled + (enrollmentCounts[ses.id] || 0),
    }));
    const selectedSession = sessions.find(ses => ses.id === selectedSessionId);
    const spotsRemaining = !selectedSession
        ? 0
        : hasSeatLimit(selectedSession)
            ? selectedSession.capacity - selectedSession.enrolled
            : Infinity;

    // With no session open and coaching off there's only one thing to do, so
    // the chooser is skipped and the interest form shows on its own.
    const hasOpenSessions = sessions.length > 0;
    const showChooser = hasOpenSessions || SHOW_COACHING;

    function updateStudent(index, field, value) {
        setStudents(prev => prev.map((st, i) => i === index ? { ...st, [field]: value } : st));
    }

    function addStudent() {
        if (students.length < 5 && students.length < spotsRemaining) {
            setStudents(prev => [...prev, emptyStudent()]);
        }
    }

    function removeStudent(index) {
        if (students.length > 1) {
            setStudents(prev => prev.filter((_, i) => i !== index));
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        if (hasNameConflict) {
            setError(t(T.errNameConflict, lang));
            return;
        }

        if (!photoConsent) {
            setError(t(T.errPhotoConsent, lang));
            return;
        }

        if (!agreed) {
            setError(t(T.errAgree, lang));
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData(e.target);
        const sessionLabel = selectedSession ? `${selectedSession.title} — ${selectedSession.date}` : "";

        // Google Apps Script payload
        const appsScriptData = {
            parentName: `${parentFirstName} ${parentLastName}`.trim(),
            email: formData.get("email"),
            phone: formData.get("phone"),
            students: students,
            sessionType: formData.get("sessionType"),
            sessionLabel: sessionLabel,
            country: formData.get("country"),
            schoolName: formData.get("schoolName"),
            streetAddress: formData.get("streetAddress"),
            city: formData.get("city"),
            state: formData.get("state"),
            zipCode: formData.get("zipCode"),
            additionalInfo: formData.get("additionalInfo"),
            privacyAgreed: agreed,
            photoConsent: photoConsent === "yes",
            futureContact: futureContact,
        };

        try {
            // Submit to Google Apps Script.
            // Use text/plain to avoid a CORS preflight so we can read the response.
            const response = await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(appsScriptData),
            });

            const result = response.ok ? await response.json() : null;

            if (result && result.success) {
                setSubmitted(true);
                setShowToast(true);
                const shouldDonate = donationAmount > 0;
                const donateAmt = donationAmount;
                e.target.reset();
                setAgreed(false);
                setPhotoConsent("");
                setFutureContact(false);
                setStudents([emptyStudent()]);
                setDonationAmount(5);
                setParentFirstName("");
                setParentLastName("");
                // Refresh enrollment counts
                fetch("/api/sessions/enrollment")
                    .then(r => r.json())
                    .then(data => setEnrollmentCounts(data))
                    .catch(() => {});
                if (shouldDonate) {
                    setTimeout(() => {
                        window.location.href = `/donate?amount=${donateAmt}`;
                    }, 2500);
                }
            } else {
                setError((result && result.error) || t(T.errSubmit, lang));
            }
        } catch (err) {
            console.error("Registration form error:", err);
            setError(t(T.errNetwork, lang));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className={s.page}>
            {/* Header */}
            <section className={s.hero}>
                <div className="container">
                    <div className={s.heroBadge}>
                        <EventIcon fontSize="small" /> <Bi entry={T.heroBadge} lang={lang} />
                    </div>
                    <h1 className={s.heroTitle}><Bi entry={T.heroTitle} lang={lang} block /></h1>
                    <p className={s.heroSub}>
                        <Bi entry={T.heroSub} lang={lang} block />
                    </p>
                </div>
            </section>

            <div className="container">
                {/* Language toggle */}
                <div className={s.langBar}>
                    <span className={s.langLabel}>{t(T.langLabel, lang)}:</span>
                    <div className={s.langGroup} role="group" aria-label={t(T.langLabel, lang)}>
                        {[
                            { key: "en", label: "English" },
                            { key: "es", label: "Español" },
                            { key: "both", label: "Both / Ambos" },
                        ].map(opt => (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => chooseLang(opt.key)}
                                aria-pressed={lang === opt.key}
                                className={`${s.langBtn} ${lang === opt.key ? s.langBtnActive : ""}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chooser — pick what you're here to do. Only worth showing when
                    there's more than one thing to pick; with no session open and
                    coaching off, the interest form renders on its own below. */}
                {showChooser && <div className={s.chooser}>
                    {/* The open session leads, highlighted — it's the thing most
                        visitors are here to do. */}
                    {hasOpenSessions && <button
                        type="button"
                        onClick={() => pickChoice("workshop")}
                        className={`${s.chooseBtn} ${s.chooseBtnYellow} ${choice === "workshop" ? s.chooseBtnActive : ""}`}
                        aria-expanded={choice === "workshop"}
                        aria-controls="session-signup"
                    >
                        <span className={s.chooseIcon}><HowToRegIcon /></span>
                        <span className={s.chooseText}>
                            <span className={s.chooseTitle}>
                                <Bi entry={T.chooseWorkshopPrefix} lang={lang} block />{" "}
                                <Bi entry={bi(sessions[0].title.replace(/^Free\s+/i, ""), sessions[0].titleEs)} lang={lang} />
                            </span>
                            <span className={s.chooseSub}>
                                <Bi entry={bi(sessions[0].date, sessions[0].dateEs)} lang={lang} /> · <Bi entry={bi(sessions[0].time, sessions[0].timeEs)} lang={lang} />
                            </span>
                        </span>
                        <ChevronRightIcon className={s.chooseArrow} />
                    </button>}

                    <button
                        type="button"
                        onClick={() => pickChoice("interest")}
                        className={`${s.chooseBtn} ${choice === "interest" ? s.chooseBtnActive : ""}`}
                        aria-expanded={choice === "interest"}
                        aria-controls="workshop-signup"
                    >
                        <span className={s.chooseIcon}><NotificationsActiveIcon /></span>
                        <span className={s.chooseText}>
                            <span className={s.chooseTitle}><Bi entry={T.chooseInterestTitle} lang={lang} block /></span>
                            {lang !== "es" && <span className={s.chooseSub}>{T.chooseInterestSub.en}</span>}
                            {lang !== "en" && <span className={s.chooseSubEs}>{T.chooseInterestSub.es}</span>}
                        </span>
                        <ChevronRightIcon className={s.chooseArrow} />
                    </button>

                    {SHOW_COACHING && <button
                        type="button"
                        onClick={() => pickChoice("coaching")}
                        className={`${s.chooseBtn} ${choice === "coaching" ? s.chooseBtnActive : ""}`}
                        aria-expanded={choice === "coaching"}
                        aria-controls="coaching-signup"
                    >
                        <span className={s.chooseIcon}><RecordVoiceOverIcon /></span>
                        <span className={s.chooseText}>
                            <span className={s.chooseTitle}><Bi entry={T.chooseCoachingTitle} lang={lang} block /></span>
                            <span className={s.chooseSub}><Bi entry={T.chooseCoachingSub} lang={lang} block /></span>
                        </span>
                        <ChevronRightIcon className={s.chooseArrow} />
                    </button>}
                </div>}

                {/* 1-on-1 coaching slots */}
                {SHOW_COACHING && choice === "coaching" && (
                    <section id="coaching-signup" style={{ padding: "8px 0 48px", scrollMarginTop: "90px" }}>
                        <CoachingSlots />
                    </section>
                )}

                {/* Public speaking workshop interest form (bilingual). Without a
                    chooser above it there's nothing to click, so it renders open. */}
                {(!showChooser || choice === "interest") && (
                    <section id="workshop-signup" style={{ padding: "8px 0 40px", scrollMarginTop: "90px" }}>
                        <WorkshopInterestForm lang={lang} />
                    </section>
                )}

                {/* Card: left rail + form — only while a session is open */}
                {hasOpenSessions && <section id="session-signup" className={s.card} style={{ display: choice === "workshop" ? undefined : "none", scrollMarginTop: "90px" }}>
                    {/* LEFT RAIL */}
                    <aside className={s.info}>
                        <div className={s.block}>
                            <div className={s.iconCircle}>
                                <PersonIcon />
                            </div>
                            <h3><Bi entry={T.whoTitle} lang={lang} block /></h3>
                            <p className={s.muted}>
                                <Bi entry={T.whoBody} lang={lang} block />
                            </p>
                        </div>

                        <div className={s.block}>
                            <div className={s.iconCircle}>
                                <SchoolIcon />
                            </div>
                            <h3><Bi entry={T.learnTitle} lang={lang} block /></h3>
                            <p className={s.muted}>
                                <Bi entry={T.learnBody} lang={lang} block />
                            </p>
                        </div>

                        <div className={s.block}>
                            <div className={s.iconCircle}>
                                <EventIcon />
                            </div>
                            <h3><Bi entry={T.expectTitle} lang={lang} block /></h3>
                            <p className={s.muted}>
                                <Bi entry={T.expectBody} lang={lang} block />
                            </p>
                        </div>
                    </aside>

                    <div className={s.divider} aria-hidden="true" />

                    {/* RIGHT FORM */}
                    <form className={s.form} onSubmit={onSubmit}>
                        {error && (
                            <div className={s.errorBox}>
                                {error}
                            </div>
                        )}

                        {/* Step 1: Choose a session FIRST */}
                        <h2 className={s.formTitle}><EventIcon /> <Bi entry={T.chooseSession} lang={lang} /></h2>

                        {sessions.length > 0 ? (
                            <div className={s.field}>
                                <label><Bi entry={T.whichSession} lang={lang} block /> <span className={s.req}>*</span></label>
                                <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "0 0 8px" }}>
                                    <Bi entry={T.notSurePrefix} lang={lang} /> <a href="/courses1" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>{t(T.browseSessions, lang)}</a> {t(T.notSureSuffix, lang)}
                                </p>
                                <select
                                    name="sessionType"
                                    required
                                    disabled={isSubmitting}
                                    className={s.select}
                                    value={selectedSessionId}
                                    onChange={(e) => setSelectedSessionId(e.target.value)}
                                >
                                    <option value="">{t(T.selectSession, lang)}</option>
                                    {sessions.map(ses => (
                                        <option key={ses.id} value={ses.id} disabled={isSessionFull(ses)}>
                                            {t(bi(ses.title, ses.titleEs), lang)} — {t(bi(ses.date, ses.dateEs), lang)}{isSessionFull(ses) ? " " + t(T.fullTag, lang) : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: "center",
                                padding: "32px 24px",
                                backgroundColor: "#F9FAFB",
                                borderRadius: "12px",
                                border: "2px dashed #E5E7EB",
                            }}>
                                <p style={{ fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                                    <Bi entry={T.noSessionsTitle} lang={lang} block />
                                </p>
                                <p style={{ color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 auto", maxWidth: "380px" }}>
                                    <Bi entry={T.noSessionsBody} lang={lang} block />
                                </p>
                            </div>
                        )}

                        {selectedSession && (
                            <div style={{
                                background: "#F0F6FF",
                                border: "1px solid #BFDBFE",
                                borderRadius: "12px",
                                padding: "20px",
                                marginBottom: "8px",
                            }}>
                                <h4 style={{ margin: "0 0 12px", color: "#111827", fontSize: "1rem", fontWeight: 700 }}>
                                    <Bi entry={bi(selectedSession.title, selectedSession.titleEs)} lang={lang} block />
                                </h4>
                                <p style={{ margin: "0 0 12px", color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.6 }}>
                                    <Bi entry={bi(selectedSession.description, selectedSession.descriptionEs)} lang={lang} block />
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", fontSize: "0.85rem", color: "#374151" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <CalendarMonthIcon style={{ fontSize: 16, color: "#2563EB" }} /> <Bi entry={bi(selectedSession.date, selectedSession.dateEs)} lang={lang} />
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <AccessTimeIcon style={{ fontSize: 16, color: "#2563EB" }} /> <Bi entry={bi(selectedSession.time, selectedSession.timeEs)} lang={lang} />
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <PlaceIcon style={{ fontSize: 16, color: "#2563EB" }} /> <Bi entry={bi(selectedSession.location, selectedSession.locationEs)} lang={lang} />
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <GroupsIcon style={{ fontSize: 16, color: "#2563EB" }} /> <Bi entry={bi(selectedSession.grades, selectedSession.gradesEs)} lang={lang} />
                                    </span>
                                </div>
                                {selectedSession.status !== "Open" && (
                                    <p style={{ margin: "12px 0 0", fontSize: "0.85rem", color: "#DC2626", fontWeight: 600 }}>
                                        <Bi entry={T.waitlistNote} lang={lang} block />
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step 2: Only show the rest of the form after a session is selected */}
                        {selectedSession && (
                            <>
                                <h2 className={s.formTitle}><SchoolIcon /> <Bi entry={T.studentInfo} lang={lang} /></h2>

                                <div className={s.field}>
                                    <label><Bi entry={T.howMany} lang={lang} block /> <span className={s.req}>*</span></label>
                                    <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "0 0 8px" }}>
                                        <Bi entry={T.howManyHint} lang={lang} block />
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <button
                                            type="button"
                                            onClick={() => removeStudent(students.length - 1)}
                                            disabled={students.length <= 1 || isSubmitting}
                                            className={s.counterBtn}
                                        >
                                            <RemoveIcon style={{ fontSize: 20 }} />
                                        </button>
                                        <span style={{ fontSize: "1.25rem", fontWeight: 700, minWidth: "28px", textAlign: "center" }}>
                                            {students.length}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={addStudent}
                                            disabled={students.length >= 5 || students.length >= spotsRemaining || isSubmitting}
                                            className={s.counterBtn}
                                        >
                                            <AddIcon style={{ fontSize: 20 }} />
                                        </button>
                                    </div>
                                </div>

                                {students.map((student, index) => (
                                    <div key={index} className={s.studentBlock}>
                                        {students.length > 1 && (
                                            <div className={s.studentHeader}>
                                                <span className={s.studentLabel}>{t(T.childN, lang, { n: index + 1 })}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeStudent(index)}
                                                    disabled={isSubmitting}
                                                    className={s.removeBtn}
                                                >
                                                    {t(T.remove, lang)}
                                                </button>
                                            </div>
                                        )}
                                        <div className={s.grid}>
                                            <div className={s.field}>
                                                <label><Bi entry={students.length > 1 ? T.firstName : T.studentFirstName} lang={lang} block /> <span className={s.req}>*</span></label>
                                                <input
                                                    placeholder={t(T.phFirstName, lang)}
                                                    required
                                                    disabled={isSubmitting}
                                                    value={student.firstName}
                                                    onChange={(e) => updateStudent(index, "firstName", e.target.value)}
                                                />
                                            </div>

                                            <div className={s.field}>
                                                <label><Bi entry={students.length > 1 ? T.lastName : T.studentLastName} lang={lang} block /> <span className={s.req}>*</span></label>
                                                <input
                                                    placeholder={t(T.phLastName, lang)}
                                                    required
                                                    disabled={isSubmitting}
                                                    value={student.lastName}
                                                    onChange={(e) => updateStudent(index, "lastName", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className={s.field}>
                                            <label><Bi entry={T.age} lang={lang} /> <span className={s.req}>*</span></label>
                                            <select
                                                required
                                                disabled={isSubmitting}
                                                className={s.select}
                                                value={student.age}
                                                onChange={(e) => updateStudent(index, "age", e.target.value)}
                                            >
                                                <option value="">{t(T.selectAge, lang)}</option>
                                                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(age => (
                                                    <option key={age} value={String(age)}>{t(T.yearsOld, lang, { n: age })}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}

                                {students.length > 1 && students.length < 5 && students.length < spotsRemaining && (
                                    <button
                                        type="button"
                                        onClick={addStudent}
                                        disabled={isSubmitting}
                                        className={s.addChildBtn}
                                    >
                                        <AddIcon style={{ fontSize: 18 }} /> {t(T.addAnotherChild, lang)}
                                    </button>
                                )}

                                <h2 className={s.formTitle}><PersonIcon /> <Bi entry={T.parentInfo} lang={lang} /></h2>

                                <div className={s.grid}>
                                    <div className={s.field}>
                                        <label><Bi entry={T.parentFirstName} lang={lang} block /> <span className={s.req}>*</span></label>
                                        <input
                                            name="parentFirstName"
                                            placeholder={t(T.phFirstName, lang)}
                                            required
                                            disabled={isSubmitting}
                                            value={parentFirstName}
                                            onChange={(e) => setParentFirstName(e.target.value)}
                                            style={hasNameConflict ? { borderColor: "#DC2626", boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)" } : undefined}
                                        />
                                    </div>

                                    <div className={s.field}>
                                        <label><Bi entry={T.parentLastName} lang={lang} block /> <span className={s.req}>*</span></label>
                                        <input
                                            name="parentLastName"
                                            placeholder={t(T.phLastName, lang)}
                                            required
                                            disabled={isSubmitting}
                                            value={parentLastName}
                                            onChange={(e) => setParentLastName(e.target.value)}
                                            style={hasNameConflict ? { borderColor: "#DC2626", boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)" } : undefined}
                                        />
                                    </div>
                                </div>
                                {hasNameConflict && (
                                    <div style={{
                                        background: "#FEF2F2",
                                        border: "1px solid #FECACA",
                                        borderRadius: "8px",
                                        padding: "10px 14px",
                                        marginTop: "-8px",
                                        marginBottom: "8px",
                                        color: "#B91C1C",
                                        fontSize: "0.85rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}>
                                        <InfoOutlinedIcon style={{ fontSize: 16 }} />
                                        <span><Bi entry={T.nameConflict} lang={lang} block /></span>
                                    </div>
                                )}

                                <div className={s.grid}>
                                    <div className={s.field}>
                                        <label><Bi entry={T.email} lang={lang} block /> <span className={s.req}>*</span></label>
                                        <input name="email" type="email" placeholder="you@email.com" required disabled={isSubmitting} />
                                    </div>
                                </div>

                                <div className={s.grid}>
                                    <div className={s.field}>
                                        <label><Bi entry={T.phone} lang={lang} block /> <span className={s.req}>*</span></label>
                                        <input name="phone" type="tel" placeholder="+1 (000) 000-0000" required disabled={isSubmitting} />
                                    </div>
                                </div>

                                <div className={s.grid}>
                                    <div className={s.field}>
                                        <label><Bi entry={T.schoolName} lang={lang} block /> <span className={s.req}>*</span></label>
                                        <input name="schoolName" placeholder={t(T.phSchool, lang)} required disabled={isSubmitting} />
                                    </div>
                                </div>

                                {selectedSession.online ? (
                                    <div className={s.grid}>
                                        <div className={s.field}>
                                            <label><Bi entry={T.country} lang={lang} block /> <span className={s.req}>*</span></label>
                                            <input name="country" placeholder={t(T.phCountry, lang)} required disabled={isSubmitting} />
                                        </div>
                                        <div className={s.field}>
                                            <label><Bi entry={T.homeZip} lang={lang} block /> <span className={s.req}>*</span></label>
                                            <input name="zipCode" placeholder={t(T.phHomeZip, lang)} required disabled={isSubmitting} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className={s.formTitle}>
                                            <HomeIcon /> <Bi entry={T.mailingAddress} lang={lang} />
                                        </h2>
                                        <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "-4px 0 16px", lineHeight: 1.5 }}>
                                            <InfoOutlinedIcon style={{ fontSize: 14, color: "#9CA3AF", verticalAlign: "middle", marginRight: "4px" }} />
                                            <Bi entry={T.mailingNote} lang={lang} block />
                                        </p>

                                        <div className={s.field}>
                                            <label><Bi entry={T.streetAddress} lang={lang} block /> <span className={s.req}>*</span></label>
                                            <input name="streetAddress" placeholder="123 Main St" required disabled={isSubmitting} />
                                        </div>

                                        <div className={s.grid}>
                                            <div className={s.field}>
                                                <label><Bi entry={T.city} lang={lang} block /> <span className={s.req}>*</span></label>
                                                <input name="city" placeholder="San Jose" required disabled={isSubmitting} />
                                            </div>
                                            <div className={s.field}>
                                                <label><Bi entry={T.state} lang={lang} block /> <span className={s.req}>*</span></label>
                                                <input name="state" placeholder="CA" required disabled={isSubmitting} />
                                            </div>
                                        </div>

                                        <div className={s.grid}>
                                            <div className={s.field}>
                                                <label><Bi entry={T.zipCode} lang={lang} block /> <span className={s.req}>*</span></label>
                                                <input name="zipCode" placeholder="95120" required disabled={isSubmitting} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className={s.field}>
                                    <label><Bi entry={T.additionalInfo} lang={lang} block /></label>
                                    <textarea
                                        name="additionalInfo"
                                        rows="4"
                                        placeholder={t(T.phAdditional, lang)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Optional Donation */}
                                <div style={{
                                    background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)",
                                    border: "1px solid #FDE68A",
                                    borderRadius: "16px",
                                    padding: "24px",
                                    marginTop: "8px",
                                }}>
                                    <h2 className={s.formTitle} style={{ marginTop: 0, borderBottomColor: "#F59E0B" }}>
                                        <VolunteerActivismIcon style={{ color: "#F59E0B" }} /> <Bi entry={T.supportTitle} lang={lang} />
                                    </h2>
                                    <p style={{ fontSize: "0.9rem", color: "#6B7280", lineHeight: 1.7, margin: "0 0 16px" }}>
                                        {t(T.supportLeadEn, lang)} <strong>{t(T.supportFree, lang)}</strong> {t(T.supportNoDonation, lang)}{" "}
                                        <Bi entry={selectedSession.online ? T.supportOnline : T.supportInPerson} lang={lang} block />
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                                        {[0, 5, 10].map(amt => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setDonationAmount(amt)}
                                                disabled={isSubmitting}
                                                style={{
                                                    flex: "1 1 80px",
                                                    padding: "12px 16px",
                                                    borderRadius: "12px",
                                                    border: donationAmount === amt ? "2px solid #F59E0B" : "2px solid #E5E7EB",
                                                    background: donationAmount === amt ? "#FEF3C7" : "#FFFFFF",
                                                    color: donationAmount === amt ? "#92400E" : "#374151",
                                                    fontWeight: 700,
                                                    fontSize: "1rem",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                {amt === 0 ? t(T.noThanks, lang) : `$${amt}`}
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: "0.8rem", color: "#9CA3AF", margin: 0, textAlign: "center" }}>
                                        <Bi entry={donationAmount > 0 ? T.donateThanks : T.donateSkip} lang={lang} block />
                                    </p>
                                </div>

                                <div className={s.actions}>
                                    {/* Radios (required): photo/video permission, opt-in */}
                                    <fieldset className={s.consentBlock}>
                                        <legend className={s.consentTitle}>
                                            <Bi entry={T.photoTitle} lang={lang} /> <span className={s.req}>*</span>
                                        </legend>
                                        <p className={s.consentIntro}>
                                            <Bi entry={T.photoIntro} lang={lang} block />
                                        </p>
                                        <label className={s.check}>
                                            <input
                                                type="radio"
                                                name="photoConsent"
                                                value="yes"
                                                checked={photoConsent === "yes"}
                                                onChange={() => setPhotoConsent("yes")}
                                                disabled={isSubmitting}
                                            />
                                            <span>
                                                <Bi entry={T.photoYes} lang={lang} block />
                                            </span>
                                        </label>
                                        <label className={s.check}>
                                            <input
                                                type="radio"
                                                name="photoConsent"
                                                value="no"
                                                checked={photoConsent === "no"}
                                                onChange={() => setPhotoConsent("no")}
                                                disabled={isSubmitting}
                                            />
                                            <span>
                                                <Bi entry={T.photoNo} lang={lang} block />
                                            </span>
                                        </label>
                                    </fieldset>

                                    {/* Checkbox (optional): Future contact opt-in */}
                                    <label className={s.check}>
                                        <input
                                            type="checkbox"
                                            checked={futureContact}
                                            onChange={(e) => setFutureContact(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        <span>
                                            <Bi entry={T.futureContact} lang={lang} block />
                                        </span>
                                    </label>

                                    {/* Checkbox 3 (required): Privacy Policy + Terms */}
                                    <label className={s.check}>
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        <span>
                                            {t(T.agreePrefix, lang)} <a className={s.link} href="/docs/privacy-policy.html" target="_blank" rel="noopener noreferrer">{t(T.privacyPolicy, lang)} <OpenInNewIcon style={{ fontSize: 14, verticalAlign: 'middle' }} /></a> {t(T.and, lang)} <a className={s.link} href="/docs/terms-of-service.html" target="_blank" rel="noopener noreferrer">{t(T.termsOfService, lang)} <OpenInNewIcon style={{ fontSize: 14, verticalAlign: 'middle' }} /></a>{lang === "en" ? "." : lang === "es" ? " de Almaden Voices." : " (Almaden Voices)."} <span className={s.req}>*</span>
                                        </span>
                                    </label>

                                    <button className={s.btn} disabled={!agreed || !photoConsent || isSubmitting || hasNameConflict}>
                                        <span>{isSubmitting
                                            ? t(T.submitting, lang)
                                            : students.length > 1
                                                ? t(T.registerCount, lang, { n: students.length })
                                                : t(T.registerNow, lang)}</span>
                                        <SendIcon fontSize="small" />
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </section>}

            </div>

            {/* Success popup modal */}
            {submitted && (
                <div
                    className={s.modalOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="register-success-title"
                    onClick={() => setSubmitted(false)}
                >
                    <div className={s.modal} onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className={s.modalClose}
                            aria-label={t(T.close, lang)}
                            onClick={() => setSubmitted(false)}
                        >
                            <CloseIcon />
                        </button>
                        <div className={s.modalIcon}>
                            <CheckCircleIcon style={{ fontSize: 56 }} />
                        </div>
                        <h2 id="register-success-title"><Bi entry={T.successTitle} lang={lang} block /></h2>
                        <p><Bi entry={T.successBody} lang={lang} block /></p>
                    </div>
                </div>
            )}

            {/* Toast */}
            <div className={`${s.toast} ${showToast ? s.toastShow : ""}`} onAnimationEnd={() => setShowToast(false)}>
                {t(T.toast, lang)}
            </div>
        </div>
    );
}
