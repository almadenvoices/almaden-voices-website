import React from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { motion } from "framer-motion";
import EventIcon from "@mui/icons-material/Event";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CampaignIcon from "@mui/icons-material/Campaign";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Link as RouterLink } from "react-router-dom";

const pastHighlights = [
    {
        title: "Final Showcase — Session 3",
        date: "July 2025",
        description: "Students presented their final speeches in front of an audience of parents and community members.",
        icon: <EmojiEventsIcon />,
    },
    {
        title: "Debate Booster Workshop",
        date: "Winter 2025",
        description: "An intensive workshop focused on debate fundamentals, argumentation, and thinking on your feet.",
        icon: <CampaignIcon />,
    },
    {
        title: "Community Open House",
        date: "Fall 2025",
        description: "Families visited to learn about our programs and meet the team behind Almaden Voices.",
        icon: <GroupsIcon />,
    },
];

export default function EventsPage() {
    return (
        <Box>
            {/* Hero */}
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    height: 340,
                    overflow: "hidden",
                    bgcolor: "#111827",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(135deg, #1e3a8a 0%, #2563EB 50%, #3b82f6 100%)",
                        opacity: 0.9,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 3,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <EventIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.8)", mb: 2 }} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                color: "#FFFFFF",
                                fontWeight: 800,
                                textAlign: "center",
                                fontSize: "clamp(2rem, 5vw, 3rem)",
                            }}
                        >
                            Events
                        </Typography>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                color: "rgba(255,255,255,0.8)",
                                textAlign: "center",
                                maxWidth: 500,
                                mt: 1,
                                lineHeight: 1.7,
                            }}
                        >
                            Stay up to date with everything happening at Almaden Voices.
                        </Typography>
                    </motion.div>
                </Box>
            </Box>

            {/* No Upcoming Events */}
            <Box sx={{ py: 10, bgcolor: "#FFFFFF" }}>
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography
                            variant="h4"
                            align="center"
                            sx={{ fontWeight: 700, mb: 2, color: "#111827" }}
                        >
                            Upcoming Events
                        </Typography>
                        <Box
                            sx={{
                                width: 80,
                                height: 4,
                                bgcolor: "#2563EB",
                                borderRadius: 2,
                                mx: "auto",
                                mb: 4,
                            }}
                        />

                        <Box
                            sx={{
                                textAlign: "center",
                                py: 6,
                                px: 4,
                                bgcolor: "#F9FAFB",
                                borderRadius: 4,
                                border: "2px dashed #E5E7EB",
                            }}
                        >
                            <NotificationsActiveIcon
                                sx={{ fontSize: 56, color: "#D1D5DB", mb: 2 }}
                            />
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
                            >
                                No upcoming events at the moment
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: "#6B7280", maxWidth: 400, mx: "auto", lineHeight: 1.7, mb: 3 }}
                            >
                                We're planning something exciting! Subscribe to our newsletter or follow us to be the first to know when new events are announced.
                            </Typography>
                            <Button
                                variant="contained"
                                component={RouterLink}
                                to="/contact"
                                sx={{
                                    bgcolor: "#2563EB",
                                    fontWeight: 700,
                                    borderRadius: "999px",
                                    px: 4,
                                    py: 1.5,
                                    textTransform: "none",
                                    fontSize: "0.95rem",
                                    "&:hover": { bgcolor: "#1d4ed8" },
                                }}
                            >
                                Get Notified
                            </Button>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Past Highlights */}
            <Box sx={{ py: 10, bgcolor: "#F9FAFB" }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{ fontWeight: 700, mb: 2, color: "#111827" }}
                    >
                        Past Highlights
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
                        sx={{ color: "#6B7280", mb: 6, maxWidth: 500, mx: "auto" }}
                    >
                        A look back at some of our favorite moments.
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                            gap: 4,
                        }}
                    >
                        {pastHighlights.map((event, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: "#FFFFFF",
                                        borderRadius: 3,
                                        p: 4,
                                        height: "100%",
                                        border: "1px solid #E5E7EB",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 8px 24px rgba(37, 99, 235, 0.1)",
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor: "#EFF6FF",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#2563EB",
                                            mb: 2,
                                        }}
                                    >
                                        {event.icon}
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: "#2563EB", fontWeight: 600, letterSpacing: 0.5 }}
                                    >
                                        {event.date}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 700, color: "#111827", mt: 0.5, mb: 1 }}
                                    >
                                        {event.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#6B7280", lineHeight: 1.7 }}
                                    >
                                        {event.description}
                                    </Typography>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* CTA */}
            <Box sx={{ py: 8, textAlign: "center", bgcolor: "#FFFFFF" }}>
                <Container>
                    <Typography
                        variant="h4"
                        gutterBottom
                        fontWeight="bold"
                        sx={{ mb: 1, color: "#111827" }}
                    >
                        Want to host an event with us?
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ color: "#6B7280", mb: 3, maxWidth: 500, mx: "auto" }}
                    >
                        We love partnering with schools, libraries, and community organizations.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        href="/contact"
                        sx={{
                            bgcolor: "#2563EB",
                            color: "#fff",
                            fontWeight: 700,
                            borderRadius: "999px",
                            px: 4,
                            py: 1.5,
                            textTransform: "none",
                            fontSize: "1rem",
                            "&:hover": { bgcolor: "#1d4ed8" },
                        }}
                    >
                        Get in Touch
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}
