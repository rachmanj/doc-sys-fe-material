"use client";

import React from "react";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useAppTheme } from "./ThemeProvider";
import Tooltip from "@mui/material/Tooltip";

export function ThemeToggle() {
  const { mode, toggleTheme } = useAppTheme();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="toggle theme"
        size="small"
        sx={{ padding: 0.75 }}
      >
        {mode === "light" ? (
          <Brightness4Icon fontSize="small" />
        ) : (
          <Brightness7Icon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
