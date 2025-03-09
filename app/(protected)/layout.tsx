"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useAppTheme } from "@/components/theme/ThemeProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { mode } = useAppTheme();

  useEffect(() => {
    // Check if user is authenticated by verifying token exists
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Navbar />
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: 3,
          mt: 6,
        }}
      >
        {children}
      </Container>
      <Footer />
      <Toaster />
    </Box>
  );
}
