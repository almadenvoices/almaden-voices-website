import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import SubNav from "../../components/SubNav/SubNav";
import usePageMeta from "../../hooks/usePageMeta";
import VolunteerPage from "../Volunteer/VolunteerPage";
import p from "../../styles/page.module.css";
import s from "./GetInvolved.module.css";

// The chapter guide deck and the application form both live in the
// almadenvoices Google account. Edits made there show up here automatically.
const GUIDE_EMBED_URL =
    "https://docs.google.com/presentation/d/1_VNDbM7Eq3cWgvw8PP1vsG_H_PnbweD-c_gMcXmP2ms/embed?start=false&loop=false";
const GUIDE_URL =
    "https://docs.google.com/presentation/d/1_VNDbM7Eq3cWgvw8PP1vsG_H_PnbweD-c_gMcXmP2ms/edit?usp=sharing";
const FORM_EMBED_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSeBMoIqDDTRZ6-234QzQu7x06hOVb4u_UA6ESdbDkBtRpzUxA/viewform?embedded=true";
const FORM_URL = "https://forms.gle/QWsmu6XRy3j8tGTi6";

const WHAT_YOU_GET = [
    ["Recognition for your work", "You earn volunteer hours and track how many students you reach. Chapter leaders who complete a year in good standing can get a letter of recommendation from our CEO."],
    ["A nonprofit to work under", "You run under Almaden Voices' 501(c)(3), and we help when you're working with schools, libraries and community partners."],
    ["Training and someone to ask", "A walkthrough before your first workshop, regular check-ins, and help whenever a question comes up."],
    ["A curriculum that's been tested", "Our public speaking lesson plans for kindergarten through 9th grade, and the format we use for the final speeches."],
    ["Planning and outreach materials", "Templates for flyers, workshop slides, emails to families, surveys and more."],
    ["Registration handled for you", "Families register through AniSetu, the online platform we use for sign-ups, so you don't need to build your own system."],
];

const STEPS = [
    ["Read the chapter guide", "See what running a chapter involves and decide whether a school or local chapter fits your community."],
    ["Apply and interview", "Fill out the application below. If it moves forward, we'll invite you to a 20-minute interview and email you a decision within 5 to 10 business days."],
    ["Get started", "Sign a short chapter agreement and finish onboarding. We'll set you up with a chapter email, a shared drive, the curriculum and your first check-in."],
];

export default function GetInvolvedPage() {
    usePageMeta(
        "Get involved",
        "Start an Almaden Voices chapter at your school or in your town, volunteer with us, or host a free public speaking workshop. Chapter applications are open."
    );

    return (
        <>
            <PageHeader
                title="Get involved"
                intro="Students can start a chapter or volunteer with us. Schools, libraries and community groups can host a workshop."
            />
            <SubNav pageKey="get-involved" />

            {/* ---------- Start a chapter: the big invitation ---------- */}
            <section id="start-a-chapter" className={`${s.chapterBand} onDark`} aria-labelledby="chapter-title">
                <div className={`${p.inner} ${s.chapterGrid}`}>
                    <div>
                        <p className={s.open}>Chapter applications are open</p>
                        <h2 id="chapter-title" className={s.chapterTitle}>
                            Start an Almaden Voices chapter where you live.
                        </h2>
                        <p className={s.chapterLead}>
                            Bring free public speaking workshops to kids at your school or in your town.
                            You lead it with your own team. We give you the curriculum, the training and a
                            nonprofit to work under.
                        </p>
                        <div className={p.actions}>
                            <a href="#chapter-application" className={p.buttonBig}>Apply to start a chapter</a>
                            <a href="#chapter-guide" className={s.guideLink}>Read the chapter guide first</a>
                        </div>
                    </div>
                    <figure className={s.chapterFigure}>
                        <img
                            src="/images/s6-raising-hands.jpg"
                            alt="Kids sitting on the carpet of a library community room shoot their hands up to answer a question from the volunteer at the front."
                            width="1600"
                            height="896"
                            loading="lazy"
                        />
                        <figcaption className={p.caption}>
                            Hands up at our March 2026 workshop. A chapter runs workshops like this one.
                        </figcaption>
                    </figure>
                </div>
            </section>

            {/* What a chapter is */}
            <section id="what-is-a-chapter" className={p.section} aria-labelledby="what-title">
                <div className={p.medium}>
                    <h2 id="what-title" className={p.h2Small}>What a chapter is</h2>
                    <div className={p.prose}>
                        <p>
                            A chapter is part of our 501(c)(3), set up at your school or in your community
                            and led by you. You organize free public speaking workshops for kids nearby,
                            using our curriculum and resources, with registration through AniSetu.
                        </p>
                    </div>
                    <p className={s.commitment}>
                        The commitment: two workshops a month, about three hours a week through the school
                        year, and a monthly check-in with our team. You'll need a team of at least four
                        people to start.
                    </p>

                    <div className={s.types}>
                        <div>
                            <h3 className={p.h3}>School chapter</h3>
                            <p>
                                Part of your school, led by students with a faculty advisor. You recruit
                                volunteers at school and run workshops there, at local libraries and in
                                community spaces.
                            </p>
                        </div>
                        <div>
                            <h3 className={p.h3}>Local chapter</h3>
                            <p>
                                Serves a city or a wider area, not tied to one school. You recruit your own
                                volunteers and run workshops at libraries and community spaces through the
                                year.
                            </p>
                        </div>
                    </div>
                    <p className={p.small}>
                        Not sure which fits? Say so in the application and we'll talk it through in your
                        interview.
                    </p>
                </div>
            </section>

            {/* What you get */}
            <section className={`${p.section} ${p.wash}`} aria-labelledby="get-title">
                <div className={p.inner}>
                    <h2 id="get-title" className={p.h2Small}>What you get from us</h2>
                    <dl className={s.benefits}>
                        {WHAT_YOU_GET.map(([title, body]) => (
                            <div key={title} className={s.benefit}>
                                <dt>{title}</dt>
                                <dd>{body}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* How to apply: a real sequence, so it's numbered */}
            <section className={`${p.section} ${p.tight}`} aria-labelledby="steps-title">
                <div className={p.medium}>
                    <h2 id="steps-title" className={p.h2Small}>How to apply</h2>
                    <ol className={s.steps}>
                        {STEPS.map(([title, body]) => (
                            <li key={title}>
                                <h3 className={s.stepTitle}>{title}</h3>
                                <p>{body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* The application form */}
            <section id="chapter-application" className={`${p.section} ${p.ruled}`} aria-labelledby="form-title">
                <div className={p.narrow}>
                    <h2 id="form-title" className={p.h2Small}>Apply to start a chapter</h2>
                    <div className={s.formFrame}>
                        <iframe
                            src={FORM_EMBED_URL}
                            title="Almaden Voices chapter application"
                            loading="lazy"
                            className={s.formIframe}
                        >
                            Loading…
                        </iframe>
                    </div>
                    <p className={p.small}>
                        Form not loading?{" "}
                        <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className={p.textLink}>
                            Open the application in a new tab
                        </a>
                        . Questions? Email <a href="mailto:almadenvoices@gmail.com">almadenvoices@gmail.com</a>.
                    </p>
                </div>
            </section>

            {/* The chapter guide deck */}
            <section id="chapter-guide" className={`${p.section} ${p.wash}`} aria-labelledby="guide-title">
                <div className={p.medium}>
                    <h2 id="guide-title" className={p.h2Small}>The chapter guide</h2>
                    <div className={s.deckFrame}>
                        <iframe src={GUIDE_EMBED_URL} title="Almaden Voices chapter guide" allowFullScreen loading="lazy" />
                    </div>
                    <p className={p.small}>
                        Use the arrows to flip through the slides, or{" "}
                        <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer" className={p.textLink}>
                            open the guide in a new tab
                        </a>
                        .
                    </p>
                </div>
            </section>

            {/* ---------- Volunteer: the existing roles and sign-up form ---------- */}
            <section id="volunteer" className={`${p.section} ${s.volunteer}`} aria-label="Volunteer">
                <VolunteerPage />
            </section>

            {/* ---------- Upcoming events: narrow, text only ---------- */}
            <section id="upcoming-events" className={`${p.section} ${p.wash}`} aria-labelledby="events-title">
                <div className={p.narrow}>
                    <h2 id="events-title" className={p.h2Small}>Upcoming events</h2>
                    <div className={p.prose}>
                        <p>
                            Nothing is on the calendar right now. New workshops go up on the registration
                            page first, and our monthly email announces them.
                        </p>
                    </div>
                    <div className={p.actions}>
                        <Link to="/register" className={p.button}>Go to registration</Link>
                        <a href="#footer-email" className={p.textLink}>Get the monthly email</a>
                    </div>

                    <h3 id="host-an-event" className={s.hostTitle}>Host a workshop with us</h3>
                    <div className={p.prose}>
                        <p>
                            We run workshops with schools, libraries and community groups. If you have a
                            room and some kids who'd like to try public speaking, email{" "}
                            <a href="mailto:almadenvoices@gmail.com">almadenvoices@gmail.com</a> or{" "}
                            <Link to="/contact">send us a message</Link>.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
