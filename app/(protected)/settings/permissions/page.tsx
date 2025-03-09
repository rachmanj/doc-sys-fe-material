"use client";

import { PermissionsTable } from "@/components/settings/permissions/permissions-table";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

export default function PermissionsPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { mode } = useAppTheme();

  useEffect(() => {
    if (user) {
      // Only check permission after user is loaded
      setIsLoading(false);
      if (!hasPermission("permissions.index")) {
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
          Permissions
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View and manage system permissions
        </Typography>
      </Box>

      <PermissionsTable />
    </Box>
  );
}
