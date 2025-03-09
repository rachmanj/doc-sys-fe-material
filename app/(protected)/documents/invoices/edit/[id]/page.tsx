"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EditInvoice from "@/components/documents/invoices/edit-invoice";
import { useAppTheme } from "@/components/theme/ThemeProvider";
import InvoiceAttachments from "@/components/documents/invoices/invoice-attachments";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
      id={`invoice-edit-tabpanel-${index}`}
      aria-labelledby={`invoice-edit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `invoice-edit-tab-${index}`,
    "aria-controls": `invoice-edit-tabpanel-${index}`,
  };
}

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { mode } = useAppTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const invoiceId = parseInt(resolvedParams.id);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleReturn = () => {
    router.push("/documents/invoices?tab=list");
    router.refresh();
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Edit Invoice
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleReturn}
        >
          Back to Invoices
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="invoice edit tabs"
          >
            <Tab label="Detail" {...a11yProps(0)} />
            <Tab label="Distribution" {...a11yProps(1)} />
            <Tab label="Attachments" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <EditInvoice
            invoiceId={invoiceId}
            onSuccess={handleReturn}
            onCancel={handleReturn}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Distribution Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Distribution information will be available in a future update.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              {invoiceId && (
                <Box sx={{ mt: 2 }}>
                  <InvoiceAttachments invoiceId={invoiceId} />
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Box>
  );
}
