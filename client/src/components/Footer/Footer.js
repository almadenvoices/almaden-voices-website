// import React from 'react';
// import { Box, Typography, Grid, Link, IconButton } from '@mui/material';
// import FacebookIcon from '@mui/icons-material/Facebook';
// import TwitterIcon from '@mui/icons-material/Twitter';
// import InstagramIcon from '@mui/icons-material/Instagram';
// import EmailIcon from '@mui/icons-material/Email';

// export default function Footer() {
//     return (
//         <Box
//             component="footer"
//             sx={{
//                 backgroundColor: '#1976d2',
//                 color: '#fff',
//                 p: 4,
//                 mt: 8
//             }}
//         >
//             <Grid container spacing={4}>
//                 {/* About Section */}
//                 <Grid item xs={12} md={4}>
//                     <Typography variant="h6" gutterBottom>
//                         About Us
//                     </Typography>
//                     <Typography>
//                         We provide high-quality courses and sessions for learners of all ages.
//                     </Typography>
//                 </Grid>
//
//                 {/* Links Section */}
//                 <Grid item xs={12} md={4}>
//                     <Typography variant="h6" gutterBottom>
//                         Quick Links
//                     </Typography>
//                     <Link href="/" color="inherit" display="block">Home</Link>
//                     <Link href="/about" color="inherit" display="block">About</Link>
//                     <Link href="/courses" color="inherit" display="block">Courses</Link>
//                     <Link href="/sessions" color="inherit" display="block">Sessions</Link>
//                     <Link href="/donate" color="inherit" display="block">Donate</Link>
//                     <Link href="/contact" color="inherit" display="block">Contact</Link>
//                 </Grid>
//
//                 {/* Social Section */}
//                 <Grid item xs={12} md={4}>
//                     <Typography variant="h6" gutterBottom>
//                         Connect With Us
//                     </Typography>
//                     <Box>
//                         <IconButton href="https://facebook.com" color="inherit">
//                             <FacebookIcon />
//                         </IconButton>
//                         <IconButton href="https://twitter.com" color="inherit">
//                             <TwitterIcon />
//                         </IconButton>
//                         <IconButton href="https://instagram.com" color="inherit">
//                             <InstagramIcon />
//                         </IconButton>
//                         <IconButton href="mailto:info@example.com" color="inherit">
//                             <EmailIcon />
//                         </IconButton>
//                     </Box>
//                 </Grid>
//             </Grid>
//
//             <Typography variant="body2" align="center" sx={{ mt: 4 }}>
//                 &copy; {new Date().getFullYear()} Your Website Name. All rights reserved.
//             </Typography>
//         </Box>
//     );
// }


import React, { useState } from 'react';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);


    const handleSubscribe = () => {
        if (email && email.includes('@')) {
            setSubscribed(true);
            setTimeout(() => {
                setSubscribed(false);
                setEmail('');
            }, 3000);
        }
    };
    const rightColumnLinks = {
        about: [
            { label: 'Our Mission', href: '#mission' },
            { label: 'Our Team', href: '#team' },
            { label: 'Success Stories', href: '#stories' },
            { label: 'Board of Directors', href: '#board' }
        ],
        programs: [
            { label: 'Upcoming Events', href: '#events' },
            { label: 'Past Sessions', href: '#past' },
            { label: 'Parent Support', href: '#support' },
            { label: 'Volunteer Program', href: '#volunteer' }
        ],
        getInvolved: [
            { label: 'Donate', href: '#donate' },
            { label: 'Volunteer', href: '#volunteer' },
            { label: 'Partner With Us', href: '#partner' },
            { label: 'Become a Sponsor', href: '#sponsor' },
            { label: 'Corporate Partnerships', href: '#corporate' },
            { label: 'Fundraising Events', href: '#fundraising' }
        ],
        News: [
            { label: 'Blog & Articles', href: '#blog' },
            { label: 'Speech Tips', href: '#tips' },
            { label: 'Media Kit', href: '#media' }
        ],
        legal: [
            { label: 'Article of Incorporation', href: '#privacy' },
            { label: 'Annual Reports', href: '#terms' },
            { label: 'Disclaimer', href: '#disclaimer' },
        ]
    };

    const socialLinks = [
        { icon: '📘', label: 'Facebook', href: '#', color: '#1877f2' },
        { icon: '🐦', label: 'Twitter', href: '#', color: '#1da1f2' },
        { icon: '📷', label: 'Instagram', href: '#', color: '#e4405f' },
        { icon: '💼', label: 'LinkedIn', href: '#', color: '#0077b5' },
        { icon: '📺', label: 'YouTube', href: '#', color: '#ff0000' }
    ];

    return (
        <div style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
            {/* Main Footer Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 20px' }}>

                {/* Newsletter Subscription Section */}
                <div style={{backgroundColor: '#2d2d44', padding: '40px 20px', borderRadius: '12px', borderBottom: '1px solid #3d3d5c', marginBottom: '50px'}}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            fontSize: '1.8rem',
                            fontWeight: 700,
                            marginBottom: '12px',
                            color: '#ffffff'
                        }}>
                            Stay Connected
                        </h3>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#b8b8b8',
                            marginBottom: '25px',
                            lineHeight: 1.6,
                        }}>
                            Subscribe to receive updates on upcoming sessions, success stories, and speech therapy tips.
                        </p>

                        <div style={{display: 'flex', gap: '12px', maxWidth: '600px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center'}}>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                                style={{
                                    flex: '1',
                                    minWidth: '280px',
                                    padding: '14px 20px',
                                    border: '2px solid #3d3d5c',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    backgroundColor: '#1a1a2e',
                                    color: 'white',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#9c27b0'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#3d3d5c'}
                            />
                            <button
                                onClick={handleSubscribe}
                                style={{
                                    padding: '14px 32px',
                                    backgroundColor: subscribed ? '#4caf50' : '#9c27b0',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    if (!subscribed) e.currentTarget.style.backgroundColor = '#7b1fa2';
                                }}
                                onMouseLeave={(e) => {
                                    if (!subscribed) e.currentTarget.style.backgroundColor = '#9c27b0';
                                }}
                            >
                                {subscribed ? '✓ Subscribed!' : 'Subscribe'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Footer - Two Column Layout */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px'}}>

                    {/* LEFT COLUMN - About & Action Buttons */}
                    <div>
                        <div style={{
                            marginBottom: '30px'
                        }}>
                        <h3 style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            marginBottom: '20px',
                            color: '#9c27b0',
                            textAlign: 'center',
                        }}>
                            Almaden Voices
                        </h3>

                        <p style={{
                            fontSize: '1rem',
                            lineHeight: 1.8,
                            color: '#b8b8b8',
                            marginBottom: '20px'
                        }}>
                            A California registered 501(c)(3) non-profit organization (Tax Id: xx-xxxxxxxx) dedicated to empowering
                            young voices through free, professional speech therapy sessions for children in our community.
                        </p>

                        {/* Contact Info */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '30px',
                            marginBottom: '40px',
                            padding: '20px',
                            backgroundColor: '#2d2d44',
                            borderRadius: '12px'
                        }}>
                            <div>
                                <h4 style={{
                                    color: '#9c27b0',
                                    marginBottom: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    📍 Address
                                </h4>
                                <p style={{ color: '#b8b8b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                    Almaden Voices<br />
                                    123 Community Drive<br />
                                    San Jose, CA 95120
                                </p>
                            </div>
                            <div>
                                <h4 style={{
                                    color: '#9c27b0',
                                    marginBottom: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    📞 Contact
                                </h4>
                                <p style={{ color: '#b8b8b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                    Phone: (408) 555-0123<br />
                                    Email: info@almadenvoices.org<br />
                                    Hours: Mon-Fri, 9AM-5PM
                                </p>
                            </div>
                        </div>

                        {/*<div style={{*/}
                        {/*    backgroundColor: '#2d2d44',*/}
                        {/*    padding: '20px',*/}
                        {/*    borderRadius: '10px',*/}
                        {/*    marginBottom: '25px'*/}
                        {/*}}>*/}
                        {/*    <p style={{ fontSize: '0.9rem', color: '#b8b8b8', marginBottom: '8px' }}>*/}
                        {/*        <strong style={{ color: '#9c27b0' }}>Tax ID:</strong> XX-XXXXXXX*/}
                        {/*    </p>*/}
                        {/*    <p style={{ fontSize: '0.9rem', color: '#b8b8b8', marginBottom: '8px' }}>*/}
                        {/*        <strong style={{ color: '#9c27b0' }}>License:</strong> CA-XXXX-XXXX*/}
                        {/*    </p>*/}
                        {/*    <p style={{ fontSize: '0.9rem', color: '#b8b8b8', marginBottom: 0 }}>*/}
                        {/*        <strong style={{ color: '#9c27b0' }}>Status:</strong> Active Non-Profit*/}
                        {/*    </p>*/}
                        {/*</div>*/}

                        {/* Action Buttons */}
                        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                            <button
                                style={{
                                    padding: '16px 24px',
                                    backgroundColor: '#9c27b0',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#7b1fa2';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(156, 39, 176, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#9c27b0';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                ❤️ Donate Now
                            </button>

                            <button
                                style={{
                                    width: '30%',
                                    padding: '14px 24px',
                                    backgroundColor: 'transparent',
                                    color: '#9c27b0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#9c27b0';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#9c27b0';
                                }}
                            >
                                📝 Apply for Grant
                            </button>

                            <button
                                style={{
                                    width: '35%',
                                    padding: '14px 24px',
                                    backgroundColor: 'transparent',
                                    color: '#9c27b0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#9c27b0';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#9c27b0';
                                }}
                            >
                                🤝 Volunteer With Us
                            </button>
                        </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Links */}
                    <div>
                        {/* Links Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '40px',
                            marginBottom: '30px'
                        }}>
                            {/* About */}
                            <div>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                    color: '#ffffff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    About
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {rightColumnLinks.about.map((link, index) => (
                                        <li key={index} style={{ marginBottom: '10px' }}>
                                            <a
                                                href={link.href}
                                                style={{
                                                    color: '#b8b8b8',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#9c27b0';
                                                    e.currentTarget.style.paddingLeft = '5px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#b8b8b8';
                                                    e.currentTarget.style.paddingLeft = '0';
                                                }}
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Programs */}
                            <div>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                    color: '#ffffff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Programs & Events
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {rightColumnLinks.programs.map((link, index) => (
                                        <li key={index} style={{ marginBottom: '10px' }}>
                                            <a
                                                href={link.href}
                                                style={{
                                                    color: '#b8b8b8',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#9c27b0';
                                                    e.currentTarget.style.paddingLeft = '5px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#b8b8b8';
                                                    e.currentTarget.style.paddingLeft = '0';
                                                }}
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Resources */}
                            <div>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                    color: '#ffffff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    News & Press Kit
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {rightColumnLinks.News.map((link, index) => (
                                        <li key={index} style={{ marginBottom: '10px' }}>
                                            <a
                                                href={link.href}
                                                style={{
                                                    color: '#b8b8b8',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#9c27b0';
                                                    e.currentTarget.style.paddingLeft = '5px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#b8b8b8';
                                                    e.currentTarget.style.paddingLeft = '0';
                                                }}
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* get Involved */}
                            <div>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                    color: '#ffffff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Get Involved
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {rightColumnLinks.getInvolved.map((link, index) => (
                                        <li key={index} style={{ marginBottom: '10px' }}>
                                            <a
                                                href={link.href}
                                                style={{
                                                    color: '#b8b8b8',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#9c27b0';
                                                    e.currentTarget.style.paddingLeft = '5px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#b8b8b8';
                                                    e.currentTarget.style.paddingLeft = '0';
                                                }}
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Legal */}
                            <div>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                    color: '#ffffff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Legal & Financial
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {rightColumnLinks.legal.map((link, index) => (
                                        <li key={index} style={{ marginBottom: '10px' }}>
                                            <a
                                                href={link.href}
                                                style={{
                                                    color: '#b8b8b8',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#9c27b0';
                                                    e.currentTarget.style.paddingLeft = '5px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#b8b8b8';
                                                    e.currentTarget.style.paddingLeft = '0';
                                                }}
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Social Media Section */}
                        <div style={{backgroundColor: '#2d2d44', padding: '30px', borderRadius: '10px'}}>
                            <h4 style={{
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                marginBottom: '20px',
                                color: '#ffffff',
                                textAlign: 'center'
                            }}>
                                Follow Us on Social Media
                            </h4>
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                justifyContent: 'center',
                                flexWrap: 'wrap'
                            }}>
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            backgroundColor: '#1a1a2e',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            textDecoration: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = social.color;
                                            e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)';
                                            e.currentTarget.style.boxShadow = `0 8px 20px ${social.color}50`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1a1a2e';
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        title={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                            <p style={{
                                textAlign: 'center',
                                color: '#b8b8b8',
                                fontSize: '0.85rem',
                                marginTop: '20px',
                                marginBottom: 0
                            }}>
                                Stay connected and join our community!
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div style={{borderTop: '1px solid #3d3d5c', backgroundColor: '#0f0f1e', padding: '25px 20px',}}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '10px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{ fontSize: '1rem', color: '#888', margin: 0 }}>
                        © {new Date().getFullYear()} Almaden Voices. All rights reserved. | 501(c)(3) Non-Profit Organization
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <a
                            href="#privacy"
                            style={{
                                color: '#888',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#9c27b0'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#terms"
                            style={{
                                color: '#888',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#9c27b0'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                        >
                            Terms of Use
                        </a>
                        <a
                            href="#disclaimer"
                            style={{
                                color: '#888',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#9c27b0'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                        >
                            Disclaimer
                        </a>
                        <a
                            href="#sitemap"
                            style={{
                                color: '#888',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#9c27b0'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                        >
                            Sitemap
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;