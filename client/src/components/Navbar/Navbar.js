import React from "react";
import {
    AppBar, Toolbar, IconButton, Button, Box, Container, Stack, Typography,
    Drawer, List, ListItemButton, ListItemText, Divider, Link as MLink,
    Popper, Paper, Grow, ClickAwayListener, Collapse
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

const ABOUT_SUBMENU = [
    { label: "About Us", to: "/about" },
    { label: "Our Team", to: "/about#team" },
];

const LINKS = [
    { label: "Home", to: "/home" },
    { label: "About", to: "/about", submenu: ABOUT_SUBMENU },
    { label: "Impact", to: "/impact" },
    { label: "Courses", to: "/courses1" },
    { label: "Events", to: "/events" },
    { label: "FAQ", to: "/faq" },
    { label: "Contact", to: "/contact" },
    { label: "Register", to: "/register" }
];

function MobileDrawer({ open, onClose, logo="Almaden Voices" }) {
    const location = useLocation();
    const [aboutOpen, setAboutOpen] = React.useState(false);
    return (
        <Drawer anchor="left" open={open} onClose={onClose}>
            <Box sx={{ width: 280, p: 2 }} role="presentation">
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={800}>{logo}</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <List>
                    {LINKS.map((l) => {
                        if (l.submenu) {
                            return (
                                <React.Fragment key={l.to}>
                                    <ListItemButton onClick={() => setAboutOpen(!aboutOpen)} selected={location.pathname === l.to}>
                                        <ListItemText primary={l.label} />
                                        {aboutOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </ListItemButton>
                                    <Collapse in={aboutOpen}>
                                        <List disablePadding>
                                            {l.submenu.map((sub) => (
                                                <ListItemButton
                                                    key={sub.to}
                                                    component={RouterLink}
                                                    to={sub.to}
                                                    onClick={onClose}
                                                    sx={{ pl: 4 }}
                                                >
                                                    <ListItemText primary={sub.label} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                </React.Fragment>
                            );
                        }
                        return (
                            <ListItemButton key={l.to} component={RouterLink} to={l.to} selected={location.pathname===l.to} onClick={onClose}>
                                <ListItemText primary={l.label} />
                            </ListItemButton>
                        );
                    })}
                </List>
                <Button fullWidth variant="contained" color="secondary" startIcon={<VolunteerActivismIcon />} component={RouterLink} to="/donate" onClick={onClose}>
                    Donate
                </Button>
            </Box>
        </Drawer>
    );
}

// ---- Desktop link with dropdown support ----
function DesktopLinkWithDropdown({ link, active, underline }) {
    const anchorRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const timeoutRef = React.useRef(null);
    const navigate = useNavigate();

    const handleEnter = () => {
        clearTimeout(timeoutRef.current);
        setOpen(true);
    };

    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 150);
    };

    const handleSubClick = (to) => {
        setOpen(false);
        if (to.includes('#')) {
            const [path, hash] = to.split('#');
            navigate(path);
            setTimeout(() => {
                const el = document.getElementById(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            navigate(to);
        }
    };

    return (
        <Box
            ref={anchorRef}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
        >
            <MLink
                component={RouterLink}
                to={link.to}
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
            >{link.label}</MLink>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                transition
                disablePortal
                sx={{ zIndex: 1300 }}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps} style={{ transformOrigin: 'top left' }}>
                        <Paper
                            elevation={4}
                            sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', minWidth: 160 }}
                            onMouseEnter={handleEnter}
                            onMouseLeave={handleLeave}
                        >
                            <ClickAwayListener onClickAway={() => setOpen(false)}>
                                <List disablePadding>
                                    {link.submenu.map((sub) => (
                                        <ListItemButton
                                            key={sub.to}
                                            onClick={() => handleSubClick(sub.to)}
                                            sx={{
                                                py: 1, px: 2.5,
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                        >
                                            <ListItemText
                                                primary={sub.label}
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    );
}

// ---- Active link with bold styling & indicator ----
function DesktopLinksBig({ underline=true }) {
    const location = useLocation();
    return (
        <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            {LINKS.map((l) => {
                const active = location.pathname === l.to;
                if (l.submenu) {
                    return <DesktopLinkWithDropdown key={l.to} link={l} active={active} underline={underline} />;
                }
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
