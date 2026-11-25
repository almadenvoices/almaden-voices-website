import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import PlaceIcon from "@mui/icons-material/Place";
import PersonIcon from "@mui/icons-material/Person";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import s from "./Register.module.css";
import { T, t, Bi, LANG_STORAGE_KEY, DEFAULT_LANG } from "../../i18n/registerText";
import { upcomingSessions } from "../../data/sessions";

/**
 * The Register page is a list of upcoming workshops. It collects nothing:
 * families register on AniSetu, and each session links to its page there.
 *
 * To add or remove a session, edit client/src/data/sessions.js.
 * One-on-one coaching is booked on its own page, /coaching.
 */

// Wraps a session field and its Spanish twin into the {en, es} shape <Bi> wants.
// A session with no Spanish for a field shows the English in both modes.
const bi = (en, es) => ({ en: en || "", es: es || en || "" });

export default function RegisterPage() {
    const navigate = useNavigate();

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

    // Coaching used to be booked on this page, and old emails and flyers still
    // link to /register#coaching-signup. Send those visitors to /coaching.
    useEffect(() => {
        if (window.location.hash === "#coaching-signup") {
            navigate("/coaching", { replace: true });
        }
    }, [navigate]);

    const sessions = upcomingSessions.filter(ses => ses && ses.title);

    return (
        <div className={s.page}>
            <section className={s.hero}>
                <div className="container">
                    <div className={s.heroBadgeWrap}>
                        <div className={s.heroBadge}>
                            <EventIcon fontSize="small" /> <Bi entry={T.heroBadge} lang={lang} />
                        </div>
                    </div>
                    <h1 className={s.heroTitle}><Bi entry={T.heroTitle} lang={lang} block /></h1>
                    <p className={s.heroSub}><Bi entry={T.heroSub} lang={lang} block /></p>
                </div>
            </section>

            <div className="container">
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

                <div className={s.listing}>
                    <section className={s.how} aria-labelledby="how-title">
                        <h2 id="how-title"><Bi entry={T.howTitle} lang={lang} /></h2>
                        <p><Bi entry={T.howBody} lang={lang} block /></p>
                        <p className={s.policyLine}>
                            {t(T.policyPrefix, lang)}{" "}
                            <a className={s.link} href="/docs/privacy-policy.html" target="_blank" rel="noopener noreferrer">{t(T.privacyPolicy, lang)}</a>{" "}
                            {t(T.and, lang)}{" "}
                            <a className={s.link} href="/docs/terms-of-service.html" target="_blank" rel="noopener noreferrer">{t(T.termsOfService, lang)}</a>.
                        </p>
                    </section>

                    {sessions.length > 0 ? (
                        <ul className={s.sessions}>
                            {sessions.map((ses, i) => (
                                <li key={ses.anisetuUrl || ses.title + i} className={s.session}>
                                    <h2 className={s.sessionTitle}><Bi entry={bi(ses.title, ses.titleEs)} lang={lang} block /></h2>
                                    {ses.description && (
                                        <p className={s.sessionDesc}><Bi entry={bi(ses.description, ses.descriptionEs)} lang={lang} block /></p>
                                    )}
                                    <dl className={s.facts}>
                                        {ses.dates && <div className={s.fact}>
                                            <CalendarMonthIcon fontSize="small" aria-hidden="true" />
                                            <dt className={s.visuallyHidden}>{t(T.when, lang)}</dt>
                                            <dd style={{ margin: 0 }}><Bi entry={bi(ses.dates, ses.datesEs)} lang={lang} block /></dd>
                                        </div>}
                                        {ses.times && <div className={s.fact}>
                                            <AccessTimeIcon fontSize="small" aria-hidden="true" />
                                            <dt className={s.visuallyHidden}>{t(T.time, lang)}</dt>
                                            <dd style={{ margin: 0 }}><Bi entry={bi(ses.times, ses.timesEs)} lang={lang} block /></dd>
                                        </div>}
                                        {ses.ages && <div className={s.fact}>
                                            <GroupsIcon fontSize="small" aria-hidden="true" />
                                            <dt className={s.visuallyHidden}>{t(T.ages, lang)}</dt>
                                            <dd style={{ margin: 0 }}><Bi entry={bi(ses.ages, ses.agesEs)} lang={lang} block /></dd>
                                        </div>}
                                        {ses.location && <div className={s.fact}>
                                            <PlaceIcon fontSize="small" aria-hidden="true" />
                                            <dt className={s.visuallyHidden}>{t(T.where, lang)}</dt>
                                            <dd style={{ margin: 0 }}><Bi entry={bi(ses.location, ses.locationEs)} lang={lang} block /></dd>
                                        </div>}
                                        {ses.instructor && <div className={s.fact}>
                                            <PersonIcon fontSize="small" aria-hidden="true" />
                                            <dt className={s.visuallyHidden}>{t(T.instructor, lang)}</dt>
                                            <dd style={{ margin: 0 }}><Bi entry={T.instructorPrefix} lang={lang} /> {ses.instructor}</dd>
                                        </div>}
                                        {ses.price && <div className={s.fact}>
                                            <LocalOfferIcon fontSize="small" aria-hidden="true" />
                                            <dt className={s.visuallyHidden}>{t(T.price, lang)}</dt>
                                            <dd style={{ margin: 0 }}><Bi entry={bi(ses.price, ses.priceEs)} lang={lang} /></dd>
                                        </div>}
                                        {ses.spots && <div className={s.fact}>
                                            <EventSeatIcon fontSize="small" aria-hidden="true" />
                                            <dt className={s.visuallyHidden}>{t(T.spots, lang)}</dt>
                                            <dd style={{ margin: 0 }}><Bi entry={bi(ses.spots, ses.spotsEs)} lang={lang} /></dd>
                                        </div>}
                                    </dl>
                                    {ses.anisetuUrl && (
                                        <a className={s.registerBtn} href={ses.anisetuUrl} target="_blank" rel="noopener noreferrer">
                                            {t(T.registerBtn, lang)} <OpenInNewIcon fontSize="small" aria-hidden="true" />
                                            <span className={s.visuallyHidden}>{t(T.newTab, lang)}</span>
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <section className={s.empty} aria-labelledby="empty-title">
                            <h2 id="empty-title"><Bi entry={T.emptyTitle} lang={lang} block /></h2>
                            <p><Bi entry={T.emptyBody} lang={lang} block /></p>
                            <p><a className={s.link} href="#footer-email">{t(T.emptyLink, lang)}</a></p>
                        </section>
                    )}

                    <p className={s.coachingNote}>
                        {t(T.coachingPrefix, lang)}{" "}
                        <Link className={s.link} to="/coaching">{t(T.coachingLink, lang)}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
