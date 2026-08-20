import React, { useState, useRef } from "react";
import s from "./Volunteer.module.css";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockClockIcon from "@mui/icons-material/LockClock";
import PersonIcon from "@mui/icons-material/Person";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import SavingsIcon from "@mui/icons-material/Savings";
import CelebrationIcon from "@mui/icons-material/Celebration";
import SchoolIcon from "@mui/icons-material/School";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import TranslateIcon from "@mui/icons-material/Translate";
import {
    POSITIONS,
    APPLICATIONS_OPEN,
    DEADLINE_LINE,
    COMMITMENT_LINE,
    MIN_GRADE,
    GRADE_REQUIREMENT_LINE,
    CLOSED_MESSAGE,
    CONFIRMATION_MESSAGE,
} from "./volunteerData";

const ROLE_ICONS = {
    outreach: ConnectWithoutContactIcon,
    grants: SavingsIcon,
    events: CelebrationIcon,
    schools: SchoolIcon,
    instructor: RecordVoiceOverIcon,
    bilingual: TranslateIcon,
};

// The age box takes "16", "10th grade", "Grade 11" — anything with a number in
// it. The first number decides whether the under-18 fields appear; a grade
// number is always below 18 anyway, so it lands in the same place. Text with
// no number at all leaves the extra fields hidden rather than guessing.
function isUnder18(ageText) {
    const match = String(ageText || "").match(/\d+/);
    if (!match) return false;
    return Number(match[0]) < 18;
}

// Work out whether what someone typed is a grade or an age, so the 8th-grade
// floor can be enforced without rejecting an adult who wrote "34".
// Returns "ok" | "too-young" | "unknown" — "unknown" is let through, because a
// human reading "college sophomore" will sort it out faster than a regex.
function checkGradeFloor(text) {
    const raw = String(text || "").trim().toLowerCase();
    if (!raw) return "unknown";

    // Kindergarten and pre-K never carry a usable number.
    if (/\b(pre-?k|prek|kinder\w*|\bk\b)/.test(raw)) return "too-young";

    // Anything that reads as past high school clears the bar outright.
    if (/(college|university|undergrad|graduate|adult|parent|profession|working|teacher|retired)/.test(raw)) {
        return "ok";
    }

    const num = raw.match(/\d+/);
    if (!num) return "unknown";
    const value = Number(num[0]);

    // "9th grade", "grade 9", "9th" — treat the number as a grade level.
    const readsAsGrade = /grade|\d+\s*(st|nd|rd|th)\b/.test(raw);
    if (readsAsGrade) return value >= MIN_GRADE ? "ok" : "too-young";

    // A bare number is an age. 13 is the youngest an 8th grader normally is, so
    // that's the floor — better to let a 13-year-old 7th grader through and
    // catch it at interview than to turn away an eligible 8th grader.
    return value >= 13 ? "ok" : "too-young";
}

const emailLooksValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

export default function VolunteerPage() {
    const [openRole, setOpenRole] = useState("");

    const [applyingAs, setApplyingAs] = useState("");
    const [parentName, setParentName] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [ageOrGrade, setAgeOrGrade] = useState("");
    const [roles, setRoles] = useState([]);
    const [why, setWhy] = useState("");
    const [availability, setAvailability] = useState("");
    const [mediaConsent, setMediaConsent] = useState(false);
    const [guardianConsent, setGuardianConsent] = useState(false);

    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const formRef = useRef(null);

    // Which conditional blocks are live right now. Anything not showing is
    // also not validated, so a hidden field can never block the submit.
    const under18 = isUnder18(ageOrGrade);
    const showParentBlock = applyingAs === "parent";
    const showUnder18Block = applyingAs === "self" && under18;
    const showGuardianConsent = showUnder18Block;

    function toggleRole(id) {
        setRoles((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
    }

    function openApplication(roleId) {
        if (roleId && !roles.includes(roleId)) setRoles((prev) => [...prev, roleId]);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
    }

    function validate() {
        const next = {};

        if (!applyingAs) next.applyingAs = "Please choose one.";

        if (showParentBlock) {
            if (!parentName.trim()) next.parentName = "Required.";
            if (!parentEmail.trim()) next.parentEmail = "Required.";
            else if (!emailLooksValid(parentEmail)) next.parentEmail = "Please enter a valid email address.";
            if (!parentPhone.trim()) next.parentPhone = "Required.";
        }

        if (!fullName.trim()) next.fullName = "Required.";
        if (!email.trim()) next.email = "Required.";
        else if (!emailLooksValid(email)) next.email = "Please enter a valid email address.";
        if (!phone.trim()) next.phone = "Required.";
        if (!ageOrGrade.trim()) next.ageOrGrade = "Required.";
        else if (checkGradeFloor(ageOrGrade) === "too-young") {
            // A bare "8" reads as age 8 and gets caught here, so the message
            // spells out how to write a grade.
            next.ageOrGrade = "Volunteers need to be in 8th grade or higher. If you meant a grade level, write it like \"8th grade\".";
        }

        if (showUnder18Block) {
            if (!parentName.trim()) next.parentName = "Required.";
            if (!parentEmail.trim()) next.parentEmail = "Required.";
            else if (!emailLooksValid(parentEmail)) next.parentEmail = "Please enter a valid email address.";
        }

        if (roles.length === 0) next.roles = "Please pick at least one position.";
        if (!why.trim()) next.why = "Required.";
        if (!availability.trim()) next.availability = "Required.";
        if (!mediaConsent) next.mediaConsent = "Please check this box to continue.";
        if (showGuardianConsent && !guardianConsent) next.guardianConsent = "Please check this box to continue.";

        return next;
    }

    async function onSubmit(e) {
        e.preventDefault();
        setFormError("");

        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) {
            setFormError("Please fill in the highlighted fields below and try again.");
            const firstBad = document.querySelector(`.${s.fieldError}, .${s.checkError}`);
            firstBad?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setIsSubmitting(true);

        const roleTitles = roles
            .map((id) => POSITIONS.find((p) => p.id === id)?.title || id)
            .join(", ");

        try {
            const response = await fetch("/api/volunteer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applyingAs,
                    parentName: showParentBlock || showUnder18Block ? parentName : "",
                    parentEmail: showParentBlock || showUnder18Block ? parentEmail : "",
                    parentPhone: showParentBlock ? parentPhone : "",
                    fullName,
                    email,
                    phone,
                    ageOrGrade,
                    positions: roleTitles,
                    why,
                    availability,
                    mediaConsent,
                    guardianConsent: showGuardianConsent ? guardianConsent : null,
                }),
            });

            const result = await response.json().catch(() => null);

            if (response.ok && result && result.success) {
                setSubmitted(true);
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                setFormError((result && result.error) || "Something went wrong sending your application. Please try again.");
            }
        } catch (err) {
            console.error("Volunteer form error:", err);
            setFormError("Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className={s.page}>
            {/* ---------- Header ---------- */}
            <section className={s.hero}>
                <div className="container">
                    <div className={s.heroBadge}>
                        <VolunteerActivismIcon fontSize="small" /> Volunteer With Us
                    </div>
                    <h1 className={s.heroTitle}>Join the Almaden Voices Team</h1>
                    <p className={s.heroSub}>
                        Almaden Voices is a San José 501(c)(3) that has taught free public speaking to more than
                        140 students since March 2025. We&apos;re growing — and we&apos;re looking for volunteers
                        who want to help more kids find their voices.
                    </p>
                    <p className={s.heroNote}>
                        All roles are volunteer and unpaid. Most are remote and flexible; the Instructor role is
                        in person. We&apos;ll work around school and work schedules. Volunteers who stay committed
                        and do great work are welcome to continue beyond December — several of these roles are
                        ones we&apos;d love someone to grow into. Interviews begin the first week of September.{" "}
                        <strong>{GRADE_REQUIREMENT_LINE}</strong>
                    </p>
                </div>
            </section>

            {/* ---------- Deadline banner ---------- */}
            <div className="container">
                <div className={s.banner}>
                    <div className={s.bannerIcon}>
                        <ScheduleIcon />
                    </div>
                    <div className={s.bannerText}>
                        <span className={s.bannerLine1}>{DEADLINE_LINE}</span>
                        <span className={s.bannerLine2}>{COMMITMENT_LINE}</span>
                        <span className={s.bannerLine2}>{GRADE_REQUIREMENT_LINE}</span>
                    </div>
                    {APPLICATIONS_OPEN && (
                        <button type="button" className={s.bannerBtn} onClick={() => openApplication("")}>
                            Apply now
                        </button>
                    )}
                </div>
            </div>

            {/* ---------- Positions ---------- */}
            <div className="container">
                <div className={s.sectionHead}>
                    <h2 className={s.sectionTitle}>Open positions</h2>
                    <p className={s.sectionSub}>
                        Tap a role to see the full description. You can apply for more than one.
                    </p>
                </div>

                <div className={s.cardGrid}>
                    {POSITIONS.map((position) => {
                        const Icon = ROLE_ICONS[position.id] || VolunteerActivismIcon;
                        const isOpen = openRole === position.id;
                        // The open role's detail panel is a full-width grid item
                        // dropped in right after its card, so it reads as an
                        // accordion on a phone and as a spanning row on desktop.
                        return (
                            <React.Fragment key={position.id}>
                                <button
                                    type="button"
                                    className={`${s.roleCard} ${isOpen ? s.roleCardOpen : ""}`}
                                    onClick={() => setOpenRole(isOpen ? "" : position.id)}
                                    aria-expanded={isOpen}
                                    aria-controls={`role-detail-${position.id}`}
                                >
                                    <div className={s.roleTop}>
                                        <span className={s.roleIcon}><Icon /></span>
                                        <span className={s.roleTitle}>{position.title}</span>
                                        <ExpandMoreIcon className={s.roleChevron} />
                                    </div>
                                    {(position.openings || position.inPerson) && (
                                        <div className={s.roleTags}>
                                            {position.openings && <span className={s.tag}>{position.openings}</span>}
                                            {position.inPerson && (
                                                <span className={`${s.tag} ${s.tagInPerson}`}>In person</span>
                                            )}
                                        </div>
                                    )}
                                    <p className={s.roleSummary}>{position.summary}</p>
                                    <span className={s.roleMore}>{isOpen ? "Hide details" : "See the full role"}</span>
                                </button>

                                {isOpen && (
                                    <div className={s.detail} id={`role-detail-${position.id}`}>
                                        <div className={s.detailHead}>
                                            <h3 className={s.detailTitle}>{position.title}</h3>
                                            <button
                                                type="button"
                                                className={s.detailClose}
                                                onClick={() => setOpenRole("")}
                                                aria-label={`Close ${position.title} details`}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </button>
                                        </div>
                                        <p className={s.detailIntro}>{position.intro}</p>
                                        <div className={s.detailCols}>
                                            <div className={s.detailCol}>
                                                <h4>What you&apos;ll do</h4>
                                                <ul>
                                                    {position.doing.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>
                                            <div className={s.detailCol}>
                                                <h4>What we&apos;re looking for</h4>
                                                <ul>
                                                    {position.looking.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                        {position.note && (
                                            <p className={s.detailNote}><strong>Note:</strong> {position.note}</p>
                                        )}
                                        {APPLICATIONS_OPEN && (
                                            <button
                                                type="button"
                                                className={s.detailApply}
                                                onClick={() => openApplication(position.id)}
                                            >
                                                <HowToRegIcon fontSize="small" /> Apply for this role
                                            </button>
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* ---------- Applies to every role ---------- */}
                <div className={s.groundRules}>
                    <h3>A few things that apply to every role</h3>
                    <ul>
                        <li>{GRADE_REQUIREMENT_LINE} This applies to every role, including the remote ones.</li>
                        <li>Any email you send on behalf of Almaden Voices must cc almadenvoices@gmail.com</li>
                        <li>
                            For your first month, send drafts to us for a quick look before they go out. Once
                            you&apos;ve got the voice down, you&apos;ll send on your own.
                        </li>
                        <li>
                            We&apos;ll give you templates, talking points, and whatever context you need. You
                            won&apos;t be starting from a blank page.
                        </li>
                    </ul>
                </div>

                {/* ---------- Application form ---------- */}
                <div className={s.formCard} ref={formRef} id="apply">
                    {!APPLICATIONS_OPEN ? (
                        <div className={s.closed}>
                            <LockClockIcon sx={{ fontSize: 56 }} className={s.closedIcon} />
                            <h2>{CLOSED_MESSAGE.title}</h2>
                            <p>{CLOSED_MESSAGE.body}</p>
                        </div>
                    ) : submitted ? (
                        <div className={s.success}>
                            <CheckCircleIcon sx={{ fontSize: 56 }} className={s.successIcon} />
                            <h2>Application received</h2>
                            <p>{CONFIRMATION_MESSAGE}</p>
                        </div>
                    ) : (
                        <form className={s.form} onSubmit={onSubmit} noValidate>
                            <div className={s.sectionHead} style={{ marginBottom: 0 }}>
                                <h2 className={s.sectionTitle}>Apply</h2>
                                <p className={s.sectionSub}>
                                    Everything marked <span className={s.req}>*</span> is required.
                                </p>
                            </div>

                            {/* Who is applying */}
                            <div className={`${s.field} ${errors.applyingAs ? s.fieldError : ""}`}>
                                <label>
                                    Are you applying for yourself, or as a parent/guardian on behalf of your child?{" "}
                                    <span className={s.req}>*</span>
                                </label>
                                <div className={s.optionGroup}>
                                    <label className={`${s.option} ${applyingAs === "self" ? s.optionChecked : ""}`}>
                                        <input
                                            type="radio"
                                            name="applyingAs"
                                            value="self"
                                            checked={applyingAs === "self"}
                                            onChange={() => setApplyingAs("self")}
                                            disabled={isSubmitting}
                                        />
                                        <span className={s.optionLabel}>I&apos;m applying for myself</span>
                                    </label>
                                    <label className={`${s.option} ${applyingAs === "parent" ? s.optionChecked : ""}`}>
                                        <input
                                            type="radio"
                                            name="applyingAs"
                                            value="parent"
                                            checked={applyingAs === "parent"}
                                            onChange={() => setApplyingAs("parent")}
                                            disabled={isSubmitting}
                                        />
                                        <span className={s.optionLabel}>
                                            I&apos;m a parent or guardian applying on behalf of my child
                                        </span>
                                    </label>
                                </div>
                                {errors.applyingAs && <p className={s.fieldErrorText}>{errors.applyingAs}</p>}
                            </div>

                            {/* Parent block — parent/guardian applying */}
                            {showParentBlock && (
                                <div className={s.conditional}>
                                    <span className={s.conditionalLabel}>Your details (parent or guardian)</span>
                                    <div className={s.grid}>
                                        <div className={`${s.field} ${errors.parentName ? s.fieldError : ""}`}>
                                            <label htmlFor="parentName">
                                                Parent/guardian full name <span className={s.req}>*</span>
                                            </label>
                                            <input
                                                id="parentName"
                                                type="text"
                                                value={parentName}
                                                onChange={(e) => setParentName(e.target.value)}
                                                disabled={isSubmitting}
                                                autoComplete="name"
                                            />
                                            {errors.parentName && <p className={s.fieldErrorText}>{errors.parentName}</p>}
                                        </div>
                                        <div className={`${s.field} ${errors.parentEmail ? s.fieldError : ""}`}>
                                            <label htmlFor="parentEmail">
                                                Parent/guardian email <span className={s.req}>*</span>
                                            </label>
                                            <input
                                                id="parentEmail"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={parentEmail}
                                                onChange={(e) => setParentEmail(e.target.value)}
                                                disabled={isSubmitting}
                                                autoComplete="email"
                                            />
                                            {errors.parentEmail && <p className={s.fieldErrorText}>{errors.parentEmail}</p>}
                                        </div>
                                        <div className={`${s.field} ${errors.parentPhone ? s.fieldError : ""}`}>
                                            <label htmlFor="parentPhone">
                                                Parent/guardian phone <span className={s.req}>*</span>
                                            </label>
                                            <input
                                                id="parentPhone"
                                                type="tel"
                                                placeholder="(000) 000-0000"
                                                value={parentPhone}
                                                onChange={(e) => setParentPhone(e.target.value)}
                                                disabled={isSubmitting}
                                                autoComplete="tel"
                                            />
                                            {errors.parentPhone && <p className={s.fieldErrorText}>{errors.parentPhone}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h3 className={s.formTitle}>
                                <PersonIcon /> {showParentBlock ? "The volunteer" : "About you"}
                            </h3>

                            <div className={s.grid}>
                                <div className={`${s.field} ${errors.fullName ? s.fieldError : ""}`}>
                                    <label htmlFor="fullName">
                                        {showParentBlock ? "Volunteer's full name" : "Full name"}{" "}
                                        <span className={s.req}>*</span>
                                    </label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={isSubmitting}
                                        autoComplete={showParentBlock ? "off" : "name"}
                                    />
                                    {errors.fullName && <p className={s.fieldErrorText}>{errors.fullName}</p>}
                                </div>

                                <div className={`${s.field} ${errors.email ? s.fieldError : ""}`}>
                                    <label htmlFor="email">
                                        {showParentBlock ? "Volunteer's email" : "Email"}{" "}
                                        <span className={s.req}>*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.email && <p className={s.fieldErrorText}>{errors.email}</p>}
                                </div>

                                <div className={`${s.field} ${errors.phone ? s.fieldError : ""}`}>
                                    <label htmlFor="phone">
                                        {showParentBlock ? "Volunteer's phone" : "Phone"}{" "}
                                        <span className={s.req}>*</span>
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        placeholder="(000) 000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.phone && <p className={s.fieldErrorText}>{errors.phone}</p>}
                                </div>

                                <div className={`${s.field} ${errors.ageOrGrade ? s.fieldError : ""}`}>
                                    <label htmlFor="ageOrGrade">
                                        Age or grade level <span className={s.req}>*</span>
                                    </label>
                                    <p className={s.hint}>Must be in 8th grade or higher.</p>
                                    <input
                                        id="ageOrGrade"
                                        type="text"
                                        placeholder="e.g. 17, or 11th grade"
                                        value={ageOrGrade}
                                        onChange={(e) => setAgeOrGrade(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.ageOrGrade && <p className={s.fieldErrorText}>{errors.ageOrGrade}</p>}
                                </div>
                            </div>

                            {/* Under-18 guardian details when applying for yourself */}
                            {showUnder18Block && (
                                <div className={s.conditional}>
                                    <span className={s.conditionalLabel}>
                                        Because you&apos;re under 18, we need a parent or guardian&apos;s details
                                    </span>
                                    <div className={s.grid}>
                                        <div className={`${s.field} ${errors.parentName ? s.fieldError : ""}`}>
                                            <label htmlFor="under18ParentName">
                                                Parent/guardian name <span className={s.req}>*</span>
                                            </label>
                                            <input
                                                id="under18ParentName"
                                                type="text"
                                                value={parentName}
                                                onChange={(e) => setParentName(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            {errors.parentName && <p className={s.fieldErrorText}>{errors.parentName}</p>}
                                        </div>
                                        <div className={`${s.field} ${errors.parentEmail ? s.fieldError : ""}`}>
                                            <label htmlFor="under18ParentEmail">
                                                Parent/guardian email <span className={s.req}>*</span>
                                            </label>
                                            <input
                                                id="under18ParentEmail"
                                                type="email"
                                                placeholder="parent@example.com"
                                                value={parentEmail}
                                                onChange={(e) => setParentEmail(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            {errors.parentEmail && <p className={s.fieldErrorText}>{errors.parentEmail}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Positions */}
                            <h3 className={s.formTitle}>
                                <HowToRegIcon /> The role
                            </h3>

                            <div className={`${s.field} ${errors.roles ? s.fieldError : ""}`}>
                                <label>
                                    Which position(s) are you applying for? <span className={s.req}>*</span>
                                </label>
                                <p className={s.hint}>Pick as many as you&apos;d like.</p>
                                <div className={s.optionGrid}>
                                    {POSITIONS.map((position) => (
                                        <label
                                            key={position.id}
                                            className={`${s.option} ${roles.includes(position.id) ? s.optionChecked : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={roles.includes(position.id)}
                                                onChange={() => toggleRole(position.id)}
                                                disabled={isSubmitting}
                                            />
                                            <span className={s.optionLabel}>
                                                {position.title}
                                                {position.inPerson && <span className={s.optionSub}>In person</span>}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.roles && <p className={s.fieldErrorText}>{errors.roles}</p>}
                            </div>

                            <div className={`${s.field} ${errors.why ? s.fieldError : ""}`}>
                                <label htmlFor="why">
                                    Why this role, and what would you bring to it? <span className={s.req}>*</span>
                                </label>
                                <p className={s.hint}>About 150 words is plenty.</p>
                                <textarea
                                    id="why"
                                    value={why}
                                    onChange={(e) => setWhy(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                {errors.why && <p className={s.fieldErrorText}>{errors.why}</p>}
                            </div>

                            <div className={`${s.field} ${errors.availability ? s.fieldError : ""}`}>
                                <label htmlFor="availability">
                                    This role asks for about 2–3 hours per week from September through December. Can
                                    you commit to that, and is there anything about your schedule we should know?{" "}
                                    <span className={s.req}>*</span>
                                </label>
                                <input
                                    id="availability"
                                    type="text"
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                {errors.availability && <p className={s.fieldErrorText}>{errors.availability}</p>}
                            </div>

                            {/* Consent */}
                            <div className={s.actions}>
                                <label className={`${s.check} ${errors.mediaConsent ? s.checkError : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={mediaConsent}
                                        onChange={(e) => setMediaConsent(e.target.checked)}
                                        disabled={isSubmitting}
                                    />
                                    <span>
                                        I understand that volunteers may be photographed and filmed during Almaden
                                        Voices activities, and that these photos, videos, and my name may appear on
                                        the Almaden Voices website and social media. <span className={s.req}>*</span>
                                    </span>
                                </label>

                                {showGuardianConsent && (
                                    <label className={`${s.check} ${errors.guardianConsent ? s.checkError : ""}`}>
                                        <input
                                            type="checkbox"
                                            checked={guardianConsent}
                                            onChange={(e) => setGuardianConsent(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        <span>
                                            My parent or guardian knows I am applying and has agreed to the above.{" "}
                                            <span className={s.req}>*</span>
                                        </span>
                                    </label>
                                )}

                                {formError && <div className={s.errorBox}>{formError}</div>}

                                <button type="submit" className={s.btn} disabled={isSubmitting}>
                                    {isSubmitting ? "Sending…" : <>Submit application <SendIcon fontSize="small" /></>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
