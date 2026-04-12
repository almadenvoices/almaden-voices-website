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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubscribe = async () => {
        // Validate email
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubscribed(true);
                setMessage(data.message || 'Thank you for subscribing!');
                setEmail('');
                setTimeout(() => {
                    setSubscribed(false);
                    setMessage('');
                }, 5000);
            } else {
                setError(data.error || 'Failed to subscribe. Please try again.');
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            console.error('Subscribe error:', err);
            setError('Network error. Please try again.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };
    const rightColumnLinks = {
        about: [
            { label: 'Our Mission', href: '/about#mission' },
            { label: 'Our Team', href: '/about#team' },
            { label: 'Success Stories', href: '/about#stories' },
            { label: 'Board of Directors', href: '/about#board' }
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
        legal: [
            { label: 'Articles of Incorporation', href: '/docs/articles-of-incorporation.pdf', target: '_blank' }
        ]
    };

    return (
        <div style={{ backgroundColor: '#FFFFFF', color: '#111827' }}>
            {/* Main Footer Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 20px' }}>

                {/* Newsletter Subscription Section */}
                <div style={{backgroundColor: '#F9FAFB', padding: '40px 20px', borderRadius: '12px', borderBottom: '1px solid #E5E7EB', marginBottom: '50px'}}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            fontSize: '1.8rem',
                            fontWeight: 700,
                            marginBottom: '12px',
                            color: '#111827'
                        }}>
                            Stay Connected
                        </h3>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#6B7280',
                            marginBottom: '25px',
                            lineHeight: 1.6,
                        }}>
                            Subscribe to receive updates on upcoming sessions, success stories, and speech tips!
                        </p>

                        <div style={{display: 'flex', gap: '12px', maxWidth: '600px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center'}}>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubscribe()}
                                disabled={loading}
                                style={{
                                    flex: '1',
                                    minWidth: '280px',
                                    padding: '14px 20px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    backgroundColor: '#FFFFFF',
                                    color: '#111827',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    opacity: loading ? 0.6 : 1
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                            />
                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                style={{
                                    padding: '14px 32px',
                                    backgroundColor: subscribed ? '#4caf50' : '#2563EB',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap',
                                    opacity: loading ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!subscribed && !loading) e.currentTarget.style.backgroundColor = '#1d4ed8';
                                }}
                                onMouseLeave={(e) => {
                                    if (!subscribed && !loading) e.currentTarget.style.backgroundColor = '#2563EB';
                                }}
                            >
                                {loading ? 'Subscribing...' : subscribed ? '✓ Subscribed!' : 'Subscribe'}
                            </button>
                        </div>

                        {/* Success/Error Messages */}
                        {(message || error) && (
                            <div style={{
                                marginTop: '15px',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                backgroundColor: error ? '#ff5252' : '#4caf50',
                                color: 'white',
                                textAlign: 'center',
                                fontSize: '0.95rem',
                                fontWeight: 500
                            }}>
                                {message || error}
                            </div>
                        )}
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
                            color: '#2563EB',
                            textAlign: 'center',
                        }}>
                            Almaden Voices
                        </h3>

                        <p style={{
                            fontSize: '1rem',
                            lineHeight: 1.8,
                            color: '#6B7280',
                            marginBottom: '20px'
                        }}>
                            A non-profit organization (EIN: 39-4978818) dedicated to empowering
                            young voices through free speech and debate programs for children in our community.
                        </p>

                        {/* Contact Info */}
                        <div style={{
                            marginBottom: '40px',
                            padding: '20px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '12px'
                        }}>
                            <div>
                                <h4 style={{
                                    color: '#2563EB',
                                    marginBottom: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    📞 Contact
                                </h4>
                                <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                    Email: almadenvoices@gmail.com
                                </p>
                            </div>
                        </div>

                        {/*<div style={{*/}
                        {/*    backgroundColor: '#2d2d44',*/}
                        {/*    padding: '20px',*/}
                        {/*    borderRadius: '10px',*/}
                        {/*    marginBottom: '25px'*/}
                        {/*}}>*/}
                        {/*    <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>*/}
                        {/*        <strong style={{ color: '#9c27b0' }}>Tax ID:</strong> XX-XXXXXXX*/}
                        {/*    </p>*/}
                        {/*    <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>*/}
                        {/*        <strong style={{ color: '#9c27b0' }}>License:</strong> CA-XXXX-XXXX*/}
                        {/*    </p>*/}
                        {/*    <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: 0 }}>*/}
                        {/*        <strong style={{ color: '#9c27b0' }}>Status:</strong> Active Non-Profit*/}
                        {/*    </p>*/}
                        {/*</div>*/}

                        {/* Action Buttons */}
                        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                            <a
                                href="/donate"
                                style={{
                                    display: 'inline-block',
                                    padding: '16px 24px',
                                    backgroundColor: 'transparent',
                                    color: '#2563EB',
                                    border: '2px solid #2563EB',
                                    borderRadius: '10px',
                                    fontSize: '1.1rem',
                                    fontFamily: "'DM Sans', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '12px',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2563EB';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#2563EB';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                Donate Now
                            </a>

                            <a
                                href="/contact"
                                style={{
                                    display: 'inline-block',
                                    padding: '16px 24px',
                                    backgroundColor: 'transparent',
                                    color: '#2563EB',
                                    border: '2px solid #2563EB',
                                    borderRadius: '10px',
                                    fontSize: '1.1rem',
                                    fontFamily: "'DM Sans', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textDecoration: 'none',
                                    marginLeft: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2563EB';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#2563EB';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                Volunteer With Us
                            </a>
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
                                    color: '#111827',
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
                                                    color: '#6B7280',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#2563EB';
                                                    e.currentTarget.style.paddingLeft = '5px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#6B7280';
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
                                    color: '#111827',
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
                                                    color: '#6B7280',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#2563EB';
                                                    e.currentTarget.style.paddingLeft = '5px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#6B7280';
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
                                    color: '#111827',
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
                                                    color: '#6B7280',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#2563EB';
                                                    e.currentTarget.style.paddingLeft = '5px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#6B7280';
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
                                    color: '#111827',
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
                                                    color: '#6B7280',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#2563EB';
                                                    e.currentTarget.style.paddingLeft = '5px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#6B7280';
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

                    </div>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div style={{borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', padding: '25px 20px',}}>
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
                    <div style={{ fontSize: '1rem', color: '#6B7280', margin: 0 }}>
                        © {new Date().getFullYear()} Almaden Voices. All rights reserved.
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <a
                            href="/docs/terms-of-service.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#6B7280',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#2563EB'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                        >
                            Terms of Service <OpenInNewIcon sx={{ fontSize: 14, verticalAlign: 'middle', ml: 0.5 }} />
                        </a>
                        <a
                            href="/docs/privacy-policy.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#6B7280',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#2563EB'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                        >
                            Privacy Policy <OpenInNewIcon sx={{ fontSize: 14, verticalAlign: 'middle', ml: 0.5 }} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;