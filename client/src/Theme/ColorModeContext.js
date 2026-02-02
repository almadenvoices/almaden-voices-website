import React, { createContext, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from './Theme';

export const ColorModeContext = createContext({ mode: 'light' });

export default function ColorModeProvider({ children }) {
    const theme = useMemo(() => getAppTheme('light'), []);

    return (
        <ColorModeContext.Provider value={{ mode: 'light' }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}
