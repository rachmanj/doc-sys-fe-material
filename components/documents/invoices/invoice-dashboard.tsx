"use client";

import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";

// Icons
import ReceiptIcon from "@mui/icons-material/Receipt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function InvoiceDashboard() {
  const { mode } = useAppTheme();

  // Mock data for dashboard
  const stats = [
    {
      title: "Total Invoices",
      value: "1,254",
      icon: <ReceiptIcon fontSize="large" color="primary" />,
      color: "primary.main",
    },
    {
      title: "Pending",
      value: "45",
      icon: <PendingActionsIcon fontSize="large" color="warning" />,
      color: "warning.main",
    },
    {
      title: "Completed",
      value: "1,209",
      icon: <CheckCircleIcon fontSize="large" color="success" />,
      color: "success.main",
    },
    {
      title: "This Month",
      value: "87",
      icon: <TrendingUpIcon fontSize="large" color="info" />,
      color: "info.main",
    },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                borderRadius: 2,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {stat.title}
                  </Typography>
                  {stat.icon}
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              height: "100%",
              minHeight: 300,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 10 }}
            >
              Chart or activity feed will be displayed here
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              height: "100%",
              minHeight: 300,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Status Distribution
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 10 }}
            >
              Status pie chart will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
