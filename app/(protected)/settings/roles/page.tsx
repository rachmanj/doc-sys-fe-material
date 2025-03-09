"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RolesTable } from "@/components/settings/roles/roles-table";
import { useAuth } from "@/hooks/use-auth";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

export default function RolesPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { mode } = useAppTheme();

  useEffect(() => {
    if (user) {
      setIsLoading(false);
      if (!hasPermission("roles.index")) {
        router.push("/dashboard");
      }
    }
  }, [user, hasPermission, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Roles
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage system roles and their permissions
        </Typography>
      </Box>

      <RolesTable />
    </Box>
  );
}
