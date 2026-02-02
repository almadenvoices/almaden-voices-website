import React, { useState, useEffect } from "react";
import { Box, Typography, Container, Select, MenuItem, FormControl } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";


const studentVideos = [
    {
        name: "Noah",
        video: "/images/noah-testimonial.mov",
    },
    {
        name: "Oscar",
        video: "/images/oscar-testimonial.mov",
    },
];

const metrics = [
    { number: "5", label: "Sessions Completed", description: "Beginner through advanced" },
    { number: "45+", label: "Students Served", description: "Across multiple levels" },
    { number: "$800+", label: "Raised", description: "In community donations" },
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
            { src: "/images/s2-group-picture.png", caption: "Group photo after the session" },
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
            { src: "/images/s5-fun-kahoot.png", caption: "Fun Kahoot quiz break" },
            { src: "/images/s5-final-debate.jpg", caption: "Final debate showdown on stage" },
            { src: "/images/s5-final-winners.png", caption: "Celebrating the debate winners" },
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
                        variant="h4"
                        align="center"
                        sx={{ fontWeight: "bold", mb: 1, color: "#111827" }}
                    >
                        Our Impact
                    </Typography>
                    <Box
                        sx={{
                            width: 60,
                            height: 3,
                            bgcolor: "#2563EB",
                            borderRadius: 2,
                            mx: "auto",
                            mb: 4
                        }}
                    />

                    {/* Metrics Grid */}
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: { xs: "wrap", md: "nowrap" },
                            justifyContent: "center",
                            gap: { xs: 2, md: 1 },
                        }}
                    >
                        {metrics.map((metric, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                style={{ flex: "1 1 0" }}
                            >
                                <Box
                                    sx={{
                                        textAlign: "center",
                                        minWidth: { xs: 130, md: "auto" },
                                        p: { xs: 1.5, md: 2 },
                                    }}
                                >
                                    <Typography
                                        variant="h3"
                                        sx={{ fontWeight: "bold", color: "#2563EB", mb: 0.5 }}
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
                                        variant="caption"
                                        sx={{ color: "#6B7280" }}
                                    >
                                        {metric.description}
                                    </Typography>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Student Video Testimonials Section */}
            <Box id="testimonials" sx={{ py: 10, bgcolor: "#FFFFFF" }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        align="center"
                        sx={{ fontWeight: "bold", mb: 2, color: "#111827" }}
                    >
                        Student Testimonials
                    </Typography>
                    <Box
                        sx={{
                            width: 80,
                            height: 4,
                            bgcolor: "#2563EB",
                            borderRadius: 2,
                            mx: "auto",
                            mb: 2
                        }}
                    />
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
                                            display: "block",
                                            borderRadius: "12px 12px 0 0",
                                        }}
                                    >
                                        <source src={video.video} type="video/quicktime" />
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
            <Box sx={{ py: 10, bgcolor: "#F9FAFB" }}>
                <Container maxWidth="lg">
                    {/* Centered Header */}
                    <Typography
                        variant="h3"
                        align="center"
                        sx={{ fontWeight: "bold", mb: 1, color: "#111827" }}
                    >
                        Past Sessions
                    </Typography>
                    <Box
                        sx={{
                            width: 80,
                            height: 4,
                            bgcolor: "#2563EB",
                            borderRadius: 2,
                            mx: "auto",
                            mb: 2,
                        }}
                    />
                    <Typography
                        variant="body1"
                        align="center"
                        sx={{ color: "#6B7280", mb: 5, maxWidth: 560, mx: "auto", lineHeight: 1.8 }}
                    >
                        Follow the journey from first session to final showcase — see how students grew at every step.
                    </Typography>

                    {/* Dropdown (left-aligned) + Compact All-Sessions Nav (centered) */}
                    <Box sx={{ mb: 5 }}>
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
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: "bold", color: "#111827", mb: 1 }}
                                >
                                    {selectedSession.title}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
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
                                    sx={{ color: "#6B7280", lineHeight: 1.7, maxWidth: 700 }}
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

                            {/* Photo Gallery + Testimonial */}
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                                    gap: 2.5,
                                }}
                            >
                                {/* First photo - large, spans 2 columns */}
                                <Box
                                    sx={{
                                        gridColumn: { xs: "auto", md: "1 / 3" },
                                        position: "relative",
                                        borderRadius: 3,
                                        overflow: "hidden",
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={selectedSession.images[0].src}
                                        alt={selectedSession.images[0].caption}
                                        sx={{
                                            width: "100%",
                                            aspectRatio: "16/9",
                                            objectFit: "cover",
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
                                            {selectedSession.images[0].caption}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Remaining photos */}
                                {selectedSession.images.slice(1).map((img, i) => (
                                    <Box
                                        key={i}
                                        sx={{
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
                                                aspectRatio: "4/3",
                                                objectFit: "cover",
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
