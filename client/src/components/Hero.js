import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function Hero({ title, description }) {
    return (
        <Box sx={{ pt: 20, textAlign: "center" }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    {description}
                </Typography>
            </motion.div>
        </Box>
    );
}
