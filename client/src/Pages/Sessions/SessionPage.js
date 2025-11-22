import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';

const sessions = [
    { title: 'Session 1', date: '2025-09-10' },
    { title: 'Session 2', date: '2025-09-12' },
    { title: 'Session 3', date: '2025-09-15' }
];

export default function SessionPage() {
    return (
        <Box>
            <Typography variant="h3" mb={4}>
                Sessions
            </Typography>
            <Grid container spacing={3}>
                {sessions.map((session, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                        <Card sx={{ p: 2 }}>
                            <CardContent>
                                <Typography variant="h5">{session.title}</Typography>
                                <Typography>Date: {session.date}</Typography>
                                <Button variant="contained" sx={{ mt: 2 }}>
                                    Join Now
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
