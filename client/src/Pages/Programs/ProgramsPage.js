import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import SubNav from "../../components/SubNav/SubNav";
import usePageMeta from "../../hooks/usePageMeta";
import p from "../../styles/page.module.css";
import s from "./Programs.module.css";

/*
 * INTERVIEW PREP TESTIMONIAL
 * Hidden until there's a real quote. To turn it on, fill in the quote and
 * who said it, then set SHOW_INTERVIEW_TESTIMONIAL to true. Nothing renders
 * while the quote is empty, even if the flag is on.
 */
const SHOW_INTERVIEW_TESTIMONIAL = false;
const INTERVIEW_TESTIMONIAL = {
    quote: "",
    name: "",       // first name only for anyone under 18
    context: "",    // e.g. "preparing for her first job interview"
};

const BEGINNER_SKILLS = [
    "Emotion",
    "Eye contact",
    "Transitions",
    "Volume",
    "Gestures",
    "Inflection",
    "Body language",
    "Pausing",
    "Memorization",
    "Articulation",
];

const INTERVIEW_TOPICS = [
    "Building three or four real stories that answer almost any question",
    "The STAR method",
    "What to say when you freeze",
    "Full mock interviews with feedback",
    "The salary question",
    "The questions to ask them",
    "Voice and posture",
];

export default function ProgramsPage() {
    usePageMeta(
        "Programs",
        "Free public speaking workshops for kids, the Debate Booster course, one-on-one coaching, and free interview preparation for teens and young adults, from Almaden Voices in San José."
    );

    const showTestimonial = SHOW_INTERVIEW_TESTIMONIAL && INTERVIEW_TESTIMONIAL.quote.trim();

    return (
        <>
            <PageHeader
                title="Programs"
                intro="Free workshops for kids, a short course in debate, one-on-one coaching, and help getting ready for an interview."
            />
            <SubNav pageKey="programs" />

            {/* ---------- Workshops: text left, photo right ---------- */}
            <section id="workshops" className={p.section} aria-labelledby="workshops-title">
                <div className={`${p.inner} ${p.split} ${p.textWide}`}>
                    <div>
                        <h2 id="workshops-title" className={p.h2}>Workshops</h2>
                        <p className={p.lede}>
                            Our main program. Small groups of kids, kindergarten through 9th grade,
                            practice in front of each other until talking to a room feels normal. Every
                            workshop is free and ends with each student giving a speech to their family.
                        </p>
                        <div className={p.prose}>
                            <p>
                                They run anywhere from two days at the library to eight weeks. We've held
                                them in Almaden Valley, at the Almaden library and at summer camps in East
                                San José, and online for students abroad.
                            </p>
                        </div>

                        <h3 className={p.h3}>Beginners work on</h3>
                        <ul className={`${p.list} ${s.skills}`}>
                            {BEGINNER_SKILLS.map((skill) => <li key={skill}>{skill}</li>)}
                        </ul>
                        <p className={s.after}>and finish with a speech on the last day that puts it all to use.</p>

                        <h3 className={p.h3}>Advanced students, who've already done a beginner session, get</h3>
                        <ul className={p.list}>
                            <li>Feedback on their own speaking in every class</li>
                            <li>Delivery work: tone shifts, storytelling arcs, humor and dramatic pauses</li>
                            <li>Formats beyond a standard speech, like poetry, storytelling and monologue</li>
                            <li>Polish on phrasing, pacing and connecting with an audience</li>
                        </ul>

                        <div className={p.actions}>
                            <Link to="/register" className={p.button}>Register for a workshop</Link>
                            <Link to="/stories#past-sessions" className={p.textLink}>See photos from past workshops</Link>
                        </div>
                    </div>
                    <figure className={`${p.figure} ${s.stickyPhoto}`}>
                        <img
                            src="/images/s7-student-speaking.jpg"
                            alt="A boy stands at the front of a library community room giving his speech while classmates sit on the carpet and listen."
                            width="1800"
                            height="961"
                            loading="lazy"
                        />
                        <figcaption className={p.caption}>
                            A final speech at our April 2026 workshop at the Almaden library.
                        </figcaption>
                    </figure>
                </div>
            </section>

            {/* ---------- Debate Booster: photo left, text right ---------- */}
            <section id="debate-booster" className={`${p.section} ${p.wash}`} aria-labelledby="debate-title">
                <div className={`${p.inner} ${p.split} ${p.photoWide} ${p.center}`}>
                    <figure className={p.figure}>
                        <img
                            src="/images/s5-final-debate.jpg"
                            alt="Students sit at folding tables in two teams during the final debate of the Winter 2025 Debate Booster, while an instructor stands at the back."
                            width="1600"
                            height="900"
                            loading="lazy"
                        />
                        <figcaption className={p.caption}>The final debate, winter 2025.</figcaption>
                    </figure>
                    <div>
                        <h2 id="debate-title" className={p.h2Small}>Debate Booster</h2>
                        <p className={p.lede}>
                            A short course for kids who want to try debate. They argue in teams of two
                            against two, on whichever side they're given.
                        </p>
                        <h3 className={p.h3}>Students learn</h3>
                        <ul className={p.list}>
                            <li>How a two-on-two debate is structured</li>
                            <li>How to argue both the pro and the con</li>
                            <li>How to speak on the spot</li>
                            <li>The four speeches in a round: constructive, rebuttal, summary and final focus</li>
                        </ul>
                        <blockquote className={s.quote}>
                            "I enjoyed seeing my son really focused on researching the topic and learning
                            how to communicate."
                            <footer>Anil Babbar, parent, winter 2025</footer>
                        </blockquote>
                        <p className={p.small}>
                            We last ran it in winter 2025.{" "}
                            <Link to="/register" className={p.textLink}>Get told when it's back</Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* ---------- Coaching: narrow, text only ---------- */}
            <section id="coaching" className={`${p.section} ${p.tight}`} aria-labelledby="coaching-title">
                <div className={p.narrow}>
                    <h2 id="coaching-title" className={p.h2Small}>One-on-one coaching</h2>
                    <div className={p.prose}>
                        <p>
                            An hour alone with one of our coaches, online or in person. It's for students
                            who want help with a particular speech, or who want to move faster than a
                            group allows.
                        </p>
                        <p>
                            It costs $25 online or $30 in person. It's the one thing we charge for, and the
                            money pays for our free workshops.
                        </p>
                        <p>Book a slot on the registration page and we'll email you to set a time.</p>
                    </div>
                    <Link to="/register" className={p.button}>Book coaching</Link>
                </div>
            </section>

            {/* ---------- Interview prep: the page's one big moment ---------- */}
            <section id="interview-prep" className={`${p.section} ${p.navy} onDark`} aria-labelledby="interview-title">
                <div className={p.inner}>
                    <h2 id="interview-title" className={s.interviewTitle}>Interview preparation</h2>
                    <div className={s.interviewGrid}>
                        <div className={`${p.prose} ${s.interviewProse}`}>
                            <p className={s.interviewLead}>
                                Most people are never taught how to be interviewed. You're expected to walk
                                in and know how: how to talk about yourself without sounding rehearsed, what
                                to do when your mind goes blank, how to turn something you did into a story
                                someone else finds interesting.
                            </p>
                            <p>
                                We work one-on-one with teens and young adults getting ready for college
                                admissions interviews, scholarship interviews, and first jobs. This year that
                                included a university graduate in Kenya preparing for her first interview.
                                It's free, like everything else we do.
                            </p>
                        </div>
                        <div>
                            <h3 className={p.h3}>What we cover</h3>
                            <ul className={s.topics}>
                                {INTERVIEW_TOPICS.map((t) => <li key={t}>{t}</li>)}
                            </ul>
                        </div>
                    </div>
                    <p className={s.interested}>
                        Interested? We take interview prep case by case, depending on capacity. Email{" "}
                        <a href="mailto:almadenvoices@gmail.com">almadenvoices@gmail.com</a> and tell us what
                        you're getting ready for.
                    </p>

                    {showTestimonial && (
                        <figure className={s.testimonial}>
                            <blockquote>{INTERVIEW_TESTIMONIAL.quote}</blockquote>
                            <figcaption>
                                {INTERVIEW_TESTIMONIAL.name}
                                {INTERVIEW_TESTIMONIAL.context ? `, ${INTERVIEW_TESTIMONIAL.context}` : ""}
                            </figcaption>
                        </figure>
                    )}
                </div>
            </section>
        </>
    );
}
