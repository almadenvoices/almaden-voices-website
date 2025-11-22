import React from 'react';
import { Outlet } from 'react-router-dom';
// import {Container, Box, Stack} from '@mui/material';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ThemeSwitcher from '../components/ThemeSwitcher/ThemeSwitcher';
import s from './AppLayout.module.css';

// export default function AppLayout() {
//     return (
//         <>
//             <Navbar rightSlot={<div className={s.switchDesktop}><ThemeSwitcher inline /></div>} />
//             <Container disableGutters maxWidth={false} sx={{ minHeight: '100vh', py: 3 }}>
//                 <Stack sx={{ display: { xs: 'flex', sm: 'none' }, mb: 1 }}>
//                     <ThemeSwitcher inline />
//                 </Stack>
//                 <Outlet />
//             </Container>
//             <Footer />
//         </>
//     );
// }

export default function AppLayout() {
    return (
        <>
            <Navbar rightSlot={<div className={s.switchDesktop}><ThemeSwitcher inline /></div>} />
            <main className={s.pageWrap}>
                <div className={s.switchMobile}><ThemeSwitcher inline /></div>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
