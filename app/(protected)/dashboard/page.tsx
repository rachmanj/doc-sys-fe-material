"use client";

import { useAuth } from "@/hooks/use-auth";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SecurityIcon from "@mui/icons-material/Security";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Overview of your system
        </Typography>
      </Box>

      {user && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                User Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PersonIcon sx={{ mr: 2, color: "primary.main" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">{user.name}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EmailIcon sx={{ mr: 2, color: "primary.main" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{user.email}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <BusinessIcon sx={{ mr: 2, color: "primary.main" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Project
                    </Typography>
                    <Typography variant="body1">{user.project}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                Roles & Permissions
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AdminPanelSettingsIcon
                      sx={{ mr: 1, color: "primary.main" }}
                    />
                    <Typography variant="body1" fontWeight="medium">
                      Roles
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {user.roles?.length > 0 ? (
                      user.roles.map((role, index) => (
                        <Chip
                          key={index}
                          label={role}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No roles assigned
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="body1" fontWeight="medium">
                      Permissions
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {user.permissions?.length > 0 ? (
                      user.permissions.map((permission, index) => (
                        <Chip
                          key={index}
                          label={permission}
                          color="secondary"
                          variant="outlined"
                          size="small"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No permissions assigned
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
