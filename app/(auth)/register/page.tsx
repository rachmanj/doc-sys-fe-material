import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account",
};

export default function RegisterPage() {
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
          <Box sx={{ mb: 2 }}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={64}
              height={64}
              style={{ borderRadius: "8px" }}
            />
          </Box>

          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Create an account
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Enter your details to get started
          </Typography>

          <RegisterForm />

          <Grid container justifyContent="center" sx={{ mt: 3 }}>
            <Grid item>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  href="/login"
                  style={{
                    textDecoration: "none",
                    color: "primary.main",
                    fontWeight: 500,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
