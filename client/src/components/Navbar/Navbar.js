import React from "react";
import {
    AppBar, Toolbar, IconButton, Button, Box, Container, Stack, Typography,
    Drawer, List, ListItemButton, Divider, Link as MLink,
    Tooltip, Slider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import BrightnessAutoIcon from "@mui/icons-material/BrightnessAuto";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { ColorModeContext } from "../../Theme/ColorModeContext";
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

const LINKS = [
    { label: "Home", to: "/home" },
    { label: "About", to: "/about" },
    { label: "Courses", to: "/courses" },
    { label: "Courses1", to: "/courses1" },
    { label: "FAQ", to: "/faq" },
    { label: "Contact", to: "/contact" }
];

function ThemeSlider({ size = "small" }) {
    const { mode, setMode } = React.useContext(ColorModeContext);
    const value = mode === "dark" ? 2 : mode === "system" ? 1 : 0;
    const marks = [
        { value: 0, label: <LightModeIcon fontSize={size} /> },
        { value: 1, label: <BrightnessAutoIcon fontSize={size} /> },
        { value: 2, label: <DarkModeIcon fontSize={size} /> }
    ];
    return (
        <Box sx={{ width: 120, px: 1 }}>
            <Slider
                size={size}
                value={value}
                onChange={(_, v)=> setMode(v===0?"light": v===1?"system":"dark")}
                min={0}
                max={2}
                step={1}
                marks={marks}
                valueLabelDisplay="off"
            />
        </Box>
    );
}

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
                <Box sx={{ mt: 2 }}>
                    <ThemeSlider />
                </Box>
            </Box>
        </Drawer>
    );
}

// ---- Theme menu (icon → menu) ----
function ThemeMenu() {
    const { mode, setMode } = React.useContext(ColorModeContext);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const Item = ({ value, icon, label }) => (
        <MenuItem selected={mode===value} onClick={()=>{ setMode(value); handleClose(); }}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{label}</ListItemText>
        </MenuItem>
    );
    return (
        <>
            <Tooltip title={`Theme: ${mode}`}>
                <IconButton onClick={handleOpen}><SettingsBrightnessIcon /></IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
                <Item value="light" icon={<LightModeIcon fontSize="small" />} label="Light" />
                <Item value="system" icon={<BrightnessAutoIcon fontSize="small" />} label="System" />
                <Item value="dark" icon={<DarkModeIcon fontSize="small" />} label="Dark" />
            </Menu>
        </>
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

                            {/* Theme menu + Donate */}
                            <Stack direction="row" spacing={2.25} alignItems="center" sx={{ ml: 'auto' }}>
                                <DesktopLinksBig underline />
                                <ThemeMenu />
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