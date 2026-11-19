import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ColorModeProvider from './Theme/ColorModeContext';
import AppLayout from './Layout/AppLayout';
import HomePage from "./Pages/Home/HomePage";
import AboutPage from "./Pages/About/AboutPage";
import CoursesPage1 from "./Pages/Courses/CoursesPage1";
import ContactPage from "./Pages/Contact/ContactPage";
import FAQPage from "./Pages/FAQ/FAQPage";
import DonatePage from './Pages/Donate/DonatePage';
import RegisterPage from './Pages/Register/RegisterPage';
import ImpactPage from './Pages/Impact/ImpactPage';
import EventsPage from './Pages/Events/EventsPage';
import VolunteerPage from './Pages/Volunteer/VolunteerPage';
import ChaptersPage from './Pages/Chapters/ChaptersPage';
import { OLD_URL_REDIRECTS, HASH_REDIRECTS } from './data/redirects';

/** Sends an old URL to its new home, keeping ?query and #anchor. */
function OldUrlRedirect({ to }) {
    const { pathname, search, hash } = useLocation();
    const moved = HASH_REDIRECTS[`${pathname}${hash}`];
    return <Navigate to={moved || `${to}${search}${hash}`} replace />;
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
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/courses1" element={<CoursesPage1 />} />
                        <Route path="/donate" element={<DonatePage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/impact" element={<ImpactPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/events" element={<EventsPage />} />
                        <Route path="/volunteer" element={<VolunteerPage />} />
                        <Route path="/chapters" element={<ChaptersPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ColorModeProvider>
    );
}
