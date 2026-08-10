import React from "react";
import { Box, Typography, Container } from "@mui/material";
import { motion } from "framer-motion";

/**
 * Survey outcomes from a camp session.
 *
 * IMPORTANT — WHY THERE IS NO BEFORE/AFTER CHART:
 * The pre-survey and the post-survey did not ask the same question. The pre
 * asked students to rate their current confidence on a 1–5 scale; the post
 * asked whether they felt *more* of each thing than before. Those are two
 * different measurements, so putting them on one axis would invent a change
 * score the data does not support. They stay in two separate panels, with two
 * different units and two different colours, on purpose. Do not merge them.
 *
 * ADDING THE JULY SESSION: copy the JUNE_2026 object, change the values, and
 * render <SessionOutcomes data={JULY_2026} />. All copy, numbers and captions
 * live in the config below — the layout never needs to be touched.
 */

const JUNE_2026 = {
    eyebrow: "Session Outcomes",
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
            color: "#2563EB",
            track: "#E8EDF7",
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
            color: "#0891B2",
            track: "#E2F0F4",
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

/**
 * One horizontal bar. Percentage widths keep the SVG responsive without a
 * viewBox, so the rounded end stays a true 4px at every screen size instead of
 * being stretched into an ellipse. The small square patch at x=0 squares off
 * the left end so each bar reads as anchored to its baseline.
 */
function Bar({ value, max, color, track }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));

    return (
        <Box component="svg" width="100%" height={BAR_HEIGHT} aria-hidden="true" sx={{ display: "block", mt: 1 }}>
            <rect x="0" y="0" width="100%" height={BAR_HEIGHT} rx="4" fill={track} />
            <rect x="0" y="0" width={`${pct}%`} height={BAR_HEIGHT} rx="4" fill={color} />
            {pct > 2 && <rect x="0" y="0" width="4" height={BAR_HEIGHT} fill={color} />}
        </Box>
    );
}

/** One survey panel: a titled card holding its own bars, on its own scale. */
function Panel({ panel }) {
    // The text a screen reader gets instead of the bars.
    const summary = `${panel.title}. ${panel.items
        .map(item => `${item.label}: ${item.value} ${panel.unitForScreenReaders}`)
        .join(". ")}.`;

    return (
        <Box
            sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderTop: `4px solid ${panel.color}`,
                borderRadius: 4,
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography
                sx={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                    color: panel.color,
                    mb: 1,
                }}
            >
                {panel.subtitle}
            </Typography>
            <Typography
                sx={{
                    fontSize: { xs: "1.25rem", md: "1.4rem" },
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: "-0.01em",
                    mb: 3.5,
                }}
            >
                {panel.title}
            </Typography>

            <Box role="img" aria-label={summary}>
                {panel.items.map((item, index) => (
                    <Box key={item.label} sx={{ mt: index === 0 ? 0 : 3 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "baseline",
                                justifyContent: "space-between",
                                gap: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: "0.95rem", color: "#374151", lineHeight: 1.5 }}>
                                {item.label}
                            </Typography>
                            {/* Direct value labels stand in for an axis — with three
                                bars that reads faster than ticks and gridlines. */}
                            <Typography
                                sx={{
                                    fontSize: "1rem",
                                    fontWeight: 800,
                                    color: "#111827",
                                    whiteSpace: "nowrap",
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {panel.format(item.value)}
                            </Typography>
                        </Box>
                        <Bar value={item.value} max={panel.max} color={panel.color} track={panel.track} />
                    </Box>
                ))}
            </Box>

            <Typography
                sx={{
                    fontSize: "0.82rem",
                    color: "#6B7280",
                    lineHeight: 1.65,
                    mt: "auto",
                    pt: 3.5,
                }}
            >
                {panel.caption}
            </Typography>
        </Box>
    );
}

export default function SessionOutcomes({ data = JUNE_2026 }) {
    return (
        <Box sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 }, bgcolor: "#F9FAFB" }}>
            <Container maxWidth="lg">
                <Typography
                    sx={{
                        fontSize: "0.8rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        fontWeight: 800,
                        color: "#2563EB",
                        mb: 1.5,
                    }}
                >
                    {data.eyebrow}
                </Typography>
                <Typography
                    sx={{
                        fontSize: { xs: "2rem", md: "2.6rem" },
                        fontWeight: 800,
                        color: "#111827",
                        lineHeight: 1.15,
                        letterSpacing: "-0.02em",
                        maxWidth: 760,
                        mb: 2,
                    }}
                >
                    {data.heading}
                </Typography>
                <Typography sx={{ color: "#4B5563", lineHeight: 1.8, fontSize: "1.02rem", maxWidth: 720 }}>
                    {data.intro}
                </Typography>

                {/* Headline figures */}
                <Box
                    sx={{
                        mt: { xs: 4, md: 5 },
                        display: "grid",
                        gap: { xs: 2, md: 3 },
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    }}
                >
                    {data.metrics.map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: index * 0.07 }}
                            style={{ height: "100%" }}
                        >
                            <Box
                                sx={{
                                    height: "100%",
                                    bgcolor: "#FFFFFF",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: 4,
                                    p: { xs: 3, md: 3.5 },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: { xs: "2.2rem", md: "2.6rem" },
                                        fontWeight: 800,
                                        color: "#1E3A5F",
                                        lineHeight: 1,
                                        letterSpacing: "-0.03em",
                                    }}
                                >
                                    {metric.value}
                                </Typography>
                                <Box sx={{ width: 34, height: 4, borderRadius: 2, bgcolor: "#FBBF24", my: 1.75 }} />
                                <Typography
                                    sx={{ fontSize: "1rem", fontWeight: 700, color: "#111827", lineHeight: 1.45, mb: 0.75 }}
                                >
                                    {metric.label}
                                </Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.6 }}>
                                    {metric.note}
                                </Typography>
                            </Box>
                        </motion.div>
                    ))}
                </Box>

                {/* The two survey panels. Deliberately side by side and never
                    merged — see the note at the top of this file. */}
                <Box
                    sx={{
                        mt: { xs: 2, md: 3 },
                        display: "grid",
                        gap: { xs: 2, md: 3 },
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        alignItems: "stretch",
                    }}
                >
                    {data.panels.map(panel => (
                        <motion.div
                            key={panel.id}
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            style={{ height: "100%", display: "flex" }}
                        >
                            <Box sx={{ width: "100%" }}>
                                <Panel panel={panel} />
                            </Box>
                        </motion.div>
                    ))}
                </Box>

                <Typography
                    sx={{
                        mt: 2.5,
                        fontSize: "0.85rem",
                        color: "#6B7280",
                        lineHeight: 1.7,
                        maxWidth: 780,
                    }}
                >
                    The two panels measure different things and are not directly comparable — the first is a rating of
                    where students started, the second is what they reported about their own change.
                </Typography>

                {/* Written testimonials */}
                <Typography
                    sx={{
                        mt: { xs: 6, md: 8 },
                        fontSize: { xs: "1.5rem", md: "1.85rem" },
                        fontWeight: 800,
                        color: "#111827",
                        letterSpacing: "-0.015em",
                        mb: 3,
                    }}
                >
                    In the students&rsquo; own words
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gap: { xs: 2, md: 2.5 },
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                            md: "repeat(3, 1fr)",
                        },
                    }}
                >
                    {data.testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.name}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.05 }}
                            style={{ height: "100%" }}
                        >
                            <Box
                                component="figure"
                                sx={{
                                    m: 0,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    bgcolor: "#FFFFFF",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: 4,
                                    p: { xs: 2.75, md: 3 },
                                }}
                            >
                                <Typography
                                    component="blockquote"
                                    sx={{
                                        m: 0,
                                        color: "#374151",
                                        fontSize: "1rem",
                                        lineHeight: 1.7,
                                        flex: 1,
                                    }}
                                >
                                    &ldquo;{testimonial.quote}&rdquo;
                                </Typography>
                                <Typography
                                    component="figcaption"
                                    sx={{
                                        mt: 2,
                                        fontSize: "0.85rem",
                                        fontWeight: 800,
                                        color: "#2563EB",
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {testimonial.name}
                                </Typography>
                            </Box>
                        </motion.div>
                    ))}
                </Box>

                <Typography
                    sx={{
                        mt: { xs: 4, md: 5 },
                        pt: 3,
                        borderTop: "1px solid #E5E7EB",
                        fontSize: "0.82rem",
                        color: "#9CA3AF",
                        lineHeight: 1.7,
                    }}
                >
                    {data.footnote}
                </Typography>
            </Container>
        </Box>
    );
}
