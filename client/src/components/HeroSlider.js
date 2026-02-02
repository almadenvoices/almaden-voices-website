import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

const slides = [
    { title: 'Join Our Debate Club', description: 'Sharpen your skills and confidence.', img: '/images/slide1.jpg' },
    { title: 'Competitive Speech', description: 'Participate in local and national tournaments.', img: '/images/slide2.jpg' },
    { title: 'Workshops & Sessions', description: 'Learn from expert instructors.', img: '/images/slide3.jpg' },
];

export default function HeroSlider() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % slides.length);
        }, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
            {slides.map((slide, i) => (
                <Box
                    key={i}
                    sx={{
                        height: { xs: 250, sm: 400, md: 500 },
                        backgroundImage: `url(${slide.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: i === index ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        textAlign: 'center',
                        p: 2,
                        transition: 'opacity 0.5s ease-in-out',
                    }}
                >
                    <Box>
                        <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>
                            {slide.title}
                        </Typography>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' } }} my={2}>
                            {slide.description}
                        </Typography>
                        <Button variant="contained" color="secondary" href="/register">Register Now</Button>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
