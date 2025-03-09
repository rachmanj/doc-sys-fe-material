"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    // Load theme preference from localStorage on initial render
    const savedTheme = localStorage.getItem("theme") as ThemeMode;
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setMode(savedTheme);
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  // Create theme based on current mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // Light mode palette
                primary: {
                  main: "#1976d2",
                },
                secondary: {
                  main: "#9c27b0",
                },
                background: {
                  default: "#f5f5f5",
                  paper: "#ffffff",
                },
              }
            : {
                // Dark mode palette
                primary: {
                  main: "#90caf9",
                },
                secondary: {
                  main: "#ce93d8",
                },
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
              }),
        },
        typography: {
          fontFamily: "var(--font-geist-sans)",
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: "8px",
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                borderRadius: "8px",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}
