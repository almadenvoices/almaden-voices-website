import React from "react";
import o from "./SessionOutcomes.module.css";

/**
 * Survey outcomes from a camp session.
 *
 * IMPORTANT: WHY THERE IS NO BEFORE/AFTER CHART
 * The pre-survey and the post-survey did not ask the same question. The pre
 * asked students to rate their current confidence on a 1–5 scale; the post
 * asked whether they felt *more* of each thing than before. Those are two
 * different measurements, so putting them on one axis would invent a change
 * score the data does not support. They stay in two separate panels, with two
 * different units and two different colours, on purpose. Do not merge them.
 *
 * ADDING THE JULY SESSION: copy the JUNE_2026 object, change the values, and
 * render <SessionOutcomes data={JULY_2026} />. All copy, numbers and captions
 * live in the config below, so the layout never needs to be touched.
 */

const JUNE_2026 = {
    heading: "What the June camp actually changed.",
    intro:
        "We surveyed students on paper at the start and end of our June 2026 session at the Mexican Heritage Plaza. The two surveys asked different questions, so we report them separately rather than as a single before-and-after number.",

    // Headline figures. `note` carries the caveat so the number can't overstate.
    metrics: [
        {
            value: "24",
            label: "students surveyed",
            note: "Every student in the June session completed the pre-survey",
        },
        {
            value: "67%",
            label: "post-survey completion rate",
            note: "16 of the 24 students were present on the final day",
        },
        {
            value: "46%",
            label: "were not at all prepared to give a speech",
            note: "How students rated themselves before the program began",
        },
    ],

    panels: [
        {
            id: "pre",
            title: "Where students started",
            subtitle: "Self-rated, before the program",
            color: "#1E3A5F",
            track: "#DCE4EF",
            max: 5,
            format: v => `${v.toFixed(1)} / 5`,
            // Read aloud by screen readers in place of the bars.
            unitForScreenReaders: "out of 5",
            items: [
                { label: "Confidence speaking to a group", value: 3.1 },
                { label: "Comfort sharing ideas out loud", value: 2.8 },
                { label: "Prepared to give a short speech", value: 2.1 },
            ],
            caption: "Students rated themselves 1 (not at all) to 5 (very much) before the program began. n=24.",
        },
        {
            id: "post",
            title: "What students reported afterward",
            subtitle: "Self-reported, after the program",
            color: "#B7791F",
            track: "#FCEFD2",
            max: 100,
            format: v => `${v}%`,
            unitForScreenReaders: "percent",
            items: [
                { label: "Felt more confident speaking to a group", value: 63 },
                { label: "Felt more comfortable sharing ideas out loud", value: 69 },
                { label: "Felt more prepared to give a speech", value: 63 },
            ],
            caption: "Percentage of students reporting at least somewhat more of each after the program. n=16.",
        },
    ],

    // First names only. Quotes are verbatim apart from spelling and capitalisation.
    testimonials: [
        { name: "Maria", quote: "I enjoyed learning the Golden Zone for Speaking and the Gestures." },
        { name: "Zayden", quote: "How to play eye contact, and how to use the right body language." },
        { name: "Myles", quote: "I learned hand gestures to use while speaking." },
        { name: "Nicole", quote: "I enjoyed public speaking because it made me more confident." },
        { name: "Kaiyah", quote: "I liked learning how to be more confident." },
        {
            name: "Samira",
            quote:
                "My favorite part about Almaden Voices was how we all laughed during class and we all felt confident to speak in front of each other.",
        },
        { name: "Emma", quote: "I enjoyed playing games and I learned how to be more confident." },
    ],

    footnote:
        "Pre- and post-session surveys were administered in person during our June 2026 session at the Mexican Heritage Plaza. Pre-survey n=24, post-survey n=16.",
};

const BAR_HEIGHT = 14;

/** One horizontal bar, on its panel's own scale. */
function Bar({ value, max, color, track }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (
        <svg width="100%" height={BAR_HEIGHT} aria-hidden="true" className={o.bar}>
            <rect x="0" y="0" width="100%" height={BAR_HEIGHT} rx="3" fill={track} />
            <rect x="0" y="0" width={`${pct}%`} height={BAR_HEIGHT} rx="3" fill={color} />
            {pct > 2 && <rect x="0" y="0" width="3" height={BAR_HEIGHT} fill={color} />}
        </svg>
    );
}

/** One survey panel, with its own bars on its own scale. */
function Panel({ panel }) {
    const summary = `${panel.title}. ${panel.items
        .map((item) => `${item.label}: ${item.value} ${panel.unitForScreenReaders}`)
        .join(". ")}.`;
    return (
        <div className={o.panel} style={{ borderTopColor: panel.color }}>
            <h4 className={o.panelTitle}>{panel.title}</h4>
            <p className={o.panelSub}>{panel.subtitle}</p>
            <div role="img" aria-label={summary}>
                {panel.items.map((item) => (
                    <div key={item.label} className={o.row}>
                        <div className={o.rowHead}>
                            <span>{item.label}</span>
                            <strong>{panel.format(item.value)}</strong>
                        </div>
                        <Bar value={item.value} max={panel.max} color={panel.color} track={panel.track} />
                    </div>
                ))}
            </div>
            <p className={o.panelCaption}>{panel.caption}</p>
        </div>
    );
}

export default function SessionOutcomes({ data = JUNE_2026, headingId = "june-survey-title" }) {
    return (
        <>
            <h2 id={headingId} className={o.heading}>{data.heading}</h2>
            <p className={o.intro}>{data.intro}</p>

            <dl className={o.metrics}>
                {data.metrics.map((m) => (
                    <div key={m.label} className={o.metric}>
                        <dt>{m.label}</dt>
                        <dd className={o.metricValue}>{m.value}</dd>
                        <dd className={o.metricNote}>{m.note}</dd>
                    </div>
                ))}
            </dl>

            {/* Side by side and never merged: see the note at the top. */}
            <div className={o.panels}>
                {data.panels.map((panel) => <Panel key={panel.id} panel={panel} />)}
            </div>
            <p className={o.note}>
                The two panels measure different things and can't be compared directly. The first is
                where students rated themselves at the start. The second is what they said about their
                own change afterward.
            </p>

            <h3 className={o.quotesTitle}>In the students' own words</h3>
            <ul className={o.quotes}>
                {data.testimonials.map((t) => (
                    <li key={t.name}>
                        <blockquote>"{t.quote}"</blockquote>
                        <p>{t.name}</p>
                    </li>
                ))}
            </ul>

            <p className={o.footnote}>{data.footnote}</p>
        </>
    );
}
