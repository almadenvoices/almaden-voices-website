import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ColorModeProvider from './Theme/ColorModeContext';
import AppLayout from './Layout/AppLayout';
import HomePage from "./Pages/Home/HomePage";
import AboutPage from "./Pages/About/AboutPage";
import ContactPage from "./Pages/Contact/ContactPage";
import FAQPage from "./Pages/FAQ/FAQPage";
import DonatePage from './Pages/Donate/DonatePage';
import RegisterPage from './Pages/Register/RegisterPage';
import CoachingPage from './Pages/Coaching/CoachingPage';
import ProgramsPage from './Pages/Programs/ProgramsPage';
import GetInvolvedPage from './Pages/GetInvolved/GetInvolvedPage';
import StoriesPage from './Pages/Stories/StoriesPage';
import { OLD_URL_REDIRECTS, HASH_REDIRECTS } from './data/redirects';

/**
 * Sends an old URL to its new home, keeping ?query. An old #anchor that moved
 * somewhere specific goes there; otherwise the new address's own #anchor
 * wins, and failing that the old one is kept.
 */
function OldUrlRedirect({ to }) {
    const { pathname, search, hash } = useLocation();
    const moved = HASH_REDIRECTS[`${pathname}${hash}`];
    const [toPath, toHash] = to.split('#');
    const target = `${toPath}${search}${toHash ? `#${toHash}` : hash}`;
    return <Navigate to={moved || target} replace />;
}

export default function App() {
    return (
        <ColorModeProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route index element={<HomePage />} />
                        {Object.entries(OLD_URL_REDIRECTS).map(([from, to]) => (
                            <Route key={from} path={from} element={<OldUrlRedirect to={to} />} />
                        ))}
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/programs" element={<ProgramsPage />} />
                        <Route path="/get-involved" element={<GetInvolvedPage />} />
                        <Route path="/stories" element={<StoriesPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/coaching" element={<CoachingPage />} />
                        <Route path="/donate" element={<DonatePage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ColorModeProvider>
    );
}
