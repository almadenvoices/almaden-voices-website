import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import s from './AppLayout.module.css';

export default function AppLayout() {
    return (
        <>
            <Navbar />
            <main className={s.pageWrap}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
