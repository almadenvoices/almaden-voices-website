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
        "I've spent over 1,500 hours in public speaking through Leland Speech and Debate, ranked #1 in California and #5 in the nation. Across 32 tournaments I've reached elimination rounds at four nationally competitive ones, including Stanford, where I earned a bid to the Tournament of Champions, and I've been recognized with NSDA's Special Distinction Award.\n" +
        "\n" +
        "But none of that matters as much as the smile on a student's face when they give their very first speech.\n" +
        "\n" +
        "Growing up, I was lucky to feel confident speaking in front of others. I started Almaden Voices so every student could build that same confidence, discover their voice, and feel proud to use it.",
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
        intro: "Deepti Agrawal is an entrepreneur and educator with more than 20 years leading technology and business initiatives across the U.S., India, and Singapore. Her move from a corporate career to a purpose-driven second chapter reflects her belief that leadership is about creating meaningful impact. Helping young people build confidence and recognize their potential is what brought her to Almaden Voices.",
        photo: "/images/deepti-agrawal.jpeg",
    },
];

// Volunteers, in the order their photos are numbered.
const volunteers = [
    {
        name: "Tara Sundaralingam",
        role: "Chapter/Outreach Lead, Workshop Coordinator",
        intro: "Hi! I'm Tara, a junior at Leland High School, and I'm passionate about speaking, volunteering, and making a difference in my community. I joined Almaden Voices because I truly believe that the power of public speaking is something incredibly crucial for everyone to learn, and I want to help make it more accessible to students everywhere. I'm especially looking forward to holding workshops and creating more national chapters. A fun fact about me—I love trying new food, and frequently try new restaurants!",
        photo: "/images/tara-s-volunteer-1.JPG",
    },
    {
        name: "Avika Chaudhary",
        role: "Global Outreach & Partnership Liaison, Newsletter Editor",
        intro: "Hey! I'm Avika, a junior at Leland High School who fell in love with debate in 8th grade and can't wait to help others do the same. I decided to join Almaden Voices because public speaking was my biggest struggle as a kid, and I would've loved a program that worked on building my confidence. I'm especially excited for the opportunity to lead some workshops and help kids develop their speaking voice. Fun fact: I've jumped off a boat before!",
        photo: "/images/avika-chaudhary-volunteer-2.JPG",
    },
    {
        name: "Saesha Pal",
        role: "Funding Volunteer & District Outreach Volunteer",
        intro: "Hi! My name is Saesha, and I'm a junior at Leland High School. I joined Almaden Voices because I love public speaking and working with other students. I'm really looking forward to connecting with my community and being more involved! Fun fact: I love crocheting gifts for other people!",
        photo: "/images/saesha-pal-volunteer-3.png",
    },
    {
        name: "Tina Kaul",
        role: "Fundraising & Outreach Lead",
        intro: "Hi! I'm Tina, a junior at Leland High School who loves to dance, bake, spend time with friends, and make meaningful impacts in the community. I joined Almaden Voices because I want to help make an impact all over the world through making public speaking classes more accessible. Additionally, I joined to be part of a positive community which I can learn from and collaborate with. I'm looking forward to organizing fundraisers and producing outreach posts to expand this nonprofit even further. Fun fact: I love to cook/bake, but I've literally burnt kraft mac n cheese before.",
        photo: "/images/tina-kaul-volunteer-5.png",
    },
    {
        name: "Diana Mistry",
        role: "Grant Researcher & Social Media Manager",
        intro: "Hello! I'm Diana, a junior at Leland High School who enjoys research, problem-solving, and debate. I joined Almaden Voices because I wanted to help students in my community find their voice and be more confident in who they are. I'm looking forward to raising money for the organization and helping create our first social media pages! Fun fact about me: I've hung sideways off of the fourth tallest building in Chicago!",
        photo: "/images/diana-mistry-volunteer-4.jpg",
    },
    {
        name: "Laya Arun",
        role: "Chapter Lead & Social Media Manager",
        intro: "Hi! I'm Laya, a junior at Leland High School. I'm on the Speech and Debate team at Leland, and I wanted to volunteer with Almaden Voices to help spread the skill of public speaking to kids who are just starting out. I'm excited to help kids build the confidence to speak up and find their own voice. Fun fact: I can say the alphabet backwards!",
        photo: "/images/laya-arun-volunteer-6.jpeg",
    },
    {
        name: "Rhea Bambawale",
        role: "Workshops Developer & District Outreach Lead",
        intro: "Hi! I'm Rhea, a junior at Leland High School who loves speech, robotics, physics, and teaching others. I joined Almaden Voices because I want to help make public speaking feel approachable so that no kid finds it intimidating. I'm looking forward to teaching, creating and hosting workshops, and meeting new students! Fun fact: I've been in a helicopter!",
        photo: "/images/rhea-b-volunteer-7.jpeg",
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

            {/* Our Volunteers - four to a row, the last three centered */}
            <Container id="volunteers" maxWidth="lg" sx={{ mt: 10 }}>
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
                    Student Leaders
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
                    Our Volunteers
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        gap: 4,
                    }}
                >
                    {volunteers.map((volunteer, index) => (
                        <motion.div
                            key={volunteer.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                            style={{ display: "flex" }}
                        >
                            <Box
                                sx={{
                                    width: { xs: 260, sm: 240 },
                                    textAlign: "center",
                                }}
                            >
                                {/* Vertical portrait, or initials while we wait on a photo */}
                                {volunteer.photo && !missingPhotos[volunteer.name] ? (
                                    <Box
                                        component="img"
                                        src={volunteer.photo}
                                        alt={volunteer.name}
                                        onError={() => markPhotoMissing(volunteer.name)}
                                        sx={{
                                            width: "100%",
                                            aspectRatio: "3 / 4",
                                            // Shown whole, never cropped - portraits that
                                            // aren't 3:4 simply sit narrower in the box.
                                            objectFit: "contain",
                                            borderRadius: 3,
                                            display: "block",
                                        }}
                                    />
                                ) : (
                                    <Box
                                        aria-label={volunteer.name}
                                        sx={{
                                            width: "100%",
                                            aspectRatio: "3 / 4",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: 3,
                                            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                            bgcolor: "#E8EEFB",
                                            color: "#2563EB",
                                            fontSize: "3.4rem",
                                            fontWeight: 700,
                                            letterSpacing: "0.02em",
                                        }}
                                    >
                                        {initialsOf(volunteer.name)}
                                    </Box>
                                )}

                                {/* Name */}
                                <Typography
                                    sx={{
                                        mt: 2,
                                        fontSize: "1.05rem",
                                        fontWeight: "bold",
                                        color: "#111827",
                                    }}
                                >
                                    {volunteer.name}
                                </Typography>

                                {/* Role - smaller than the name */}
                                <Typography
                                    sx={{
                                        mt: 0.5,
                                        fontSize: "0.8rem",
                                        fontWeight: 500,
                                        color: "#2563EB",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {volunteer.role}
                                </Typography>

                                {/* Bio */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1.5,
                                        color: "#6B7280",
                                        lineHeight: 1.7,
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    {volunteer.intro}
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





