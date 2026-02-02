import React from "react";
import {
    AppBar, Toolbar, IconButton, Button, Box, Container, Stack, Typography,
    Drawer, List, ListItemButton, ListItemText, Divider, Link as MLink
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { Link as RouterLink, useLocation } from "react-router-dom";

const LINKS = [
    { label: "Home", to: "/home" },
    { label: "About", to: "/about" },
    { label: "Impact", to: "/impact" },
    { label: "Courses", to: "/courses1" },
    { label: "Events", to: "/events" },
    { label: "FAQ", to: "/faq" },
    { label: "Contact", to: "/contact" },
    { label: "Register", to: "/register" }
];

function MobileDrawer({ open, onClose, logo="Almaden Voices" }) {
    const location = useLocation();
    return (
        <Drawer anchor="left" open={open} onClose={onClose}>
            <Box sx={{ width: 280, p: 2 }} role="presentation" onClick={onClose}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={800}>{logo}</Typography>
                    <IconButton><CloseIcon /></IconButton>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <List>
                    {LINKS.map((l) => (
                        <ListItemButton key={l.to} component={RouterLink} to={l.to} selected={location.pathname===l.to}>
                            <ListItemText primary={l.label} />
                        </ListItemButton>
                    ))}
                </List>
                <Button fullWidth variant="contained" color="secondary" startIcon={<VolunteerActivismIcon />} component={RouterLink} to="/donate">
                    Donate
                </Button>
            </Box>
        </Drawer>
    );
}

// ---- Active link with bold styling & indicator ----
function DesktopLinksBig({ underline=true }) {
    const location = useLocation();
    return (
        <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            {LINKS.map((l) => {
                const active = location.pathname === l.to;
                return (
                    <MLink
                        key={l.to}
                        component={RouterLink}
                        to={l.to}
                        underline="none"
                        sx={{
                            fontWeight: 800,
                            fontSize: 16,
                            letterSpacing: '.02em',
                            color: active ? 'secondary.main' : 'text.primary',
                            position: 'relative',
                            px: 0.5,
                            '&:hover': { color: 'secondary.main' },
                            ...(underline ? {
                                '&::after': {
                                    content: '""', position: 'absolute', left: 0, right: 0, bottom: -8,
                                    height: 3, borderRadius: 2,
                                    bgcolor: active ? 'secondary.main' : 'transparent',
                                    transition: 'background-color .2s'
                                }
                            } : {})
                        }}
                    >{l.label}</MLink>
                );
            })}
        </Stack>
    );
}

export default function Navbar({ logo = "Almaden Voices" }) {
    // const isMd = useMediaQuery('(min-width:900px)');
    const [open, setOpen] = React.useState(false);
    return (
        <Box sx={{ my: 2 }}>
                <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'saturate(180%) blur(10px)', borderBottom: 1, borderColor: 'divider' }}>
                    <Container maxWidth="xl">
                        <Toolbar disableGutters sx={{ py: 1.5, gap: 3 }}>
                            {/* Mobile */}
                            <IconButton sx={{ display: { md: 'none' }, mr: 1 }} onClick={()=>setOpen(true)}><MenuIcon /></IconButton>
                            <MobileDrawer open={open} onClose={()=>setOpen(false)} logo={logo} />

                            {/* Brand */}
                            <Typography variant="h5" fontWeight={900} sx={{ mr: 3 }}>
                                {logo}
                            </Typography>

                            {/* Links + Donate */}
                            <Stack direction="row" spacing={2.25} alignItems="center" sx={{ ml: 'auto' }}>
                                <DesktopLinksBig underline />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    component={RouterLink}
                                    to="/donate"
                                    startIcon={<VolunteerActivismIcon />}
                                    sx={{
                                        fontWeight: 900,
                                        borderRadius: 99,
                                        px: 2.25,
                                        py: 1,
                                        boxShadow: (t)=>t.shadows[4]
                                    }}
                                >
                                    Donate
                                </Button>
                            </Stack>
                        </Toolbar>
                    </Container>
                </AppBar>
        </Box>
    );
}