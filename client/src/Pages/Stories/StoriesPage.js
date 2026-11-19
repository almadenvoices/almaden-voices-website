import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import SubNav from "../../components/SubNav/SubNav";
import ParentReviewList from "../../components/ParentReviewList";
import usePageMeta from "../../hooks/usePageMeta";
import { pastSessions } from "../../data/pastSessions";
import SessionOutcomes from "./SessionOutcomes";
import p from "../../styles/page.module.css";
import s from "./Stories.module.css";

// Turn on once the Voices content is ready. Also un-hide "voices" in
// data/siteNav.js.
const SHOW_VOICES = false;

const studentVideos = [
    { name: "Noah", src: "/images/noah-testimonial.mp4" },
    { name: "Oscar", src: "/images/oscar-testimonial.mp4" },
];

function PastSessions() {
    const [selectedId, setSelectedId] = useState(pastSessions[0].id);
    const session = pastSessions.find((x) => x.id === selectedId) || pastSessions[0];

    return (
        <section id="past-sessions" className={p.section} aria-labelledby="past-title">
            <div className={p.inner}>
                <h2 id="past-title" className={p.h2}>Past sessions</h2>
                <p className={p.lede}>
                    Photos from {pastSessions.length} of our 15 sessions, newest first. Pick one to see it.
                </p>

                <div className={s.chooser} role="group" aria-label="Choose a session">
                    {pastSessions.map((x) => (
                        <button
                            key={x.id}
                            type="button"
                            className={`${s.choice} ${x.id === session.id ? s.choiceOn : ""}`}
                            aria-pressed={x.id === session.id}
                            aria-controls="session-panel"
                            onClick={() => setSelectedId(x.id)}
                        >
                            <span className={s.choiceWhen}>{x.when}</span>
                            <span className={s.choiceKind}>{x.kind}</span>
                        </button>
                    ))}
                </div>

                <div id="session-panel" className={s.panel}>
                    <div className={s.panelHead}>
                        <h3 className={s.sessionTitle}>
                            {session.when}: {session.name}
                        </h3>
                        <p className={s.sessionMeta}>
                            {session.kind} · {session.length} · {session.photos.length} photos
                        </p>
                        <p className={s.sessionText}>{session.description}</p>
                    </div>
                    <div className={s.gallery}>
                        {session.photos.map((photo) => (
                            <figure key={photo.src} className={s.photo}>
                                <img src={photo.src} alt={photo.alt} loading="lazy" />
                                <figcaption className={p.caption}>{photo.caption}</figcaption>
                            </figure>
                        ))}
                    </div>
                </div>

                <p className={s.more}>
                    More of our work, including the summer camps and our online workshops abroad, is on{" "}
                    <Link to="/about#where-weve-worked" className={p.textLink}>Where we've worked</Link>.
                </p>
            </div>
        </section>
    );
}

export default function StoriesPage() {
    usePageMeta(
        "Stories",
        "Photos from Almaden Voices sessions, results from our June 2026 camp survey, 39 parent reviews and videos from our students."
    );

    return (
        <>
            <PageHeader
                title="Stories"
                intro="What our sessions looked like, and what students and parents said about them afterward."
                tone="wash"
            />
            <SubNav pageKey="stories" />

            <PastSessions />

            <section id="june-survey" className={`${p.section} ${p.wash}`} aria-labelledby="june-survey-title">
                <div className={p.inner}>
                    <SessionOutcomes />
                </div>
            </section>

            <ParentReviewList id="parent-reviews" />

            <section id="student-videos" className={`${p.section} ${p.ruled}`} aria-labelledby="videos-title">
                <div className={p.medium}>
                    <h2 id="videos-title" className={p.h2Small}>Student videos</h2>
                    <p className={p.lede}>Two of our students on what they got out of their class.</p>
                    <div className={s.videos}>
                        {studentVideos.map((v) => (
                            <figure key={v.name} className={s.videoFigure}>
                                <video controls preload="metadata" playsInline className={s.video} aria-label={`${v.name}'s video about his class`}>
                                    <source src={v.src} type="video/mp4" />
                                    Your browser can't play this video.
                                </video>
                                <figcaption className={s.videoName}>{v.name}</figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {SHOW_VOICES && (
                <section id="voices" className={`${p.section} ${p.wash}`} aria-labelledby="voices-title">
                    <div className={p.narrow}>
                        <h2 id="voices-title" className={p.h2Small}>Voices</h2>
                    </div>
                </section>
            )}
        </>
    );
}
