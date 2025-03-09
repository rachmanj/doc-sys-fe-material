"use client";

import { useState } from "react";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export const SpiCreate = () => {
  const { mode } = useAppTheme();

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Create SPI
        </Typography>
        <Typography variant="body2" color="text.secondary">
          SPI creation form will be implemented here
        </Typography>
      </Paper>
    </Box>
  );
};
