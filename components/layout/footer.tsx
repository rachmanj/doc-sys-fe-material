"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useAppTheme } from "@/components/theme/ThemeProvider";

export function Footer() {
  const { mode } = useAppTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 1.5,
        px: 2,
        mt: "auto",
        backgroundColor: mode === "light" ? "primary.main" : "background.paper",
        color: mode === "light" ? "white" : "text.primary",
        borderTop:
          mode === "dark" ? `1px solid rgba(255, 255, 255, 0.12)` : "none",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              mb: { xs: 0.5, md: 0 },
              fontSize: "0.75rem",
            }}
          >
            © {currentYear} ARKA - All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
            Dev by IT Dept
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
