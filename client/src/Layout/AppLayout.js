import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import s from './AppLayout.module.css';

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Handles scrolling on every navigation:
 * - a URL with #anchor (from the nav, an email, a grant application) scrolls
 *   to that section, smoothly unless reduced motion is on. Pages render their
 *   sections a moment after the route changes, so it retries for up to a
 *   second before giving up.
 * - a new page without an anchor starts at the top.
 * - Back/Forward without an anchor is left to the browser.
 */
function ScrollManager() {
    const { pathname, hash, key } = useLocation();
    const navType = useNavigationType();

    useEffect(() => {
        if (!hash) {
            if (navType !== 'POP') window.scrollTo(0, 0);
            return undefined;
        }
        let id;
        try {
            id = decodeURIComponent(hash.slice(1));
        } catch {
            id = hash.slice(1);
        }
        let tries = 0;
        let frame;
        const attempt = () => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
                return;
            }
            if (tries++ < 60) frame = requestAnimationFrame(attempt);
        };
        frame = requestAnimationFrame(attempt);
        return () => cancelAnimationFrame(frame);
    }, [pathname, hash, key, navType]);

    return null;
}

export default function AppLayout() {
    return (
        // reducedMotion="user": framer-motion skips movement for visitors who
        // have asked for reduced motion.
        <MotionConfig reducedMotion="user">
            <a href="#main" className="skipLink">Skip to content</a>
            <ScrollManager />
            <Navbar />
            <main id="main" tabIndex={-1} className={s.pageWrap}>
                <Outlet />
            </main>
            <Footer />
        </MotionConfig>
    );
}
