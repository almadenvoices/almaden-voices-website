import React, { createContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from './Theme';

export const ColorModeContext = createContext({ mode: 'system', setMode: () => {} });

function getSystemMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ColorModeProvider({ children }) {
    const [mode, setMode] = useState(() => localStorage.getItem('color-mode') || 'system');
    const effectiveMode = mode === 'system' ? getSystemMode() : mode;

    useEffect(() => {
        // Expose the effective mode to CSS: html[data-color-mode="light" | "dark"]
        document.documentElement.setAttribute('data-color-mode', effectiveMode);
    }, [effectiveMode]);

    useEffect(() => {
        if (mode !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setMode('system');
        mq.addEventListener?.('change', handler);
        return () => mq.removeEventListener?.('change', handler);
    }, [mode]);

    const ctx = useMemo(() => ({
        mode,
        setMode: (m) => { localStorage.setItem('color-mode', m); setMode(m); }
    }), [mode]);

    const theme = useMemo(() => getAppTheme(effectiveMode), [effectiveMode]);

    return (
        <ColorModeContext.Provider value={ctx}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}