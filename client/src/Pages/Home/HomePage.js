import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import HeroVideo from "../../components/HeroVideo/HeroVideo";
import StatCounter from "../../components/StatCounter";
import usePageMeta from "../../hooks/usePageMeta";
import { headlineStats } from "../../data/ourWork";
import { FEATURED_REVIEWS, REVIEW_COUNT, AVERAGE_RATING, sessionLabel } from "../../data/parentReviews";
import s from "./Home.module.css";

const heroConfig = {
    title: "Find your voice. Inspire others.",
    subtitle:
        "Almaden Voices is a nonprofit in San José that teaches kids and teens to speak in front of an audience. Our workshops are free.",
    ctas: [
        {
            label: "Register for a workshop",
            href: "/register",
            variant: "contained",
            color: "secondary",
        },
        {
            label: "See our programs",
            href: "/programs",
            variant: "outlined",
            color: "inherit",
            sx: { color: "#FFFFFF", borderColor: "rgba(255,255,255,0.75)", "&:hover": { borderColor: "#FFFFFF", bgcolor: "rgba(255,255,255,0.1)" } },
        },
    ],
    images: [
        {
            src: "/images/s3-final-showcase-crowd.webp",
            alt: "Parents and younger kids crowd a garage for the last day of our July 2025 session, watching two speakers at the front of the room.",
        },
        {
            src: "/images/looking at paper.JPG",
            alt: "Students sit in small groups on a tarp working on their speeches while an instructor points something out on the far wall.",
        },
        {
            src: "/images/s3-group-picture.webp",
            alt: "About twenty students and two instructors grin for a group photo under a slide that reads Awards, on the last day of the July 2025 session.",
        },
    ],
    autoplayInterval: 6000,
    overlay: { gradient: false, tint: "rgba(10, 22, 40, 0.55)" },
    align: "start",
    scrollCta: null,
};

function PlayOverlay({ label, onPlay }) {
    return (
        <button type="button" className={s.playOverlay} onClick={onPlay} aria-label={label}>
            <span className={s.playCircle} aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
            </span>
        </button>
    );
}

function Stars({ rating }) {
    const filled = Math.round(Number(rating));
    return (
        <span className={s.stars} aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
                <svg key={n} width="22" height="22" viewBox="0 0 24 24">
                    <path
                        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
                        fill={n <= filled ? "var(--amber)" : "#E4E1D8"}
                    />
                </svg>
            ))}
        </span>
    );
}

export default function HomePage() {
    usePageMeta(
        null,
        "Almaden Voices is a San José nonprofit teaching kids and teens public speaking and debate. 350 students in 15 sessions across five countries, and the workshops are free."
    );

    const missionVideoRef = useRef(null);
    const [missionPlaying, setMissionPlaying] = useState(false);
    const [missionError, setMissionError] = useState(false);
    const noahRef = useRef(null);
    const [noahPlaying, setNoahPlaying] = useState(false);

    return (
        <>
            {/* Chapter applications. Delete this block when they close. */}
            <section className={s.chapters} aria-labelledby="chapters-title">
                <div className={s.chaptersInner}>
                    <div>
                        <h2 id="chapters-title" className={s.chaptersTitle}>Chapter applications are open</h2>
                        <p className={s.chaptersText}>
                            Start an Almaden Voices chapter at your school or in your town. We'll give you
                            the curriculum, the training and a nonprofit to run it under.
                        </p>
                    </div>
                    <div className={s.chaptersActions}>
                        <Link to="/get-involved#start-a-chapter" className={s.chaptersButton}>Start a chapter</Link>
                        <Link to="/get-involved#chapter-guide" className={s.chaptersLink}>Read the chapter guide</Link>
                    </div>
                </div>
            </section>

            <HeroVideo config={heroConfig} />

            {/* The stat band. The counters are this page's one animation. */}
            <section className={`${s.band} onDark`} aria-labelledby="band-title">
                <div className={s.bandInner}>
                    <h2 id="band-title" className={s.visuallyHidden}>Our work in numbers</h2>
                    <dl className={s.stats}>
                        {headlineStats.map((stat) => (
                            <div key={stat.label} className={s.stat}>
                                <dt className={s.statLabel}>{stat.label}</dt>
                                <dd className={s.statValue}>
                                    <StatCounter value={stat.value} />
                                </dd>
                                <dd className={s.statNote}>{stat.note}</dd>
                            </div>
                        ))}
                    </dl>
                    <p className={s.bandLink}>
                        <Link to="/about#where-weve-worked">See where we've worked</Link>
                    </p>
                </div>
            </section>

            {/* Why we exist: prose beside one large photograph. */}
            <section className={s.story} aria-labelledby="story-title">
                <figure className={s.storyFigure}>
                    <img
                        src="/images/s6-sophia-presenting.jpg"
                        alt="A young girl in a pink shirt stands at the front of a library community room, speaking to six students sitting on the carpet while an instructor watches from the side."
                        className={s.storyImg}
                        width="1600"
                        height="902"
                        loading="lazy"
                    />
                    <figcaption className={s.caption}>
                        Sophia during the eye-contact exercise at our March 2026 workshop at the Almaden library.
                    </figcaption>
                </figure>
                <div className={s.storyText}>
                    <h2 id="story-title" className={s.storyTitle}>
                        Most kids would rather do anything than stand up and talk. We start there.
                    </h2>
                    <p>
                        Almaden Voices began in April 2025 with one free eight-week class for beginners
                        in Almaden Valley. Anjika Bansal, who competes for Leland Speech and Debate,
                        started it so younger kids could build the confidence she'd grown up with.
                    </p>
                    <p>
                        Every session ends the same way. Each student gives a speech to a room of
                        parents and family, and for most of them it's the first speech they've ever
                        given. Parents often tell us the final speech is where they saw the change,
                        and plenty of the kids sign up for the next session.
                    </p>
                    <p>
                        Since then we've taught 350 students across 15 sessions. Most of them live here
                        in San José. Others joined online from Canada, India, Singapore and Kenya.
                    </p>
                    <p>
                        Our workshops are free. One-on-one coaching costs $25 online or $30 in person,
                        and that money goes back into the workshops.
                    </p>
                </div>
            </section>

            {/* The students saying it themselves. Click to play: the point is the
                sound, so it can't autoplay. */}
            <section className={s.voices} aria-labelledby="voices-title">
                <div className={s.narrow}>
                    <h2 id="voices-title" className={s.h2}>Hear it from our students</h2>
                    <p className={s.lede}>
                        A few of our students and Anjika, in their own words. It's only a few seconds
                        long, so turn your sound on.
                    </p>
                    <div className={s.videoFrame}>
                        <video
                            ref={missionVideoRef}
                            src="/who-are-we.mp4"
                            poster="/images/who-are-we-poster.jpg"
                            controls={missionPlaying}
                            preload="metadata"
                            playsInline
                            onError={() => setMissionError(true)}
                            className={s.video}
                        />
                        {!missionPlaying && (
                            <PlayOverlay
                                label="Play the video of our students introducing Almaden Voices"
                                onPlay={() => {
                                    // Controls stay on from here: the clip is short, so
                                    // without them there'd be no way to replay it.
                                    setMissionPlaying(true);
                                    const played = missionVideoRef.current?.play();
                                    if (played?.catch) played.catch(() => setMissionError(true));
                                }}
                            />
                        )}
                    </div>
                    {missionError && (
                        <p className={s.videoNote} role="status">
                            This video won't play in your browser right now. Please let us know at
                            almadenvoices@gmail.com.
                        </p>
                    )}
                </div>
            </section>

            {/* Four parent reviews, picked for range, beside the overall rating. */}
            <section className={s.reviews} aria-labelledby="reviews-title">
                <div className={s.reviewsInner}>
                    <div className={s.rating}>
                        <p className={s.ratingNumber}>{AVERAGE_RATING}</p>
                        <Stars rating={AVERAGE_RATING} />
                        <p className={s.ratingText}>
                            Average rating from {REVIEW_COUNT} parent reviews
                        </p>
                        <Link to="/stories#parent-reviews" className={s.textLink}>
                            Read all {REVIEW_COUNT} reviews
                        </Link>
                    </div>
                    <div>
                        <h2 id="reviews-title" className={s.h2}>What parents tell us</h2>
                        <ul className={s.quotes}>
                            {FEATURED_REVIEWS.map((r) => (
                                <li key={`${r.name}-${r.sessionType}`} className={s.quoteItem}>
                                    <blockquote className={s.quote}>{r.review}</blockquote>
                                    <p className={s.quoteWho}>
                                        {r.name}, parent, {sessionLabel(r)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* One student video, text left and video right. */}
            <section className={s.noah} aria-labelledby="noah-title">
                <div className={s.noahInner}>
                    <div className={s.noahText}>
                        <h2 id="noah-title" className={s.h2}>Noah, in his own words</h2>
                        <p>
                            Noah is one of our students. He agreed to tell the camera what he thought of
                            his class. There are more student videos on our stories page.
                        </p>
                        <Link to="/stories#student-videos" className={s.textLink}>
                            Watch more student videos
                        </Link>
                    </div>
                    <div className={s.noahVideo}>
                        <div className={s.videoFrame}>
                            <video
                                ref={noahRef}
                                src="/images/noah-testimonial.mov"
                                controls={noahPlaying}
                                preload="metadata"
                                playsInline
                                className={s.video}
                            />
                            {!noahPlaying && (
                                <PlayOverlay
                                    label="Play Noah's video about his class"
                                    onPlay={() => {
                                        setNoahPlaying(true);
                                        noahRef.current?.play();
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* A plain closing line. */}
            <section className={s.closing} aria-labelledby="closing-title">
                <div className={s.narrow}>
                    <h2 id="closing-title" className={s.closingTitle}>Want your kid in the next one?</h2>
                    <p className={s.lede}>
                        Sign-ups happen on our registration page. If nothing is open right now, leave
                        your email there and we'll tell you when the next workshop opens.
                    </p>
                    <Link to="/register" className={s.button}>Go to registration</Link>
                </div>
            </section>
        </>
    );
}
