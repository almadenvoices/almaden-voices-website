import React, { useEffect, useRef } from 'react';
import {Box, Typography} from '@mui/material';
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
        { label: 'Donate', href: '/donate', color: 'secondary', icon: 'donate' },
        { label: 'Learn More', href: '#more', variant: 'outlined', color: 'inherit' }
    ],
    video: {
        sources: [
            { src: 'https://www.w3schools.com/howto/rain.mp4', type: 'video/mp4' },
            { src: '/media/hero.mp4', type: 'video/mp4' },
            { src: '/media/hero.webm', type: 'video/webm' }
        ],
        poster: 'https://source.unsplash.com/1600x900/?speech,debate,stage'
    },
    overlay: { gradient: true, tint: 'rgba(0,0,0,.25)' },
    height: { xs: '78vh', md: '88vh' },
    align: 'center',
    scrollCta: { targetRefId: 'more-section' } // for the down-arrow CTA
};

const testimonials = [
    {
        name: 'Alice Yang',
        role: 'Product Manager',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        title: "Huge boost in confidence",
        review:
            "My child absolutely loves the public speaking program! The welcoming environment and structured practice helped her develop strong communication skills. She now speaks clearly and with confidence — even volunteering to present in class!",
        rating: 4.5
    },
    {
        name: 'Priya Desai',
        role: 'Parent of 6th Grader',
        avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
        title: "Gained remarkable confidence",
        review:
            "My daughter became more expressive and confident in just a few sessions. She learned how to organize thoughts, project her voice, and stay calm while speaking. Truly grateful for this program!",
        rating: 5
    },
    {
        name: 'Rupa Sundaram',
        role: 'Parent of 5th Grader',
        avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
        title: "Warm, supportive coaching",
        review:
            "Every class is filled with positive energy! My son now speaks up in school, shares ideas, and even practices leadership during group projects. The instructors are patient and inspiring.",
        rating: 4
    },
    {
        name: 'Mark Johnson',
        role: 'Software Engineer',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        title: "Structured and inspiring",
        review:
            "I really appreciated the structured curriculum — ice-breakers, practice rounds, and a final speech showcase. My daughter blossomed into a confident young speaker!",
        rating: 4.7
    },
    {
        name: 'Emily Carter',
        role: 'Teacher & Parent',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        title: "Transformative experience",
        review:
            "As a teacher, I admire the teaching method — calm, supportive, and student-centered. My son grew tremendously in confidence and communication. Highly recommend!",
        rating: 5
    },
    {
        name: 'Daniel Rodriguez',
        role: 'Entrepreneur',
        avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
        title: "Public speaking made exciting",
        review:
            "My daughter previously froze up in front of crowds. Now she speaks excitedly and even leads in group projects. This program is truly empowering!",
        rating: 4.8
    },
    {
        name: 'Sofia Martinez',
        role: 'Parent of 4th Grader',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        title: "Encouraging and uplifting",
        review:
            "My son looked forward to every session! He has grown so much in confidence and articulation. This is a rare program that truly nurtures children's voices.",
        rating: 4.9
    },
    {
        name: 'David Kim',
        role: 'Tech Consultant',
        avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
        title: "Skills for life",
        review:
            "Beyond speaking skills, this program teaches leadership, active listening, and self-confidence. My daughter benefited immensely!",
        rating: 4.6
    },
    {
        name: 'Neha Sharma',
        role: 'Parent of 3rd Grader',
        avatar: 'https://randomuser.me/api/portraits/women/76.jpg',
        title: "Wonderful growth journey",
        review:
            "The progress was visible within two weeks — better eye contact, more confident tone, and improved storytelling skills.",
        rating: 5
    },
    {
        name: 'James Rivera',
        role: 'Project Manager',
        avatar: 'https://randomuser.me/api/portraits/men/72.jpg',
        title: "Incredible experience",
        review:
            "My child learned to overcome stage fear and express opinions confidently. The instructors are fantastic mentors!",
        rating: 4.4
    },
    {
        name: 'Mina Patel',
        role: 'Nurse & Parent',
        avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
        title: "More confidence in school",
        review:
            "My son now raises his hand to participate and even volunteered to speak at a school event. This program works!",
        rating: 5
    },
    {
        name: 'Hannah Lee',
        role: 'Parent & Educator',
        avatar: 'https://randomuser.me/api/portraits/women/51.jpg',
        title: "Great learning environment",
        review:
            "Supportive, engaging, and fun — everything kids need to feel confident and capable!",
        rating: 4.7
    },
    {
        name: 'Thomas Nguyen',
        role: 'Business Analyst',
        avatar: 'https://randomuser.me/api/portraits/men/31.jpg',
        title: "Fantastic improvement",
        review:
            "My shy son now speaks clearly and maintains eye contact — huge transformation!",
        rating: 4.9
    },
    {
        name: 'Lara Ahmed',
        role: 'Marketing Specialist',
        avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
        title: "Amazing program",
        review:
            "The instructors made my daughter feel valued and motivated. Her growth in confidence has been incredible!",
        rating: 4.8
    },
    {
        name: 'Wesley Brooks',
        role: 'Parent',
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
        title: "Confidence unlocked",
        review:
            "Thanks to this program, my son now expresses his ideas without hesitation. We are amazed!",
        rating: 4.6
    },
    {
        name: 'Grace Thompson',
        role: 'Parent of 5th Grader',
        avatar: 'https://randomuser.me/api/portraits/women/19.jpg',
        title: "So proud of the improvement",
        review:
            "My daughter delivered a full speech at the final session — we were so proud. She now enjoys speaking!",
        rating: 5
    },
    {
        name: 'Kevin Parker',
        role: 'Engineer',
        avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
        title: "Highly recommend",
        review:
            "Great balance of fun and structure. My child learned speaking, confidence, and presentation skills.",
        rating: 4.7
    },
    {
        name: 'Anita Mehra',
        role: 'Parent',
        avatar: 'https://randomuser.me/api/portraits/women/85.jpg',
        title: "Life-changing",
        review:
            "My child speaks proudly and confidently now. The transformation is real and remarkable!",
        rating: 5
    },
    {
        name: 'Owen Clark',
        role: 'Financial Advisor',
        avatar: 'https://randomuser.me/api/portraits/men/37.jpg',
        title: "Wonderful mentors",
        review:
            "Mentors here genuinely care. They bring out the best in kids — highly recommended.",
        rating: 4.6
    },
    {
        name: 'Sarah Wilson',
        role: 'Parent & Volunteer',
        avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
        title: "Confidence & leadership",
        review:
            "Beyond speaking, my child developed leadership and empathy. Truly a meaningful program!",
        rating: 5
    }
];


export default function HomePage(){
    const moreRef = useRef(null);

    return (
        <>
            <HeroVideo config={heroConfig} />
            <Box id="more-section" ref={moreRef}  sx={{ py: 10, textAlign: 'center', bgcolor: '#f5f5f5' }} />
            <VisionMission />
            <TestimonialsGridSlider
                title="Hear From Our Student's Parents"
                subTitle="Almaden voices develop confidence in students that remain with them for life.
                By cultivating a space where they celebrate, support and challenge one another ideas,
                we prepare them to become a better leaders with awith a lasting confident in the power
                of their own voice."
                items={testimonials}
                autoplay={true}
                intervalMs={5000}
                variant="compact"
            />
        </>
    );
}

