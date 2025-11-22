// import React from 'react';
// import { Box, Typography, Grid, Card, CardContent } from '@mui/material';

// const courses = [
//     { title: 'Course 1', description: 'Introduction to Course 1' },
//     { title: 'Course 2', description: 'Introduction to Course 2' },
//     { title: 'Course 3', description: 'Introduction to Course 3' }
// ];

// export default function CoursesPage() {
//     return (
//         <Box>
//             <Typography variant="h3" mb={4}>
//                 Courses
//             </Typography>
//             <Grid container spacing={3}>
//                 {courses.map((course, idx) => (
//                     <Grid item xs={12} md={4} key={idx}>
//                         <Card sx={{ p: 2 }}>
//                             <CardContent>
//                                 <Typography variant="h5">{course.title}</Typography>
//                                 <Typography>{course.description}</Typography>
//                             </CardContent>
//                         </Card>
//                     </Grid>
//                 ))}
//             </Grid>
//         </Box>
//     );
// }


import React, { useState, useEffect } from 'react';

const CoursesPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Sample data
    const upcomingSessions = [
        {
            id: 1,
            title: "Introduction to Speech Therapy",
            date: "December 15, 2024",
            time: "10:00 AM - 11:30 AM",
            location: "Almaden Community Center",
            ageGroup: "Ages 4-6",
            capacity: 12,
            enrolled: 8,
            instructor: "Sarah Johnson",
            description: "Learn basic articulation and sound production techniques through fun games and activities.",
            status: "Open"
        },
        {
            id: 2,
            title: "Advanced Pronunciation Workshop",
            date: "December 22, 2024",
            time: "2:00 PM - 3:30 PM",
            location: "Online via Zoom",
            ageGroup: "Ages 7-10",
            capacity: 15,
            enrolled: 12,
            instructor: "Michael Chen",
            description: "Focus on challenging sounds and build confidence in public speaking.",
            status: "Open"
        },
        {
            id: 3,
            title: "Story Time & Speech Practice",
            date: "January 5, 2025",
            time: "11:00 AM - 12:00 PM",
            location: "Almaden Library",
            ageGroup: "Ages 3-5",
            capacity: 10,
            enrolled: 10,
            instructor: "Emily Rodriguez",
            description: "Interactive storytelling combined with speech exercises to improve language skills.",
            status: "Full"
        }
    ];

    const pastSessions = [
        {
            id: 1,
            title: "Vocal Exercises for Kids",
            date: "November 10, 2024",
            time: "10:00 AM - 11:30 AM",
            location: "Almaden Community Center",
            ageGroup: "Ages 5-8",
            participants: 15,
            instructor: "Sarah Johnson",
            feedback: "Excellent session! Kids loved the interactive games.",
            rating: 4.9
        },
        {
            id: 2,
            title: "Confidence Building Through Speech",
            date: "November 3, 2024",
            time: "1:00 PM - 2:30 PM",
            location: "Online via Zoom",
            ageGroup: "Ages 8-12",
            participants: 20,
            instructor: "Michael Chen",
            feedback: "Great improvement in children's confidence levels.",
            rating: 4.8
        },
        {
            id: 3,
            title: "Phonics and Fun",
            date: "October 28, 2024",
            time: "3:00 PM - 4:00 PM",
            location: "Almaden Library",
            ageGroup: "Ages 4-6",
            participants: 12,
            instructor: "Emily Rodriguez",
            feedback: "Parents appreciated the practical techniques shared.",
            rating: 5.0
        }
    ];

    const features = [
        { title: "100% Free", description: "All sessions are completely free for the community" },
        { title: "Expert Instructors", description: "Certified speech therapists and educators" },
        { title: "Small Groups", description: "Limited class sizes for personalized attention" },
        { title: "Proven Results", description: "95% of parents report improvement in their child's speech" }
    ];

    return (
        <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                color: 'white',
                padding: '80px 20px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', opacity: isVisible ? 1 : 0, transition: 'opacity 1s' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        Almaden Voices
                    </h1>
                    <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 400, marginBottom: '24px', opacity: 0.95 }}>
                        Free Speech Therapy Sessions for Children
                    </h2>
                    <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.7, opacity: 0.9 }}>
                        Empowering young voices through professional speech therapy and communication skills development.
                        Join our community-driven program dedicated to helping children find their voice and build confidence.
                    </p>
                </div>
            </div>

            {/* Features Section */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                textAlign: 'center',
                                padding: '32px',
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: '1px solid #f0f0f0',
                                transition: 'all 0.3s ease',
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                transitionDelay: `${index * 100}ms`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(156, 39, 176, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                                {index === 0 && '❤️'}
                                {index === 1 && '🎤'}
                                {index === 2 && '👥'}
                                {index === 3 && '🏆'}
                            </div>
                            <h3 style={{ fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>{feature.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* About Section */}
            <div style={{ backgroundColor: 'white', padding: '64px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '24px', color: '#1a1a1a' }}>
                        About Our Program
                    </h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#666', marginBottom: '16px' }}>
                        Almaden Voices is a non-profit initiative dedicated to providing free, high-quality speech therapy
                        sessions to children in our community. We believe that every child deserves the opportunity to
                        communicate confidently and effectively.
                    </p>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#666', marginBottom: '32px' }}>
                        Our certified speech therapists work with small groups of children, creating a supportive and
                        engaging environment where kids can practice and improve their communication skills through
                        fun activities, games, and interactive exercises.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {['Ages 3-12 Welcome', 'No Registration Fees', 'Certified Instructors', 'Flexible Schedules'].map((item, i) => (
                            <span key={i} style={{
                                padding: '8px 16px',
                                backgroundColor: '#f3e5f5',
                                color: '#9c27b0',
                                borderRadius: '20px',
                                fontWeight: 500,
                                fontSize: '0.9rem'
                            }}>
                ✓ {item}
              </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upcoming Sessions */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 20px' }}>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '32px', color: '#1a1a1a' }}>
                    Upcoming Sessions
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    {upcomingSessions.map((session, index) => (
                        <div
                            key={session.id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: '1px solid #f0f0f0',
                                padding: '24px',
                                transition: 'all 0.3s ease',
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                transitionDelay: `${index * 150}ms`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <h3 style={{ fontWeight: 600, color: '#1a1a1a', margin: 0, flex: 1, fontSize: '1.3rem' }}>
                                    {session.title}
                                </h3>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    backgroundColor: session.status === 'Open' ? '#e8f5e9' : '#ffebee',
                                    color: session.status === 'Open' ? '#2e7d32' : '#c62828'
                                }}>
                  {session.status}
                </span>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#666', fontSize: '0.9rem' }}>
                                    <span style={{ marginRight: '8px' }}>📅</span>
                                    <span>{session.date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#666', fontSize: '0.9rem' }}>
                                    <span style={{ marginRight: '8px' }}>⏰</span>
                                    <span>{session.time}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#666', fontSize: '0.9rem' }}>
                                    <span style={{ marginRight: '8px' }}>📍</span>
                                    <span>{session.location}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#666', fontSize: '0.9rem' }}>
                                    <span style={{ marginRight: '8px' }}>👥</span>
                                    <span>{session.ageGroup} • {session.enrolled}/{session.capacity} enrolled</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6, marginBottom: '16px' }}>
                                {session.description}
                            </p>

                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: '#9c27b0',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '8px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                        }}>
                                            {session.instructor.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{session.instructor}</span>
                                    </div>
                                    <button
                                        disabled={session.status === 'Full'}
                                        style={{
                                            padding: '8px 20px',
                                            backgroundColor: session.status === 'Full' ? '#e0e0e0' : '#9c27b0',
                                            color: session.status === 'Full' ? '#999' : 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            cursor: session.status === 'Full' ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (session.status !== 'Full') e.currentTarget.style.backgroundColor = '#7b1fa2';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (session.status !== 'Full') e.currentTarget.style.backgroundColor = '#9c27b0';
                                        }}
                                    >
                                        {session.status === 'Full' ? 'Full' : 'Register'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Past Sessions */}
            <div style={{ backgroundColor: 'white', padding: '64px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '32px', color: '#1a1a1a' }}>
                        Past Sessions
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                        {pastSessions.map((session, index) => (
                            <div
                                key={session.id}
                                style={{
                                    backgroundColor: '#fafafa',
                                    borderRadius: '12px',
                                    border: '1px solid #f0f0f0',
                                    padding: '24px',
                                    opacity: isVisible ? 1 : 0,
                                    transition: 'opacity 1s',
                                    transitionDelay: `${index * 150}ms`
                                }}
                            >
                                <h3 style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '16px', fontSize: '1.2rem' }}>
                                    {session.title}
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#666', fontSize: '0.85rem' }}>
                                            <span style={{ marginRight: '6px' }}>📅</span>
                                            <span>{session.date}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#666', fontSize: '0.85rem' }}>
                                            <span style={{ marginRight: '6px' }}>⏰</span>
                                            <span>{session.time}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#666', fontSize: '0.85rem' }}>
                                            <span style={{ marginRight: '6px' }}>📍</span>
                                            <span>{session.location}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#666', fontSize: '0.85rem' }}>
                                            <span style={{ marginRight: '6px' }}>👥</span>
                                            <span>{session.participants} participants</span>
                                        </div>
                                    </div>
                                </div>

                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    marginBottom: '16px'
                                }}>
                  {session.ageGroup}
                </span>

                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '16px'
                                }}>
                                    <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', margin: 0 }}>
                                        "{session.feedback}"
                                    </p>
                                </div>

                                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: '#9c27b0',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600
                                            }}>
                                                {session.instructor.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{session.instructor}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, color: '#f57c00', marginRight: '4px' }}>{session.rating}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#666' }}>/ 5.0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div style={{
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                color: 'white',
                padding: '64px 20px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '16px' }}>
                        Ready to Join Us?
                    </h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '32px', opacity: 0.95 }}>
                        Register for an upcoming session or learn more about our program
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button style={{
                            padding: '16px 32px',
                            backgroundColor: 'white',
                            color: '#9c27b0',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            Register Now
                        </button>
                        <button style={{
                            padding: '16px 32px',
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '2px solid white',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;