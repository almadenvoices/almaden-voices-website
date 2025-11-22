import React from 'react';
import {
    Box, Container, Stack, Typography, Button, IconButton, useMediaQuery
} from '@mui/material';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import s from './HeroVideo.module.css';

export default function HeroVideo({ config = {} }) {
    const {
        title = 'Find your voice.',
        subtitle = 'Speech & debate that builds confidence.',
        ctas = [
            { label: 'Donate', href: '/donate', color: 'secondary', icon: 'donate' },
            { label: 'Watch Intro', href: '#intro', color: 'inherit', variant: 'outlined', icon: 'play' },
        ],
        video = { sources: [], poster: '' },
        overlay = { gradient: true, tint: 'rgba(0,0,0,.35)' },
        height = { xs: '80vh', md: '88vh' },
        align = 'center',
        scrollCta = null, // { targetRefId: 'more-section' }
        topOffset = 0 // adjust if your navbar overlays (your navbar is sticky, so 0 is fine)
    } = config;

    const isMobile = useMediaQuery('(max-width:600px)');
    const reduceMotion = false;

    const onScrollDown = () => {
        if (scrollCta?.targetRefId) {
            const node = document.getElementById(scrollCta.targetRefId);
            if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
        }
    };

    // Build overlay background string from config
    const overlayBg = overlay?.gradient
        ? `linear-gradient(180deg, rgba(0,0,0,.48) 0%, rgba(0,0,0,.40) 30%, rgba(0,0,0,.34) 60%, rgba(0,0,0,.28) 100%), ${overlay?.tint || 'transparent'}`
        : (overlay?.tint || 'transparent');

    return (
        <Box
            component="section"
            className={s.root}
            style={{ paddingTop: topOffset }}
            aria-label="Hero"
            data-height-xs={height.xs}
            data-height-md={height.md}
        >

            {/* Background */}
            <Box className={s.mediaWrap} aria-hidden>
                {reduceMotion ? (
                    <img src={video.poster} alt="" className={s.poster} />
                ) : (
                    <video className={s.video} playsInline autoPlay muted loop preload="auto" poster={video.poster}>
                        {(video.sources || []).map((src) => <source key={src.src} src={src.src} type={src.type} />)}
                    </video>
                )}
                <Box className={s.overlay} style={{ background: overlayBg }} />
                {/*    <AnimatePresence>*/}
                {/*        <motion.img*/}
                {/*            key={currentImage}*/}
                {/*            src={images[currentImage]}*/}
                {/*            alt="Speech and Debate"*/}
                {/*            initial={{ opacity: 0 }}*/}
                {/*            animate={{ opacity: 1 }}*/}
                {/*            exit={{ opacity: 0 }}*/}
                {/*            transition={{ duration: 1.5 }}*/}
                {/*            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }}*/}
                {/*        />*/}
                {/*    </AnimatePresence>*/}
            </Box>

            {/* Centered content on Hero */}
            <Container maxWidth={false} className={s.containerFix}>
                <div className="container">
                    <Stack
                        className={`${s.content} ${align === 'center' ? s.alignCenter : s.alignStart}`}
                        alignItems={align === 'center' ? 'center' : 'flex-start'}
                        justifyContent="center"
                        spacing={2}
                    >
                        <Typography variant={isMobile ? 'h4' : 'h2'} className={s.title}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant={isMobile ? 'body1' : 'h6'} className={s.subtitle}>
                                {subtitle}
                            </Typography>
                        )}
                        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" className={s.ctaRow}>
                            {(ctas || []).map((b, i) => (
                                <Button
                                    key={(b.label || 'cta') + i}
                                    href={b.href || '#'}
                                    variant={b.variant || 'contained'}
                                    color={b.color || 'secondary'}
                                    size={isMobile ? 'medium' : 'large'}
                                    className={s.ctaBtn}
                                    startIcon={
                                        b.icon === 'donate' ? <VolunteerActivismIcon /> :
                                            b.icon === 'play' ? <PlayArrowIcon /> : undefined
                                    }
                                >
                                    {b.label}
                                </Button>
                            ))}
                        </Stack>

                        {/* Scroll down CTA */}
                        <IconButton onClick={onScrollDown} aria-label="Scroll for more" className={s.scrollBtn}>
                            <KeyboardArrowDownIcon />
                        </IconButton>
                    </Stack>
                </div>
            </Container>
        </Box>
    );
}
