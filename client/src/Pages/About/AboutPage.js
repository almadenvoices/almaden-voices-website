import React from "react";
import {
    Box,
    Typography,
    Container,
    Grid,
    Button,
} from "@mui/material";
import { motion } from "framer-motion";

const founder = {
    name: "Anjika Bansal",
    role: "Founder & CEO",
    intro:
        "Hi! I'm Anjika Bansal — Founder of Almaden Voices, with a passion for helping students grow into confident speakers.\n" +
        "\n" +
        "I've dedicated over 1,500 hours to public speaking through Leland Speech and Debate, ranked #1 in California and #5 in the nation. I've competed at 32 tournaments, traveled to Arizona and Berkeley representing Leland, and qualified to elimination rounds at four nationally competitive tournaments, including Stanford, where I earned a bid to the Tournament of Champions. Along the way, I've trained at elite programs like UCLA, GSA, and others, and I'm proud to have been recognized with NSDA's Special Distinction Award and ranked #1 among Leland's sophomore speakers.\n" +
        "\n" +
        "But none of that matters as much as the smile on a student's face when they give their very first speech.\n" +
        "\n" +
        "Growing up, I was lucky to feel confident speaking in front of others — and I know that's not always the case for everyone. I started Almaden Voices to create a space where every student could build that same confidence, discover their voice, and feel proud to use it.\n" +
        "\n" +
        "My goal is simple: to help students become powerful communicators by building skills that go beyond the stage — skills they can use to step into the world with courage.",
    photo: "/images/anjika-bansal.png",
};

const boardMembers = [
    {
        name: "Amit Bansal",
        role: "Board Director",
        intro: "Amit is a Staff Engineer at PayPal specializing in identity and access management. With nearly two decades of experience at companies like eBay, Oracle, and Cisco, he is passionate about crafting exceptional user experiences and frontend architecture. His belief in building confidence in young people through communication skills inspired him to join Almaden Voices.",
        photo: "/images/amit-bansal.png",
    },
    {
        name: "Aditi Bansal",
        role: "Board Director",
        intro: "Aditi Bansal is an expert Web Developer and Engineering Leader based in New York. With a B.Tech in IT and a Master's in Business Management, she blends technical expertise with strategic oversight to deliver scalable, user-centric applications. She also volunteers at her local fire station and is passionate about giving back — which brought her to Almaden Voices.",
        photo: "/images/aditi-bansal.png",
    },
    {
        name: "Deepti Agrawal",
        role: "Board Director",
        intro: "Deepti Agrawal is an entrepreneur, educator, and former corporate leader with more than 20 years of experience leading technology and business initiatives across the U.S., India, and Singapore. Her transition from a successful corporate career to a purpose-driven second chapter reflects her belief that leadership is ultimately about creating meaningful impact. Drawing on her own experience of reinvention, Deepti is passionate about helping young people build confidence, strengthen their communication skills, find their voice, and recognize their potential. This belief brought her to Almaden Voices.",
        // Drop the photo in at client/public/images/deepti-agrawal.png and it
        // appears here. Until that file exists the card shows her initials.
        photo: "/images/deepti-agrawal.png",
    },
];

// "Deepti Agrawal" -> "DA". Used when a director has no photo yet.
const initialsOf = (name) =>
    name.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();

function MeetTheTeam() {
    // A director whose photo file isn't in place yet falls back to initials
    // rather than showing a broken image.
    const [missingPhotos, setMissingPhotos] = React.useState({});
    const markPhotoMissing = (name) =>
        setMissingPhotos((prev) => (prev[name] ? prev : { ...prev, [name]: true }));

    return (
        <Box
            id="team"
            sx={{
                py: 10,
                px: { xs: 2, sm: 4, md: 8 },
                bgcolor: "#F9FAFB",
            }}
        >
            <Typography
                sx={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                    color: "#2563EB",
                    textAlign: "center",
                    mb: 1.5,
                }}
            >
                Who We Are
            </Typography>
            <Typography
                align="center"
                sx={{
                    fontSize: { xs: "1.9rem", md: "2.5rem" },
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                    mb: 8,
                }}
            >
                Meet the Team
            </Typography>

            {/* Founder Section - Image on left, text on right */}
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: { xs: 3, md: 5 },
                            alignItems: { xs: "center", md: "flex-start" },
                        }}
                    >
                        {/* Image on left - equal width */}
                        <Box sx={{ flex: 1, width: "100%" }}>
                            <Box
                                component="img"
                                src={founder.photo}
                                alt={founder.name}
                                sx={{
                                    width: "100%",
                                    height: { xs: 350, md: 450 },
                                    objectFit: "cover",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                }}
                            />
                        </Box>

                        {/* Text on right - equal width */}
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: "bold", mb: 0.5, color: "#111827" }}
                            >
                                {founder.name}
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{ color: "#2563EB", fontWeight: 500, mb: 2 }}
                            >
                                {founder.role}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "#6B7280",
                                    lineHeight: 1.8,
                                    whiteSpace: "pre-line"
                                }}
                            >
                                {founder.intro}
                            </Typography>
                        </Box>
                    </Box>
                </motion.div>
            </Container>

            {/* Board of Directors - 3 columns side by side */}
            <Container id="board" maxWidth="lg">
                <Typography
                sx={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                    color: "#2563EB",
                    textAlign: "center",
                    mb: 1.5,
                }}
            >
                Governance
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
                Board of Directors
            </Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 4,
                        justifyContent: "center",
                    }}
                >
                    {boardMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{ flex: 1, maxWidth: 300 }}
                        >
                            <Box sx={{ textAlign: "center" }}>
                                {/* Name */}
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold", mb: 0.5, color: "#111827" }}
                                >
                                    {member.name}
                                </Typography>

                                {/* Title/Role */}
                                <Typography
                                    variant="subtitle2"
                                    sx={{ color: "#2563EB", fontWeight: 500, mb: 2 }}
                                >
                                    {member.role}
                                </Typography>

                                {/* Image, or initials while we're waiting on a photo */}
                                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                                    {member.photo && !missingPhotos[member.name] ? (
                                        <Box
                                            component="img"
                                            src={member.photo}
                                            alt={member.name}
                                            onError={() => markPhotoMissing(member.name)}
                                            sx={{
                                                width: 200,
                                                height: 200,
                                                objectFit: "cover",
                                                borderRadius: "50%",
                                                border: "3px solid #111827",
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            aria-label={member.name}
                                            sx={{
                                                width: 200,
                                                height: 200,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "50%",
                                                border: "3px solid #111827",
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                                bgcolor: "#E8EEFB",
                                                color: "#2563EB",
                                                fontSize: "3.4rem",
                                                fontWeight: 700,
                                                letterSpacing: "0.02em",
                                            }}
                                        >
                                            {initialsOf(member.name)}
                                        </Box>
                                    )}
                                </Box>

                                {/* Description */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#6B7280",
                                        lineHeight: 1.7,
                                        textAlign: "center",
                                    }}
                                >
                                    {member.intro}
                                </Typography>
                            </Box>
                        </motion.div>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}

// Reliable placeholder images
const aboutImg = "/images/s3-group-picture.jpg";

export default function AboutPage() {
    return (
        <Box>
            {/* About Us / Mission Section */}
            <Box id="mission" sx={{ bgcolor: "#FFFFFF", py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: { xs: 4, md: 8 },
                            alignItems: "center",
                        }}
                    >
                        {/* Left Side - Text */}
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: "bold",
                                    color: "#111827",
                                    mb: 2,
                                    fontSize: { xs: "2rem", md: "2.5rem" }
                                }}
                            >
                                About Us
                            </Typography>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 4,
                                    bgcolor: "#2563EB",
                                    borderRadius: 2,
                                    mb: 4
                                }}
                            />
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "#6B7280",
                                    lineHeight: 1.8,
                                    fontSize: "1.1rem",
                                    mb: 3
                                }}
                            >
                                Almaden Voices is a registered 501(c)(3) nonprofit organization (EIN: 39-4978818) dedicated to empowering young voices in our community. We believe that every child deserves the confidence to speak up and be heard. All donations are tax-deductible to the fullest extent allowed by law.
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "#6B7280",
                                    lineHeight: 1.8,
                                    fontSize: "1.1rem",
                                    mb: 3
                                }}
                            >
                                In a world where over 75% of Americans fear public speaking, our mission is to help kids overcome that fear and discover the power of their own voice. Through our free speech and debate programs, we focus on building confidence, clarity, and leadership skills that last a lifetime.
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "#6B7280",
                                    lineHeight: 1.8,
                                    fontSize: "1.1rem"
                                }}
                            >
                                We believe that confidence shouldn't come with a price tag. That's why Almaden Voices programs are <strong>completely free</strong>, because every child deserves the chance to be seen, heard, and celebrated.
                            </Typography>
                        </Box>

                        {/* Right Side - Image */}
                        <Box sx={{ flex: 1, width: "100%" }}>
                            <Box
                                component="img"
                                src={aboutImg}
                                alt="About Almaden Voices"
                                sx={{
                                    width: "100%",
                                    height: "auto",
                                    borderRadius: 4,
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Meet the Team Section */}
            <MeetTheTeam/>

            {/* Divider */}
            <Box sx={{ bgcolor: "#F9FAFB", px: 4 }}>
                <Box sx={{ maxWidth: 800, mx: "auto", borderTop: "1px solid #E5E7EB" }} />
            </Box>

            {/* Call to Action */}
            <Box
                sx={{
                    py: 8,
                    textAlign: "center",
                    bgcolor: "#F9FAFB",
                }}
            >
                <Container>
                    <Typography
                        variant="h4"
                        gutterBottom
                        fontWeight="bold"
                        sx={{ mb: 3, color: "#111827" }}
                    >
                        Ready to Discover Your Voice?
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        href="/register"
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
                        Get Started
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}





