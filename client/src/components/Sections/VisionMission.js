import React from "react";
import { Box, Typography, Container } from "@mui/material";
import { motion } from "framer-motion";

export default function VisionMission() {
    const pillars = [
        {
            title: "Confidence",
            description: "Building comfort on stage, developing a clear voice, and mastering steady breathing techniques.",
            image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop"
        },
        {
            title: "Communication",
            description: "Learning structure, storytelling, and how to connect meaningfully with any audience.",
            image: "/images/s5-peer-activities.jpg"
        },
        {
            title: "Courage",
            description: "Encouraging students to try, iterate, and speak up without fear of making mistakes.",
            image: "/images/courage-home-page.jpg"
        }
    ];

    return (
        <Box sx={{ py: 10, bgcolor: "#FFFFFF" }}>
            <Container maxWidth="lg">
                {/* Why We're Here Heading */}
                <Typography
                    variant="h3"
                    align="center"
                    sx={{ fontWeight: "bold", mb: 2, color: "#111827" }}
                >
                    Why We're Here
                </Typography>
                <Box
                    sx={{
                        width: 80,
                        height: 4,
                        bgcolor: "#2563EB",
                        borderRadius: 2,
                        mx: "auto",
                        mb: 8
                    }}
                />

                {/* Mission and Vision - Side by Side */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: { xs: 4, md: 6 },
                        mb: 10
                    }}
                >
                    {/* Our Mission - Left */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ flex: 1 }}
                    >
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: "bold", mb: 2, color: "#111827" }}
                            >
                                Our Mission
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ color: "#6B7280", lineHeight: 1.8 }}
                            >
                                To deliver accessible, high-impact speech programs that turn fear into growth.
                                We focus on active practice, specific coaching, and celebration of progress.
                                Every child deserves the chance to find their voice and share it with the world.
                            </Typography>
                        </Box>
                    </motion.div>

                    {/* Our Vision - Right */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        style={{ flex: 1 }}
                    >
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: "bold", mb: 2, color: "#111827" }}
                            >
                                Our Vision
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ color: "#6B7280", lineHeight: 1.8 }}
                            >
                                A community where every child speaks with clarity, courage, and kindness —
                                in the classroom, on stage, and throughout life. We envision a world where
                                young voices are heard, valued, and empowered to make a difference.
                            </Typography>
                        </Box>
                    </motion.div>
                </Box>

                {/* Three Pillars - Confidence, Communication, Courage */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 4,
                        justifyContent: "center"
                    }}
                >
                    {pillars.map((pillar, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{ flex: 1 }}
                        >
                            <Box sx={{ textAlign: "center" }}>
                                {/* Title */}
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: "bold", mb: 1, color: "#111827" }}
                                >
                                    {pillar.title}
                                </Typography>

                                {/* Description */}
                                <Typography
                                    variant="body2"
                                    sx={{ color: "#6B7280", lineHeight: 1.7, mb: 3 }}
                                >
                                    {pillar.description}
                                </Typography>

                                {/* Image */}
                                <Box
                                    component="img"
                                    src={pillar.image}
                                    alt={pillar.title}
                                    sx={{
                                        width: "100%",
                                        height: 200,
                                        objectFit: "cover",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                                    }}
                                />
                            </Box>
                        </motion.div>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
