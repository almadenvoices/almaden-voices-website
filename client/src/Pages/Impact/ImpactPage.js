import React, { useState, useEffect } from "react";
import { Box, Typography, Container, Select, MenuItem, FormControl } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ourWork, featuredWork } from "../../data/ourWork";
import SessionOutcomes from "./SessionOutcomes";


const studentVideos = [
    {
        name: "Noah",
        video: "/images/noah-testimonial.mp4",
    },
    {
        name: "Oscar",
        video: "/images/oscar-testimonial.mp4",
    },
];

const metrics = [
    { number: "300", label: "Audience Reached", description: "Our students MC'd a two-hour show" },
    { number: "12", label: "Sessions Completed", description: "Beginner through advanced" },
    { number: "150", label: "Students Served", description: "Across multiple levels" },
    { number: "K–9", label: "Grades Served", description: "Kindergarten through 9th grade" },
    { number: "$1,500", label: "Raised", description: "In community donations" },
    { number: "3x", label: "Class Sizes", description: "Tripled through targeted outreach & marketing" },
    { number: "High", label: "Retention Rate", description: "Students return for higher-level sessions" },
];

const pastSessions = [
    {
        title: "April\u2013May 2025 Beginner Session: Finding Your Voice",
        date: "April\u2013May 2025",
        duration: "8 weeks",
        description: "Our very first session! Over 8 weeks, students learned voice projection, posture, and how to overcome stage fright — culminating in a final showcase where they performed for parents and family.",
        journey: [
            "Walked in quiet and unsure",
            "Learned breathing & projection",
            "Practiced through games & activities",
            "Performed for parents at showcase",
            "Left standing tall and confident",
        ],
        images: [
            { src: "/images/teaching-beginner.JPG", caption: "Teaching the beginner basics" },
            { src: "/images/s1-warm-up-circle.JPG", caption: "Starting with a warm-up circle" },
            { src: "/images/s1-learning-proper-posture.jpg", caption: "Learning proper speaking posture" },
            { src: "/images/s1-standing-together.jpg", caption: "Standing together after class" },
            { src: "/images/s1-final-presentation.jpg", caption: "Delivering the final presentation" },
        ],
    },
    {
        title: "June 2025 Beginner Session: Storytelling Spark",
        date: "June 2025",
        duration: "4 weeks",
        description: "A focused 4-week sprint on storytelling. Students crafted personal narratives with clear structure and delivered them at a final showcase in front of parents and community members.",
        journey: [
            "Came in with scattered ideas",
            "Learned story structure basics",
            "Crafted personal narratives together",
            "Told stories to parents at showcase",
            "Left as confident storytellers",
        ],
        images: [
            { src: "/images/s2-group-picture.jpg", caption: "Group photo after the session" },
            { src: "/images/s2-picture-with-michael.png", caption: "Students with instructor Michael" },
        ],
    },
    {
        title: "July 2025 Beginner Session: Confidence in Action",
        date: "July 2025",
        duration: "4 weeks",
        description: "A 4-week intensive on stage presence, body language, and persuasive delivery. Students wrapped up with a final showcase, presenting to an audience of parents and families.",
        journey: [
            "Started hesitant at the mic",
            "Explored body language & tone",
            "Practiced persuasive delivery",
            "Spoke to families at final showcase",
            "Left owning the stage",
        ],
        images: [
            { src: "/images/s3-final-showcase-crowd.jpg", caption: "Crowd watching the final showcase" },
            { src: "/images/s3-warm-up-circle.JPG", caption: "Kicking off with warm-ups" },
            { src: "/images/s3-final-goodluck-circle.jpg", caption: "Good luck circle before showcase" },
            { src: "/images/s3-high-five.jpg", caption: "Celebrating with a high five" },
            { src: "/images/s3-final-presentation-raiya.jpg", caption: "Raiya delivering her final speech" },
            { src: "/images/s3-grading-papers.jpg", caption: "Reviewing student progress together" },
            { src: "/images/s3-group-picture.jpg", caption: "Full group photo after showcase" },
            { src: "/images/s3-playing-with-hermes.jpg", caption: "Fun break playing with Hermes" },
        ],
    },
    {
        title: "August\u2013September 2025 Advanced Session: Level Up",
        date: "Aug\u2013Sep 2025",
        duration: "8 weeks",
        description: "An 8-week deep dive for returning students covering impromptu speaking, debate, and rhetoric. The session ended with a live debate showcase in front of parents and family.",
        journey: [
            "Returned ready for a challenge",
            "Tackled impromptu speaking drills",
            "Built arguments & rebuttals",
            "Debated live for parents & family",
            "Left sharp and quick-thinking",
        ],
        images: [
            { src: "/images/s4-teaching-and-peer-led-activities.jpg", caption: "Teaching and peer-led activities" },
            { src: "/images/s4-showing-video.jpg", caption: "Watching instructional video together" },
        ],
    },
    {
        title: "Winter Debate Booster 2025: Think Fast, Speak Bold",
        date: "Winter 2025",
        duration: "4 weeks",
        description: "A 4-week debate boot camp to sharpen competitive skills. Students drilled rebuttals, cross-examination, and persuasive closings — finishing with a showcase debate for parents and families.",
        journey: [
            "Arrived eager to compete",
            "Drilled timed rebuttals",
            "Mastered cross-examination skills",
            "Showcased debates for parents",
            "Left debate-ready and fearless",
        ],
        images: [
            { src: "/images/s5-teaching-round-structure.jpg", caption: "Learning debate round structure" },
            { src: "/images/s5-peer-activities.jpg", caption: "Peer practice debate activities" },
            { src: "/images/s5-practice-debate.JPG", caption: "Practicing debate with partners" },
            { src: "/images/s5-fun-kahoot.jpg", caption: "Fun Kahoot quiz break" },
            { src: "/images/s5-final-debate.jpg", caption: "Final debate showdown on stage" },
            { src: "/images/s5-final-winners.jpg", caption: "Celebrating the debate winners" },
        ],
    },
    {
        title: "March 2026 Library Workshop: Speak Up at the Library",
        date: "March 2026",
        duration: "2 days",
        description: "Our first-ever public library workshop! Hosted at the Almaden Library Community Center, this two-day event introduced 7 young speakers to the fundamentals of public speaking in a welcoming, real-world setting. Students learned voice projection, confident body language, and how to structure a short speech — then put it all together in a mini showcase for parents and library visitors. The energy in the room was electric, and multiple families asked when the next one would be.",
        journey: [
            "Walked into the library shy and curious",
            "Learned projection & body language basics",
            "Practiced speeches with peer feedback",
            "Delivered a mini showcase for families",
            "Left with newfound confidence and pride",
        ],
        images: [
            { src: "/images/s6-day-1.jpg", caption: "Day 1 at the Almaden Library" },
            { src: "/images/s6-sophia-presenting.jpg", caption: "Sophia delivering her speech" },
            { src: "/images/s6-raising-hands.jpg", caption: "Students eager to participate" },
            { src: "/images/s6-aliens-or-zombies?.jpg", caption: "Fun icebreaker: Aliens or Zombies?" },
        ],
    },
    {
        title: "April 2026 Library Workshop: Speak Up, Stand Out",
        date: "April 2026",
        duration: "2 days",
        description: "A two-day workshop (3 hours each) at the Almaden Library Community Center. Students learned simple techniques to speak clearly and confidently, how to overcome nervousness, and how to speak in front of a crowd — covering all the must-know speech basics. The workshop wrapped up with each student showcasing their skills in a final speech for parents and library visitors.",
        journey: [
            "Arrived nervous but excited",
            "Learned clarity & confidence techniques",
            "Practiced overcoming nervousness",
            "Mastered speech basics together",
            "Delivered a final showcase speech",
        ],
        images: [
            { src: "/images/s7-me-presenting.png", caption: "Kicking off the workshop" },
            { src: "/images/s7-circle.png", caption: "Warm-up circle to start the day" },
            { src: "/images/s7-practice-paragraphs.png", caption: "Practicing speech paragraphs" },
            { src: "/images/s7-working-in-groups.png", caption: "Working together in groups" },
            { src: "/images/s7-student-speaking.png", caption: "A student delivering their speech" },
        ],
    },
];

export default function ImpactPage() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedSession = pastSessions[selectedIndex];

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, []);

    return (
        <Box>
            {/* Key Metrics Section */}
            <Box sx={{ py: { xs: 4, md: 5 }, bgcolor: "#F9FAFB" }}>
                <Container maxWidth="lg">
                    <Typography
                        sx={{
                            fontSize: "0.8rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            fontWeight: 800,
                            color: "#2563EB",
                            mb: 1.5,
                            textAlign: "center",
                        }}
                    >
                        By The Numbers
                    </Typography>
                    <Typography
                        align="center"
                        sx={{
                            fontSize: { xs: "1.9rem", md: "2.5rem" },
                            fontWeight: 800,
                            color: "#111827",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.15,
                            mb: 6,
                        }}
                    >
                        Our Impact
                    </Typography>

                    {/* Metrics Grid */}
                    <Box
                        sx={{
                            display: "flex",
                            // Seven cards is too many for one row on a laptop, so
                            // they wrap instead of being squeezed.
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: { xs: 2, md: 2 },
                        }}
                    >
                        {metrics.map((metric, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                style={{ flex: "1 1 170px", maxWidth: 260 }}
                            >
                                <Box
                                    sx={{
                                        textAlign: "center",
                                        minWidth: { xs: 130, md: "auto" },
                                        p: { xs: 1.5, md: 2 },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: "'Playfair Display', Georgia, serif",
                                            fontSize: { xs: "1.9rem", md: "2.1rem" },
                                            fontWeight: 700,
                                            letterSpacing: "-0.02em",
                                            lineHeight: 1.1,
                                            color: "#2563EB",
                                            mb: 0.75,
                                        }}
                                    >
                                        {metric.number}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: "bold", color: "#111827", mb: 0.25 }}
                                    >
                                        {metric.label}
                                    </Typography>
                                    <Typography
                                        sx={{ color: "#6B7280", fontSize: "0.88rem", lineHeight: 1.6, display: "block" }}
                                    >
                                        {metric.description}
                                    </Typography>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Where We've Worked — a lead story, then the rest as cards */}
            <Box id="our-work" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 5, md: 7 }, bgcolor: "#FFFFFF" }}>
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
                        Our Work
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: { xs: "2rem", md: "2.75rem" },
                            fontWeight: 800,
                            color: "#111827",
                            lineHeight: 1.15,
                            letterSpacing: "-0.02em",
                            maxWidth: 760,
                            mb: 2,
                        }}
                    >
                        From a summer camp in East San José to classrooms in four countries.
                    </Typography>

                    {/* Lead story */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box
                            sx={{
                                mt: 5,
                                borderRadius: 5,
                                overflow: "hidden",
                                background: "linear-gradient(135deg, #111827 0%, #1E3A5F 100%)",
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" },
                            }}
                        >
                            <Box sx={{ p: { xs: 3.5, md: 6 } }}>
                                <Typography
                                    sx={{
                                        fontSize: "0.78rem",
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                        fontWeight: 700,
                                        color: "#FCD34D",
                                        mb: 2,
                                    }}
                                >
                                    {featuredWork.kicker}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: { xs: "1.6rem", md: "2.1rem" },
                                        fontWeight: 800,
                                        color: "#FFFFFF",
                                        lineHeight: 1.2,
                                        letterSpacing: "-0.01em",
                                        mb: 2,
                                    }}
                                >
                                    {featuredWork.title}
                                </Typography>
                                <Typography sx={{ color: "#E2E8F0", lineHeight: 1.75, fontSize: "1.02rem", mb: 4 }}>
                                    {featuredWork.body}
                                </Typography>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 2, md: 4 } }}>
                                    {featuredWork.stats.map(stat => (
                                        <Box key={stat.label}>
                                            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.95rem", color: "#CBD5E1", mt: 0.75, lineHeight: 1.5 }}>
                                                {stat.label}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* The headline number, or the photo once there is one */}
                            {featuredWork.photo ? (
                                <Box
                                    component="img"
                                    src={featuredWork.photo}
                                    alt={featuredWork.photoAlt || featuredWork.title}
                                    sx={{ width: "100%", height: "100%", minHeight: 260, objectFit: "cover" }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        p: { xs: 4, md: 6 },
                                        bgcolor: "rgba(251, 191, 36, 0.08)",
                                        borderLeft: { xs: "none", md: "1px solid rgba(255,255,255,0.08)" },
                                        borderTop: { xs: "1px solid rgba(255,255,255,0.08)", md: "none" },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: { xs: "2.5rem", md: "3.1rem" },
                                            fontWeight: 800,
                                            color: "#FBBF24",
                                            lineHeight: 1,
                                            letterSpacing: "-0.03em",
                                        }}
                                    >
                                        {featuredWork.bigNumber}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: "#F1F5F9",
                                            fontWeight: 600,
                                            textAlign: "center",
                                            mt: 1.5,
                                            fontSize: "1.15rem",
                                            lineHeight: 1.5,
                                            maxWidth: 240,
                                        }}
                                    >
                                        {featuredWork.bigNumberLabel}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </motion.div>

                    {/* Everything else — one row per programme. Photos are shown
                        whole (object-fit: contain) rather than cropped to a
                        fixed card header, so no one loses the top of their head. */}
                    <Box sx={{ mt: 4, display: "grid", gap: { xs: 3, md: 4 } }}>
                        {ourWork.map((item, index) => {
                            const photos = item.photos || [];
                            // Items with a set of photos get the full-width gallery
                            // treatment; a single photo sits beside its text.
                            const isGallery = photos.length > 1;
                            const photoFirst = index % 2 === 0;

                            const details = (
                                <>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
                                        <Box
                                            sx={{
                                                px: 1.5,
                                                py: 0.4,
                                                borderRadius: 999,
                                                bgcolor: item.accent + "1A",
                                                color: item.accent,
                                                fontSize: "0.72rem",
                                                fontWeight: 800,
                                                letterSpacing: "0.06em",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {item.category}
                                        </Box>
                                        <Typography sx={{ fontSize: "0.8rem", color: "#9CA3AF", fontWeight: 600 }}>
                                            {item.date} · {item.place}
                                        </Typography>
                                    </Box>

                                    <Typography
                                        sx={{
                                            fontSize: { xs: "1.25rem", md: "1.45rem" },
                                            fontWeight: 800,
                                            color: "#111827",
                                            mb: 1,
                                            letterSpacing: "-0.01em",
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography sx={{ color: "#4B5563", lineHeight: 1.75, fontSize: "1rem", maxWidth: 620 }}>
                                        {item.body}
                                    </Typography>
                                </>
                            );

                            const figure = (photo, sx = {}) => (
                                <Box key={photo.src} component="figure" sx={{ m: 0 }}>
                                    <Box
                                        sx={{
                                            bgcolor: "#F3F4F6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                            ...sx,
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={photo.src}
                                            alt={photo.alt || item.title}
                                            loading="lazy"
                                            sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                                        />
                                    </Box>
                                    {photo.caption && (
                                        <Typography
                                            component="figcaption"
                                            sx={{ fontSize: "0.82rem", color: "#6B7280", mt: 1, lineHeight: 1.6 }}
                                        >
                                            {photo.caption}
                                        </Typography>
                                    )}
                                </Box>
                            );

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.45, delay: Math.min(index, 3) * 0.06 }}
                                >
                                    <Box
                                        sx={{
                                            borderRadius: 4,
                                            overflow: "hidden",
                                            border: "1px solid #E5E7EB",
                                            borderTop: `4px solid ${item.accent}`,
                                            bgcolor: "#FFFFFF",
                                            transition: "box-shadow 0.25s ease",
                                            "&:hover": { boxShadow: "0 14px 34px rgba(17, 24, 39, 0.10)" },
                                            ...(isGallery || photos.length === 0
                                                ? {}
                                                : {
                                                      display: "grid",
                                                      alignItems: "center",
                                                      gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
                                                  }),
                                        }}
                                    >
                                        {isGallery ? (
                                            <>
                                                <Box sx={{ px: { xs: 3, md: 4.5 }, pt: { xs: 3, md: 4 }, pb: 2.5 }}>{details}</Box>
                                                <Box
                                                    sx={{
                                                        px: { xs: 3, md: 4.5 },
                                                        pb: { xs: 3, md: 4 },
                                                        display: "grid",
                                                        gap: { xs: 2.5, md: 3 },
                                                        gridTemplateColumns: {
                                                            xs: "1fr",
                                                            sm: "1fr 1fr",
                                                            md: "repeat(3, 1fr)",
                                                        },
                                                    }}
                                                >
                                                    {photos.map(photo =>
                                                        figure(photo, { aspectRatio: "16 / 9", borderRadius: 3 })
                                                    )}
                                                </Box>
                                            </>
                                        ) : photos.length === 1 ? (
                                            <>
                                                <Box
                                                    sx={{
                                                        order: { xs: 0, md: photoFirst ? 0 : 1 },
                                                        p: { xs: 2.5, md: 3 },
                                                    }}
                                                >
                                                    {figure(photos[0], { aspectRatio: "16 / 9", borderRadius: 3 })}
                                                </Box>
                                                <Box sx={{ px: { xs: 3, md: 4.5 }, pb: { xs: 3.5, md: 4 }, pt: { xs: 0, md: 4 } }}>
                                                    {details}
                                                </Box>
                                            </>
                                        ) : (
                                            <Box sx={{ px: { xs: 3, md: 4.5 }, py: { xs: 3, md: 3.5 } }}>{details}</Box>
                                        )}
                                    </Box>
                                </motion.div>
                            );
                        })}
                    </Box>
                </Container>
            </Box>


            {/* Survey results from the June 2026 Mexican Heritage Plaza camp */}
            <Box id="session-outcomes">
                <SessionOutcomes />
            </Box>

            {/* Student Video Testimonials Section */}
            <Box id="testimonials" sx={{ pt: { xs: 5, md: 7 }, pb: 10, bgcolor: "#FFFFFF" }}>
                <Container maxWidth="lg">
                    <Typography
                        sx={{
                            fontSize: "0.8rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            fontWeight: 800,
                            color: "#2563EB",
                            mb: 1.5,
                            textAlign: "center",
                        }}
                    >
                        In Their Words
                    </Typography>
                    <Typography
                        align="center"
                        sx={{
                            fontSize: { xs: "1.9rem", md: "2.5rem" },
                            fontWeight: 800,
                            color: "#111827",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.15,
                            mb: 2,
                        }}
                    >
                        Student Testimonials
                    </Typography>
                    <Typography
                        variant="body1"
                        align="center"
                        sx={{ color: "#6B7280", mb: 6, maxWidth: 600, mx: "auto", lineHeight: 1.8 }}
                    >
                        Hear directly from the students whose lives have been changed by Almaden Voices.
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                            gap: 4,
                            maxWidth: 900,
                            mx: "auto",
                        }}
                    >
                        {studentVideos.map((video, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: "#F9FAFB",
                                        borderRadius: 3,
                                        overflow: "hidden",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    <video
                                        controls
                                        preload="metadata"
                                        style={{
                                            width: "100%",
                                            height: 360,
                                            objectFit: "cover",
                                            display: "block",
                                            borderRadius: "12px 12px 0 0",
                                        }}
                                    >
                                        <source src={video.video} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>

                                    <Box sx={{ p: 2, textAlign: "center" }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: "bold", color: "#111827" }}
                                        >
                                            {video.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Past Sessions Section */}
            <Box id="past-sessions" sx={{ py: 10, bgcolor: "#F9FAFB" }}>
                <Container maxWidth="lg">
                    {/* Centered Header */}
                    <Typography
                        sx={{
                            fontSize: "0.8rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            fontWeight: 800,
                            color: "#2563EB",
                            mb: 1.5,
                            textAlign: "center",
                        }}
                    >
                        Our History
                    </Typography>
                    <Typography
                        align="center"
                        sx={{
                            fontSize: { xs: "1.9rem", md: "2.5rem" },
                            fontWeight: 800,
                            color: "#111827",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.15,
                            mb: 6,
                        }}
                    >
                        Past Sessions
                    </Typography>
                    <Typography
                        variant="body1"
                        align="center"
                        sx={{ color: "#6B7280", mb: 5, maxWidth: 560, mx: "auto", lineHeight: 1.8 }}
                    >
                        Follow the journey from first session to final showcase — see how students grew at every step.
                    </Typography>

                    {/* Dropdown (centered) + Compact All-Sessions Nav (centered) */}
                    <Box sx={{ mb: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <FormControl sx={{ minWidth: { xs: "100%", sm: 320 }, mb: 3 }}>
                            <Select
                                value={selectedIndex}
                                onChange={(e) => setSelectedIndex(e.target.value)}
                                size="small"
                                sx={{
                                    bgcolor: "#FFFFFF",
                                    borderRadius: 2,
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#E5E7EB",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#2563EB",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#2563EB",
                                    },
                                }}
                            >
                                {pastSessions.map((session, i) => (
                                    <MenuItem key={i} value={i}>
                                        {session.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Horizontal All-Sessions Timeline */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: { xs: 0.5, sm: 1 },
                                overflowX: "auto",
                                scrollbarWidth: "none",
                                "&::-webkit-scrollbar": { display: "none" },
                            }}
                        >
                            {pastSessions.map((session, i) => (
                                <Box
                                    key={i}
                                    onClick={() => setSelectedIndex(i)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        flexShrink: 0,
                                    }}
                                >
                                    {/* Dot */}
                                    <Box
                                        sx={{
                                            width: i === selectedIndex ? 12 : 10,
                                            height: i === selectedIndex ? 12 : 10,
                                            borderRadius: "50%",
                                            bgcolor: i === selectedIndex ? "#2563EB" : i < selectedIndex ? "#93C5FD" : "#D1D5DB",
                                            border: i === selectedIndex ? "2px solid #2563EB" : "none",
                                            transition: "all 0.2s",
                                            mx: 0.5,
                                        }}
                                    />
                                    {/* Label (only show on sm+) */}
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: { xs: "none", sm: "block" },
                                            color: i === selectedIndex ? "#2563EB" : "#9CA3AF",
                                            fontWeight: i === selectedIndex ? 700 : 400,
                                            fontSize: "0.7rem",
                                            whiteSpace: "nowrap",
                                            mr: i < pastSessions.length - 1 ? 1 : 0,
                                            transition: "color 0.2s",
                                        }}
                                    >
                                        {session.date.split(" ")[0]}
                                    </Typography>
                                    {/* Connector line */}
                                    {i < pastSessions.length - 1 && (
                                        <Box
                                            sx={{
                                                width: { xs: 16, sm: 24, md: 40 },
                                                height: 2,
                                                bgcolor: i < selectedIndex ? "#93C5FD" : "#E5E7EB",
                                                transition: "background-color 0.2s",
                                            }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Selected Session Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Session Title + Date */}
                            <Box sx={{ mb: 3, textAlign: "center" }}>
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: "bold", color: "#111827", mb: 1 }}
                                >
                                    {selectedSession.title}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5, justifyContent: "center" }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "#2563EB",
                                            fontWeight: 600,
                                            display: "inline-block",
                                            bgcolor: "#EFF6FF",
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 10,
                                        }}
                                    >
                                        {selectedSession.date}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "#6B7280",
                                            fontWeight: 600,
                                            display: "inline-block",
                                            bgcolor: "#F3F4F6",
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 10,
                                        }}
                                    >
                                        {selectedSession.duration}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body1"
                                    sx={{ color: "#6B7280", lineHeight: 1.7, maxWidth: 700, mx: "auto" }}
                                >
                                    {selectedSession.description}
                                </Typography>
                            </Box>

                            {/* Individual Session Journey Timeline (horizontal) */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: { xs: "flex-start", md: "center" },
                                    gap: 0,
                                    mb: 5,
                                    py: 3,
                                    px: { xs: 1, md: 0 },
                                    overflowX: "auto",
                                    scrollbarWidth: "none",
                                    "&::-webkit-scrollbar": { display: "none" },
                                }}
                            >
                                {selectedSession.journey.map((step, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: { xs: 100, sm: 120, md: 140 } }}>
                                            {/* Step dot */}
                                            <Box
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: "50%",
                                                    bgcolor: "#EFF6FF",
                                                    border: "2px solid #2563EB",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    mb: 1,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "#2563EB", fontWeight: 700, fontSize: "0.7rem" }}
                                                >
                                                    {i + 1}
                                                </Typography>
                                            </Box>
                                            {/* Step label */}
                                            <Typography
                                                variant="caption"
                                                align="center"
                                                sx={{
                                                    color: "#4B5563",
                                                    lineHeight: 1.3,
                                                    fontSize: "0.75rem",
                                                    px: 0.5,
                                                }}
                                            >
                                                {step}
                                            </Typography>
                                        </Box>
                                        {/* Arrow connector */}
                                        {i < selectedSession.journey.length - 1 && (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    mt: "12px",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Box sx={{ width: { xs: 12, md: 20 }, height: 2, bgcolor: "#93C5FD" }} />
                                                <Box
                                                    sx={{
                                                        width: 0,
                                                        height: 0,
                                                        borderTop: "4px solid transparent",
                                                        borderBottom: "4px solid transparent",
                                                        borderLeft: "6px solid #93C5FD",
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            {/* Photo Gallery — masonry mosaic that keeps each photo's natural shape */}
                            <Box
                                sx={{
                                    columnCount: { xs: 1, sm: 2, md: 3 },
                                    columnGap: "20px",
                                }}
                            >
                                {selectedSession.images.map((img, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            breakInside: "avoid",
                                            mb: 2.5,
                                            position: "relative",
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={img.src}
                                            alt={img.caption}
                                            sx={{
                                                width: "100%",
                                                height: "auto",
                                                display: "block",
                                                transition: "transform 0.3s",
                                                "&:hover": { transform: "scale(1.03)" },
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                py: 1,
                                                px: 2,
                                                background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{ color: "#FFFFFF", fontWeight: 600 }}
                                            >
                                                {img.caption}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </motion.div>
                    </AnimatePresence>
                </Container>
            </Box>
        </Box>
    );
}
