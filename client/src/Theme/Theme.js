import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') =>
    createTheme({
        palette: {
            mode,
            ...(mode === 'dark'
                ? { background: { default: '#171826', paper: '#24263a' } }
                : { background: { default: '#ffffff', paper: '#fafafa' } }),
            secondary: { main: '#9c27b0' },
        },
        shape: { borderRadius: 12 },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }
                }
            },
            MuiContainer: {
                defaultProps: {
                    maxWidth: 'xl',        // 🔥 all Containers become xl by default
                },
                styleOverrides: {
                    root: {
                        // optional padding tuning
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