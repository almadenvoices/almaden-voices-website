import React from "react";
import {
    Box,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Avatar,
} from "@mui/material";
import { motion } from "framer-motion";

const teamMembers = [
    {
        name: "Anjika Bansal",
        role: "Founder & CEO",
        intro:
            "Hi! I’m Anjika Bansal — Founder of Almaden Voices, with a passion for helping students grow into confident speakers.\n" +
            "\n" +
            "I’ve dedicated over 1,500 hours to public speaking through Leland Speech and Debate, ranked #1 in California and #5 in the nation. I’ve competed at 32 tournaments, traveled to Arizona and Berkeley representing Leland, and qualified to elimination rounds at four nationally competitive tournaments, including Stanford, where I earned a bid to the Tournament of Champions. Along the way, I’ve trained at elite programs like UCLA, GSA, and others, and I’m proud to have been recognized with NSDA’s Special Distinction Award and ranked #1 among Leland’s sophomore speakers.\n" +
            "\n" +
            "But none of that matters as much as the smile on a student’s face when they give their very first speech.\n" +
            "\n" +
            "Growing up, I was lucky to feel confident speaking in front of others — and I know that’s not always the case for everyone. I started Almaden Voices to create a space where every student could build that same confidence, discover their voice, and feel proud to use it.\n" +
            "\n" +
            "My goal is simple: to help students become powerful communicators by building skills that go beyond the stage — skills they can use to step into the world with courage.",

        photo: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        name: "Parth Bansal",
        role: "Assistant Manager",
        intro: "Hi! I’m Parth Bansal — Assistant Manager for Almaden Voices and a 5th grader with a big passion for speaking and helping others find their voice.\n" +
            "\n" +
            "I won 1st place in my school’s 5th grade speech competition, and ever since then, I’ve loved getting on stage and sharing my ideas. At Almaden Voices, I help younger students feel confident, cheer them on during activities, and make sure we always have fun while learning. Even though I’m the youngest on the team, I believe anyone can become a great speaker — no matter their age!\n" +
            "\n" +
            "When I’m not working on speeches, you’ll probably find me playing basketball, solving Rubik’s cubes, or challenging someone to a chess match.\n" +
            "\n",
        photo: "https://randomuser.me/api/portraits/men/46.jpg",
    },
];

function MeetTheTeam() {
    return (
        <Box
            sx={{
                py: 12,
                px: { xs: 2, sm: 6, md: 12 },
                bgcolor: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
            }}
        >
            <Typography
                variant="h3"
                align="center"
                sx={{ fontWeight: "bold", mb: 10, color: "#111827" }}
            >
                Meet the Team
            </Typography>
            <Grid container spacing={10}>
                {teamMembers.map((member, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    borderRadius: 5,
                                    overflow: "hidden",
                                    background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                                    boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                                    position: "relative",
                                    zIndex: 1,
                                    ":hover": {
                                        boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        flex: "0 0 280px",
                                        bgcolor: "#f3f4f6",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        p: 4,
                                        position: "relative",
                                    }}
                                >
                                    <motion.div
                                        whileHover={{ rotate: 3, scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        <Avatar
                                            src={member.photo}
                                            alt={member.name}
                                            sx={{
                                                width: 180,
                                                height: 180,
                                                border: "5px solid white",
                                                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                                            }}
                                        />
                                    </motion.div>
                                </Box>
                                <CardContent sx={{ flex: 1, p: 5 }}>
                                    <Typography
                                        variant="h5"
                                        sx={{ fontWeight: "bold", mb: 1, color: "#1f2937" }}
                                    >
                                        {member.name}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ color: "#6366f1", fontWeight: 500, mb: 3 }}
                                    >
                                        {member.role}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ color: "#374151", lineHeight: 1.8 }}
                                    >
                                        {member.intro}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

// Reliable placeholder images
const heroImg = "https://picsum.photos/1600/900?random=1";
// const founderImg = "https://picsum.photos/400/400?random=2";
const missionImg = "https://picsum.photos/600/400?random=3";
const impactImg = "https://picsum.photos/600/400?random=4";
const storyImg = "https://picsum.photos/600/400?random=5";

export default function AboutPage() {
    return (
        <Box>
            {/* Hero Banner */}
            <Box
                sx={{
                    height: { xs: "60vh", md: "80vh" },
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "#fff",
                    textAlign: "center",
                    px: 2,
                }}
            >
                <Typography
                    variant="h2"
                    sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: "2rem", md: "3.5rem" } }}
                >
                    Empowering Voices, Shaping Futures
                </Typography>
                <Typography variant="h6" sx={{ maxWidth: 700, mb: 3 }}>
                    Our Story
                    Almaden Voices was founded with a simple but powerful belief: every student deserves the confidence to speak up and be heard. In a world where over 75% of Americans fear public speaking, our mission is to help kids overcome that fear and discover the power of their own voice.
                    This isn’t about turning kids into professional speakers or winning trophies. It’s about helping them raise their hands a little higher, speak a little louder, and feel a little braver each week. In just four weeks, or eight sessions, we focus on ten key skills — from body language to speech structure — so that by the end, every student can stand up and deliver a speech of their own.
                    We believe that confidence shouldn't come with a price tag. That’s why Almaden Voices is completely free, with just a one-time $10 registration fee. Because every child deserves the chance to be seen, heard, and celebrated.
                </Typography>
                <Button variant="contained" size="large" color="secondary">
                    Join Us
                </Button>
            </Box>

            {/* Founder Section */}
            <Container sx={{ py: 8 }}>
                <MeetTheTeam/>
            </Container>

            {/* Mission & Philosophy */}
            <Box sx={{ bgcolor: "grey.100", py: 8 }}>
                <Container>
                    <Typography
                        variant="h4"
                        gutterBottom
                        align="center"
                        fontWeight="bold"
                        sx={{ mb: 6 }}
                    >
                        Our Philosophy & Mission
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: "100%", boxShadow: 3 }}>
                                <CardMedia component="img" height="200" image={missionImg} />
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        Philosophy
                                    </Typography>
                                    <Typography>
                                        We believe every student has a voice worth sharing. Debate
                                        is not just about competition, it’s about empowerment,
                                        confidence, and lifelong communication skills.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: "100%", boxShadow: 3 }}>
                                <CardMedia component="img" height="200" image={missionImg} />
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        Mission
                                    </Typography>
                                    <Typography>
                                        Our mission is to create an inclusive platform for students
                                        to learn, practice, and thrive as speakers and leaders —
                                        equipping them with skills that extend beyond debate halls.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Impact Section */}
            <Container sx={{ py: 8 }}>
                <Typography
                    variant="h4"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ mb: 6 }}
                >
                    Our Impact
                </Typography>
                <Grid container spacing={4} justifyContent="center">
                    {[
                        { number: "500+", label: "Students Trained" },
                        { number: "1,500+", label: "Hours of Coaching" },
                        { number: "32+", label: "Tournaments Competed" },
                    ].map((item, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Box textAlign="center" p={3} boxShadow={3} borderRadius={2}>
                                <Typography variant="h3" color="secondary" fontWeight="bold">
                                    {item.number}
                                </Typography>
                                <Typography variant="h6">{item.label}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Our Story */}
            <Box sx={{ bgcolor: "grey.100", py: 8 }}>
                <Container>
                    <Typography
                        variant="h4"
                        align="center"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ mb: 6 }}
                    >
                        Our Story
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ boxShadow: 3 }}>
                                <CardMedia component="img" height="200" image={storyImg} />
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold">
                                        2019 – The Beginning
                                    </Typography>
                                    <Typography>
                                        Almaden Voices was founded with a simple goal: to help
                                        students gain confidence in public speaking.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ boxShadow: 3 }}>
                                <CardMedia component="img" height="200" image={impactImg} />
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold">
                                        2023 – Growing Together
                                    </Typography>
                                    <Typography>
                                        We expanded our programs, trained hundreds of students, and
                                        built a vibrant community of confident young leaders.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Call to Action */}
            <Box
                sx={{
                    py: 8,
                    textAlign: "center",
                    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                    color: "#fff",
                }}
            >
                <Container>
                    <Typography
                        variant="h4"
                        gutterBottom
                        fontWeight="bold"
                        sx={{ mb: 3 }}
                    >
                        Ready to Discover Your Voice?
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ bgcolor: "yellow", color: "#000", fontWeight: "bold" }}
                    >
                        Get Started
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}





