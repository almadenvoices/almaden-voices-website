import { createTheme } from '@mui/material/styles';

const headingFont = "'Playfair Display', Georgia, 'Times New Roman', serif";
const bodyFont = "'DM Sans', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";

export const getAppTheme = () =>
    createTheme({
        palette: {
            mode: 'light',
            background: { default: '#FFFFFF', paper: '#F9FAFB' },
            // Navy and amber. Amber buttons carry navy text: white on amber
            // fails contrast.
            primary: { main: '#1E3A5F', dark: '#14253F', contrastText: '#FFFFFF' },
            secondary: { main: '#FBBF24', dark: '#F59E0B', contrastText: '#10203A' },
            text: {
                primary: '#111827',
                secondary: '#6B7280',
            },
            action: {
                active: '#9CA3AF',
            },
        },
        typography: {
            fontFamily: bodyFont,
            // Headings were all one weight with default tracking, which reads
            // flat. Tightening the large sizes and letting them scale with the
            // viewport gives the pages some hierarchy.
            h1: { fontFamily: headingFont, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" },
            h2: { fontFamily: headingFont, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, fontSize: "clamp(1.9rem, 3.6vw, 2.9rem)" },
            h3: { fontFamily: headingFont, fontWeight: 700, letterSpacing: "-0.018em", lineHeight: 1.2, fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)" },
            h4: { fontFamily: headingFont, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25 },
            h5: { fontFamily: headingFont, fontWeight: 700, letterSpacing: "-0.01em" },
            h6: { fontFamily: headingFont, fontWeight: 700 },
            body1: { lineHeight: 1.75 },
            body2: { lineHeight: 1.7 },
            button: { textTransform: "none", fontWeight: 700, letterSpacing: 0 },
        },
        shape: { borderRadius: 14 },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: { fontFamily: bodyFont }
                }
            },
            // Flat buttons with a small radius. No shadow, no hover lift.
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: {
                        borderRadius: 6,
                        paddingLeft: 22,
                        paddingRight: 22,
                        paddingTop: 10,
                        paddingBottom: 10,
                        transition: "background-color 0.15s ease",
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    rounded: { borderRadius: 16 },
                },
            },
            MuiContainer: {
                defaultProps: {
                    maxWidth: 'xl',
                },
                styleOverrides: {
                    root: {
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        '@media (min-width:1536px)': {
                            paddingLeft: '32px',
                            paddingRight: '32px',
                        },
                    }
                }
            }
        }
    });
