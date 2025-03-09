import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
        }}
      >
        <ThemeToggle />
      </Box>

      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            IRR - Next
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Document Distribution System
          </Typography>

          <LoginForm />

          <Grid container justifyContent="center" sx={{ mt: 3 }}>
            <Grid item>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  style={{
                    textDecoration: "none",
                    color: "primary.main",
                    fontWeight: 500,
                  }}
                >
                  Register
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
