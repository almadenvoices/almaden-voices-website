import React, { useContext } from 'react';
import { RadioGroup, FormControlLabel, Radio, Stack } from '@mui/material';
import { ColorModeContext } from '../../Theme/ColorModeContext';

export default function ThemeSwitcher({ inline = true }) {
    const { mode, setMode } = useContext(ColorModeContext);
    return (
        <Stack direction={inline ? 'row' : 'column'} alignItems="center" spacing={1}>
            <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
                <FormControlLabel value="light" control={<Radio size="small" />} label="Light" />
                <FormControlLabel value="dark"  control={<Radio size="small" />} label="Dark" />
                <FormControlLabel value="system" control={<Radio size="small" />} label="System" />
            </RadioGroup>
        </Stack>
    );
}