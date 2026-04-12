import React, { useRef, useState } from 'react';
import {Box, Typography, Container, Button} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HeroVideo from "../../components/HeroVideo/HeroVideo";
import VisionMission from "../../components/Sections/VisionMission";
import TestimonialsGridSlider from '../../components/Testimonial/TestimonialsGridSlider';
// const images = [
//     "https://source.unsplash.com/1600x900/?speech,debate,stage",
//     "https://source.unsplash.com/1600x900/?students,speaking",
//     "https://source.unsplash.com/1600x900/?audience,lecture"
// ];
const heroConfig = {
    title: 'Find your voice. Inspire others.',
    subtitle:
        'Almaden Voices is a community non-profit helping students build confidence, clarity, and leadership through speech & debate.',
    ctas: [
        { label: 'Our Impact', href: '/impact', variant: 'contained', color: 'primary', standout: true },
        { label: 'Our Courses', href: '/courses1', color: 'secondary' },
    ],
    images: [
        '/images/s3-final-showcase-crowd.jpg',
        '/images/looking at paper.JPG',
        '/images/s3-group-picture.jpg',
    ],
    autoplayInterval: 5000,
    overlay: { gradient: false, tint: 'transparent' },
    height: { xs: '60vh', md: '70vh' },
    align: 'center',
    scrollCta: { targetRefId: 'more-section' } // for the down-arrow CTA
};

const testimonials = [
    // August-September 2025 (Advanced)
    {
        name: 'Nirali Doshi',
        sessionType: 'Advanced Session',
        title: "Gained confidence in public speaking",
        review: "Appreciated the efforts put by Anjika in this program. Helped my daughter in gaining confidence in public speaking.",
        rating: 5
    },
    {
        name: 'Shalini Sridhar',
        sessionType: 'Advanced Session',
        title: "Greater clarity and expression",
        review: "Since joining the speech and debate class, I've seen my daughter grow in confidence on stage. She now speaks with greater clarity, expression, and purpose — it's been wonderful to watch her progress!",
        rating: 5
    },
    {
        name: 'Huamin Zhou',
        sessionType: 'Advanced Session',
        title: "Life-changing program",
        review: "The program is an awesome program for speech and debate. It can help with public speaking skills and many others. The people in the program and the teachers are great and very helpful. After this course it can change your life.",
        rating: 5
    },
    {
        name: 'Ujwala Hingarh',
        sessionType: 'Advanced Session',
        title: "Increased confidence level",
        review: "My child continues to grow her speaking skills. This program has increased her confidence level. Thank you!",
        rating: 5
    },
    // April-May 2025 (Beginner)
    {
        name: 'Priya Desai',
        sessionType: 'Beginner Session',
        title: "Impressive and passionate teacher",
        review: "Five stars! Anjika is obviously an impressive communicator but she also mastered how to impart her knowledge with young children with a wide range of skills! She is a wonderful enthusiastic teacher who clearly is passionate about her craft!",
        rating: 5
    },
    {
        name: 'Shahrzad Raisi',
        sessionType: 'Beginner Session',
        title: "Helped my shy child present",
        review: "My child is a very shy person around new faces. He doesn't like to be the center of everyone's attention and have all eyes staring at him. So for him to present his speech in front of other parents was a big deal. Thank you Anjika for sharing your knowledge and experience with him and the other kids!",
        rating: 5
    },
    {
        name: 'Rupa Sundaram',
        sessionType: 'Beginner Session',
        title: "Professional and engaging",
        review: "Anjika and her brother were amazing. I loved their confidence and the way they both engaged kids like a professional. I will definitely recommend their session to kids who are interested to learn about public speaking skills.",
        rating: 5
    },
    {
        name: 'Alice Yang',
        sessionType: 'Beginner Session',
        title: "Remarkable improvement",
        review: "My child absolutely loves the public speaking program! The class was designed to build confidence gradually, starting with enjoyable and engaging ice-breakers and gradually transitioning to more structured speeches. The instructor fostered a warm and supportive environment that encouraged every student to participate and discover their voice. I was astounded by my child's remarkable improvement—not only in speaking clearly and confidently, but also in organizing thoughts, using gestures, and connecting with the audience. This program didn't merely impart public speaking skills; it empowered my child to believe in herself.",
        rating: 5
    },
    // June 2025 Session (Beginner)
    {
        name: 'Deepthi',
        sessionType: 'Beginner Session',
        title: "Great summer program",
        review: "This is a great summer program for kids! They get to introduced to public speaking! I strongly say it's a good start!!",
        rating: 4
    },
    {
        name: 'Jeeyoon Choi',
        sessionType: 'Beginner Session',
        title: "Passionate guidance",
        review: "Anjika's passion to guiding kids for public speaking program was awesome. My kid really enjoyed the whole session!",
        rating: 5
    },
    {
        name: 'Danya',
        sessionType: 'Beginner Session',
        title: "Confidence increased",
        review: "I can definitely see my kid's confidence level has increased. His final speech was awesome and beyond what I had expected.",
        rating: 4
    },
    {
        name: 'Zubera Syeda',
        sessionType: 'Beginner Session',
        title: "Wonderful team",
        review: "A truly beneficial program for kids to grow his or her public speaking skills and confidence. Anjika and Parth make a wonderful team.",
        rating: 4
    },
    {
        name: 'Rekha Holt',
        sessionType: 'Beginner Session',
        title: "Good foundation",
        review: "It's a good foundation for young children prepping them to public speaking. It helped them with eye contact and moving their body while addressing the public.",
        rating: 4
    },
    {
        name: 'Saumya Bhadauria',
        sessionType: 'Beginner Session',
        title: "Amazing sessions",
        review: "We loved seeing our child grow and become better speaker in a matter of weeks. Thank you for your amazing sessions!",
        rating: 5
    },
    {
        name: 'Shikha Dhartterwal',
        sessionType: 'Beginner Session',
        title: "More confident to speak",
        review: "Amayra is feeling more confident to speak in front of group. She enjoyed learning from Anjika and Parth. The sessions were well organized and fun.",
        rating: 5
    },
    {
        name: 'Anita Hothur',
        sessionType: 'Beginner Session',
        title: "Great for practicing speech",
        review: "The program was great for practicing speech over the summer. I do notice an improvement in his confidence. Thanks for all your guidance and patience with the kids.",
        rating: 5
    },
    {
        name: 'Brijal Patel',
        sessionType: 'Beginner Session',
        title: "Built his confidence",
        review: "Really appreciate all the effort Anjika and Parth put into kids. My son really enjoyed their group discussion and rehearsal sessions. Last showcase session really built his confidence.",
        rating: 4
    },
    {
        name: 'Shaila Karim',
        sessionType: 'Beginner Session',
        title: "Great initiative",
        review: "Great initiative and lots of growth! Speaking is a skill that is needed in every aspect of life. This programs gives kids a good start! This program improved my child's confidence in public speaking!",
        rating: 4
    },
    // July 2025 Session (Beginner)
    {
        name: 'Puneet Dhingra',
        sessionType: 'Beginner Session',
        title: "Helps kids thrive",
        review: "Absolutely love the program! This will help kids thrive in their lives and express themselves.",
        rating: 5
    },
    {
        name: 'Vivek Krishnan',
        sessionType: 'Beginner Session',
        title: "Loved the structure",
        review: "Loved the program and its structure. We enjoyed our daughter's journey and are grateful for what she learnt.",
        rating: 5
    },
    {
        name: 'Nidhi Mahajan',
        sessionType: 'Beginner Session',
        title: "Great platform for kids",
        review: "Arjun really enjoyed the program. It's a great platform for kids to start building their confidence in public speaking at a young age.",
        rating: 5
    },
    {
        name: 'Dipti Arora',
        sessionType: 'Beginner Session',
        title: "Much more confident",
        review: "Anjika was great with the kids! Our son was much more confident about being in front of an audience after the session.",
        rating: 5
    },
    {
        name: 'Charlotte Huh',
        sessionType: 'Beginner Session',
        title: "High-quality class",
        review: "It was such a high-quality class that it's almost a shame it was free. I feel like he has gained more confidence and learned a lot.",
        rating: 5
    },
    {
        name: 'Akshatha Chandrashekar',
        sessionType: 'Beginner Session',
        title: "Builds confidence",
        review: "It's a great program initiated by high schoolers. It helps build confidence and practicing skills.",
        rating: 5
    },
    {
        name: 'Shalini Sridhar',
        sessionType: 'Beginner Session',
        title: "Overcame stage fear",
        review: "This is an awesome program. Great effort by Anjika and Parth, they helped all the kids to break out of their shell and overcome their stage fear. My daughter really enjoyed the experience and came out more confident.",
        rating: 5
    },
    {
        name: 'Pranay Pogde',
        sessionType: 'Beginner Session',
        title: "Brought out the best",
        review: "True to its motto, Almaden Voices brought the best out of the Almaden's kids - helping them build tremendous confidence in their voices.",
        rating: 5
    },
    {
        name: 'Soyoung Hwang',
        sessionType: 'Beginner Session',
        title: "Excellent foundation",
        review: "This program teaches one of the most important elements of public speaking, making it an excellent foundation for beginners. It's a great way to build confidence and strengthen your core communication skills.",
        rating: 5
    },
    {
        name: 'Mohan Boddeda',
        sessionType: 'Beginner Session',
        title: "Impactful speech skills",
        review: "Anvi learnt great technique structuring and delivering impactful speech. She wrote her speech and with critical inputs, practice with Anjika it developed into impactful presence.",
        rating: 5
    },
    {
        name: 'Saurabh Shandilya',
        sessionType: 'Beginner Session',
        title: "Clarity and consistency",
        review: "Atharv really enjoyed the program and had only good things to say. He learnt to focus on things which he didn't care about much earlier. Having a clarity and consistency about key points really helped him develop.",
        rating: 5
    },
    {
        name: 'Shan Chen',
        sessionType: 'Beginner Session',
        title: "Responsible and helpful",
        review: "You are so responsible for the class, give them feedback and help them get more confidence. Thank you so much!",
        rating: 5
    },
    {
        name: 'Supriya Sheshu',
        sessionType: 'Beginner Session',
        title: "Excited for every session",
        review: "Very good program for our budding Almaden kids. My daughter was always excited to come for the session and wants to continue through the year!!",
        rating: 5
    },
    {
        name: 'Girish Thombare',
        sessionType: 'Beginner Session',
        title: "Makes a real difference",
        review: "Awesome!! Really makes difference to children's ability to speak in public.",
        rating: 5
    },
    {
        name: 'Ujwala Hingarh',
        sessionType: 'Beginner Session',
        title: "Boosted public speaking confidence",
        review: "Almaden Voices has boosted my child's public speaking confidence. It has taught my child the elements of public speaking. It made my child pick a topic independently and give a short speech. Thank you so much Anjika for providing this opportunity for kids and making them a better speaker!",
        rating: 5
    },
    {
        name: 'Ramya Kudithipudi',
        sessionType: 'Beginner Session',
        title: "Well structured program",
        review: "The program is well structured and executed providing the best environment for kids to learn. It tremendously boosted my child's confidence during public speaking. Her posture, gestures, confidence have all improved in a very short time.",
        rating: 5
    },
    // Winter Debate Booster 2025
    {
        name: 'Anil Babbar',
        sessionType: 'Debate Booster',
        title: "Focused on researching",
        review: "I enjoyed seeing my son really focused on researching the topic and learning how to communicate.",
        rating: 5
    },
    {
        name: 'Ramya Gandamaneni',
        sessionType: 'Debate Booster',
        title: "Great with small kids",
        review: "It was great how you adapt to small kids and make them understand the concept of debate and its structure and I saw all the kids attended all the sessions without dropping.",
        rating: 5
    },
    {
        name: 'Ram Neelakandan',
        sessionType: 'Debate Booster',
        title: "Good early exposure",
        review: "Good concept for the kids to get exposed to at an early stage. This program helped my daughter get an idea on what is a debate.",
        rating: 4
    },
    {
        name: 'Shaila Karim',
        sessionType: 'Debate Booster',
        title: "Supportive environment",
        review: "This program encourages kids to build their debate skills using evidence and provides a supportive environment to build their skills.",
        rating: 5
    },
    {
        name: 'Huamin Zhou',
        sessionType: 'Debate Booster',
        title: "Truly an awesome teacher",
        review: "This program was great! Anjika is such a great teacher at both speech and debate. She truly is a pro and has mastered both speech and debate. She has taught my son so much and tremendous growth has been seen. My son has built his confidence in speech, knowing how to do gestures and when to do them, and many other skills along the way of this program, both the speech and the debate sessions. Anjika is truly an awesome teacher.",
        rating: 5
    }
];


export default function HomePage(){
    const moreRef = useRef(null);
    const videoRef = useRef(null);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <HeroVideo config={heroConfig} />
            <Box id="more-section" ref={moreRef} />
            <VisionMission />
            <TestimonialsGridSlider
                title="Hear From Our Student's Parents"
                subTitle=""
                items={testimonials}
                autoplay={true}
                intervalMs={5000}
                variant="compact"
            />

            {/* See Our Students in Action — teaser video */}
            <Box sx={{ py: 10, bgcolor: "#FFFFFF" }}>
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography
                            variant="h3"
                            align="center"
                            sx={{ fontWeight: "bold", mb: 2, color: "#111827" }}
                        >
                            See Student Testimonials
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
                            sx={{ color: "#6B7280", mb: 5, lineHeight: 1.8 }}
                        >
                            Watch how Almaden Voices is helping students find their confidence.
                        </Typography>

                        {/* Featured teaser video */}
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                aspectRatio: "16/9",
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                                bgcolor: "#000",
                            }}
                        >
                            <Box
                                component="video"
                                ref={videoRef}
                                src="/images/noah-testimonial.mov"
                                controls={videoPlaying}
                                preload="metadata"
                                playsInline
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                            {/* Play button overlay */}
                            {!videoPlaying && (
                                <Box
                                    onClick={() => {
                                        setVideoPlaying(true);
                                        videoRef.current?.play();
                                    }}
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "rgba(0,0,0,0.3)",
                                        transition: "background-color 0.2s",
                                        cursor: "pointer",
                                        "&:hover": { bgcolor: "rgba(0,0,0,0.15)" },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: "50%",
                                            bgcolor: "rgba(255,255,255,0.9)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <PlayArrowIcon sx={{ fontSize: 40, color: "#2563EB" }} />
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* View More button */}
                        <Box sx={{ textAlign: "center", mt: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate("/impact#testimonials")}
                                sx={{
                                    bgcolor: "#2563EB",
                                    borderRadius: "999px",
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.5,
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    "&:hover": { bgcolor: "#1d4ed8" },
                                }}
                            >
                                View More Student Stories
                            </Button>
                        </Box>
                    </motion.div>
                </Container>
            </Box>
        </>
    );
}

