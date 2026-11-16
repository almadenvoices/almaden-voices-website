import React from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { motion } from "framer-motion";
import GroupsIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import PublicIcon from "@mui/icons-material/Public";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// The chapter guide deck and the application form both live in the
// almadenvoices Google account. Edits made there show up here automatically.
const GUIDE_EMBED_URL =
    "https://docs.google.com/presentation/d/1_VNDbM7Eq3cWgvw8PP1vsG_H_PnbweD-c_gMcXmP2ms/embed?start=false&loop=false";
const GUIDE_URL =
    "https://docs.google.com/presentation/d/1_VNDbM7Eq3cWgvw8PP1vsG_H_PnbweD-c_gMcXmP2ms/edit?usp=sharing";
const FORM_EMBED_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSeBMoIqDDTRZ6-234QzQu7x06hOVb4u_UA6ESdbDkBtRpzUxA/viewform?embedded=true";
const FORM_URL = "https://forms.gle/QWsmu6XRy3j8tGTi6";

const CHAPTER_TYPES = [
    {
        icon: <SchoolIcon sx={{ fontSize: 36, color: "#2563EB" }} />,
        title: "School chapter",
        body: "Affiliated with your school, led by students and supported by a faculty advisor. You'll recruit volunteers from your school and organize free workshops at your school, local libraries, and community spaces.",
    },
    {
        icon: <PublicIcon sx={{ fontSize: 36, color: "#2563EB" }} />,
        title: "Local chapter",
        body: "Serves a city or broader community, independent of any particular school. You'll recruit and coordinate your own volunteers and organize workshops at local libraries and community spaces throughout the year.",
    },
];

const WHAT_YOU_GET = [
    ["Recognition of your work", "Earn volunteer hours and track students reached. Chapter leaders who complete a year in good standing are eligible for a letter of recommendation from our CEO."],
    ["Nonprofit infrastructure", "Operate under Almaden Voices' established 501(c)(3), with support when working with schools, libraries, and community partners."],
    ["Training and ongoing guidance", "An onboarding walkthrough before your first workshop, regular check-ins, and help whenever questions come up."],
    ["Ready-to-use curriculum", "Tested public speaking lesson plans for kindergarten through 9th grade, plus our student showcase format."],
    ["Planning and outreach materials", "Templates for flyers, workshop presentations, family communications, surveys, and more."],
    ["Registration and administration", "Families register through our website, so you won't need to build your own registration system."],
];

const STEPS = [
    ["Get familiar with us", "Read the chapter guide below and explore almadenvoices.org."],
    ["Choose your chapter type", "Decide whether a school or local chapter fits your community best."],
    ["Complete the application", "Fill out the chapter application at the bottom of this page."],
    ["Meet with our team", "If your application moves forward, we'll invite you to a 20-minute interview."],
    ["Receive your decision", "We'll email you within 5–10 business days of your interview."],
    ["Get started!", "Sign a short chapter agreement, complete onboarding, and we'll set you up with a chapter email, shared drive, curriculum, and your first check-in."],
];

function SectionTitle({ children }) {
    return (
        <>
            <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 2, color: "#111827" }}>
                {children}
            </Typography>
            <Box sx={{ width: 80, height: 4, bgcolor: "#2563EB", borderRadius: 2, mx: "auto", mb: 5 }} />
        </>
    );
}

export default function ChaptersPage() {
    return (
        <Box>
            {/* Hero */}
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    minHeight: 380,
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #1e3a8a 0%, #2563EB 50%, #3b82f6 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 3,
                    py: 6,
                }}
            >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <GroupsIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.8)", mb: 2 }} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <Typography
                        variant="h2"
                        sx={{ color: "#FFFFFF", fontWeight: 800, textAlign: "center", fontSize: "clamp(2rem, 5vw, 3rem)" }}
                    >
                        Start a Chapter
                    </Typography>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <Typography
                        sx={{ color: "rgba(255,255,255,0.85)", textAlign: "center", maxWidth: 620, mt: 1.5, lineHeight: 1.7, fontSize: "1.1rem" }}
                    >
                        Chapter applications are open! Bring free public speaking workshops to kids at your
                        school or in your community, with our curriculum, resources, and support behind you.
                    </Typography>
                </motion.div>
                <Button
                    href="#apply"
                    variant="contained"
                    endIcon={<ArrowDownwardIcon />}
                    sx={{
                        mt: 4,
                        bgcolor: "#FBBF24",
                        color: "#111827",
                        fontWeight: 800,
                        px: 4,
                        py: 1.5,
                        borderRadius: 999,
                        "&:hover": { bgcolor: "#F59E0B" },
                    }}
                >
                    Apply now
                </Button>
            </Box>

            {/* What is a chapter */}
            <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: "#FFFFFF" }}>
                <Container maxWidth="md">
                    <SectionTitle>What is a chapter?</SectionTitle>
                    <Typography sx={{ color: "#374151", lineHeight: 1.8, fontSize: "1.05rem", mb: 2 }}>
                        An Almaden Voices chapter is an extension of our 501(c)(3) nonprofit, established at your
                        school or in your local community and led by you. As a chapter leader, you'll organize and
                        facilitate free public speaking workshops for children in your community, using our
                        curriculum, resources, and registration system. We provide the organizational support; you
                        bring the program to your community.
                    </Typography>
                    <Box sx={{ bgcolor: "#EFF6FF", borderLeft: "4px solid #2563EB", borderRadius: 2, p: 3, mt: 3 }}>
                        <Typography sx={{ color: "#1e3a8a", lineHeight: 1.7 }}>
                            <strong>Commitment:</strong> two workshops per month, about three hours per week
                            throughout the school year, plus a monthly check-in with our team. You'll need a team
                            of at least 4 people to start a chapter.
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 3,
                            mt: 5,
                        }}
                    >
                        {CHAPTER_TYPES.map((type) => (
                            <Box key={type.title} sx={{ bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 3, p: 3 }}>
                                {type.icon}
                                <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, mb: 1, color: "#111827" }}>
                                    {type.title}
                                </Typography>
                                <Typography sx={{ color: "#4B5563", lineHeight: 1.7 }}>{type.body}</Typography>
                            </Box>
                        ))}
                    </Box>
                    <Typography sx={{ color: "#6B7280", textAlign: "center", mt: 3, lineHeight: 1.7 }}>
                        Not sure which fits best? That's okay! Tell us your preference in the application and
                        we'll talk it through during your interview.
                    </Typography>
                </Container>
            </Box>

            {/* What you get */}
            <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: "#F9FAFB" }}>
                <Container maxWidth="lg">
                    <SectionTitle>What you get</SectionTitle>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                            gap: 3,
                        }}
                    >
                        {WHAT_YOU_GET.map(([title, body]) => (
                            <Box key={title} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 3, p: 3 }}>
                                <CheckCircleIcon sx={{ color: "#10B981", mb: 1 }} />
                                <Typography sx={{ fontWeight: 700, mb: 1, color: "#111827" }}>{title}</Typography>
                                <Typography sx={{ color: "#4B5563", lineHeight: 1.7, fontSize: "0.95rem" }}>{body}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* How to apply */}
            <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: "#FFFFFF" }}>
                <Container maxWidth="md">
                    <SectionTitle>How to apply</SectionTitle>
                    {STEPS.map(([title, body], index) => (
                        <Box key={title} sx={{ display: "flex", gap: 2.5, mb: 3, alignItems: "flex-start" }}>
                            <Box
                                sx={{
                                    flexShrink: 0,
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    bgcolor: "#2563EB",
                                    color: "#FFFFFF",
                                    fontWeight: 800,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {index + 1}
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: "#111827" }}>{title}</Typography>
                                <Typography sx={{ color: "#4B5563", lineHeight: 1.7 }}>{body}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Container>
            </Box>

            {/* Chapter guide deck */}
            <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: "#F9FAFB" }}>
                <Container maxWidth="md">
                    <SectionTitle>Chapter guide</SectionTitle>
                    <Box
                        sx={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "16 / 9",
                            borderRadius: 3,
                            overflow: "hidden",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                            bgcolor: "#111827",
                        }}
                    >
                        <iframe
                            src={GUIDE_EMBED_URL}
                            title="Almaden Voices chapter guide"
                            allowFullScreen
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                        />
                    </Box>
                    <Typography sx={{ color: "#6B7280", textAlign: "center", mt: 2 }}>
                        Use the arrows to flip through the slides, or{" "}
                        <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", fontWeight: 600 }}>
                            open the guide in a new tab
                        </a>
                        .
                    </Typography>
                </Container>
            </Box>

            {/* Application form */}
            <Box id="apply" sx={{ py: { xs: 8, md: 10 }, bgcolor: "#FFFFFF", scrollMarginTop: "90px" }}>
                <Container maxWidth="md">
                    <SectionTitle>Apply to start a chapter</SectionTitle>
                    <Box
                        sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "1px solid #E5E7EB",
                            bgcolor: "#FFFFFF",
                        }}
                    >
                        <iframe
                            src={FORM_EMBED_URL}
                            title="Almaden Voices chapter application"
                            style={{ width: "100%", height: 1500, border: 0, display: "block" }}
                        >
                            Loading…
                        </iframe>
                    </Box>
                    <Typography sx={{ color: "#6B7280", textAlign: "center", mt: 2 }}>
                        Form not loading?{" "}
                        <a href={FORM_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", fontWeight: 600 }}>
                            Open the application in a new tab
                        </a>
                        . Questions? Email{" "}
                        <a href="mailto:almadenvoices@gmail.com" style={{ color: "#2563EB", fontWeight: 600 }}>
                            almadenvoices@gmail.com
                        </a>
                        .
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}
