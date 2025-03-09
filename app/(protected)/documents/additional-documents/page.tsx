"use client";

import { useState } from "react";
import { AddocDashboard } from "@/components/documents/additional-documents/addoc-dashboard";
import { AddocTable } from "@/components/documents/additional-documents/addoc-table";
import { AddocCreate } from "@/components/documents/additional-documents/addoc-create";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`addoc-tabpanel-${index}`}
      aria-labelledby={`addoc-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `addoc-tab-${index}`,
    "aria-controls": `addoc-tabpanel-${index}`,
  };
}

export default function AdditionalDocumentsPage() {
  const { mode } = useAppTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Additional Documents
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage and track all additional documents
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="additional documents tabs"
            sx={{ px: 2 }}
          >
            <Tab label="Dashboard" {...a11yProps(0)} />
            <Tab label="List" {...a11yProps(1)} />
            <Tab label="Create" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AddocDashboard />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AddocTable />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AddocCreate />
        </TabPanel>
      </Paper>
    </Box>
  );
}
