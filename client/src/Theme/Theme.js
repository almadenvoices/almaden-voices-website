import { createTheme } from '@mui/material/styles';

const headingFont = "'Playfair Display', Georgia, 'Times New Roman', serif";
const bodyFont = "'DM Sans', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";

export const getAppTheme = () =>
    createTheme({
        palette: {
            mode: 'light',
            background: { default: '#FFFFFF', paper: '#F9FAFB' },
            primary: { main: '#2563EB' },
            secondary: { main: '#2563EB' },
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
            h1: { fontFamily: headingFont },
            h2: { fontFamily: headingFont },
            h3: { fontFamily: headingFont },
            h4: { fontFamily: headingFont },
            h5: { fontFamily: headingFont },
            h6: { fontFamily: headingFont },
        },
        shape: { borderRadius: 12 },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: { fontFamily: bodyFont }
                }
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
