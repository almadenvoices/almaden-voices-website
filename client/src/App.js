import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ColorModeProvider from './Theme/ColorModeContext';
import AppLayout from './Layout/AppLayout';
import HomePage from "./Pages/Home/HomePage";
import AboutPage from "./Pages/About/AboutPage";
import CoursesPage from "./Pages/Courses/CoursesPage";
import CoursesPage1 from "./Pages/Courses/CoursesPage1";
import ContactPage from "./Pages/Contact/ContactPage";
import FAQPage from "./Pages/FAQ/FAQPage";
import DonatePage from './Pages/Donate/DonatePage';

export default function App() {
    return (
        <ColorModeProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route index element={<Navigate to="/home" replace />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/courses1" element={<CoursesPage1 />} />
                        <Route path="/donate" element={<DonatePage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ColorModeProvider>
    );
}
