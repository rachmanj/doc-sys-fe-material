"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "@/lib/cookies";
import { Invoice } from "@/types/invoice";
import InvoiceList from "@/components/documents/invoices/invoice-list";
import InvoiceDashboard from "@/components/documents/invoices/invoice-dashboard";
import CreateInvoice from "@/components/documents/invoices/create-invoice";
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
      id={`invoices-tabpanel-${index}`}
      aria-labelledby={`invoices-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `invoices-tab-${index}`,
    "aria-controls": `invoices-tabpanel-${index}`,
  };
}

interface SearchParams {
  page?: number;
  per_page?: number;
  invoice_number?: string;
  supplier_name?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export default function InvoicesPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const { mode } = useAppTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Invoice[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    lastPage: 1,
    links: [],
    from: 0,
    to: 0,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchInvoices = async (params: SearchParams = {}) => {
    try {
      setIsLoading(true);
      const token = getCookie("token");
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      if (!params.per_page) {
        queryParams.append("per_page", perPage.toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/search?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data.data);
      setTotalRows(result.data.total);
      setCurrentPage(result.data.current_page);
      setPaginationData({
        lastPage: result.data.last_page,
        links: result.data.links,
        from: result.data.from,
        to: result.data.to,
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    fetchInvoices({ ...params, page: 1 });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchInvoices();
  }, [perPage]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Invoices Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage and track all invoices
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="invoices tabs"
            sx={{ px: 2 }}
          >
            <Tab label="Dashboard" {...a11yProps(0)} />
            <Tab label="List" {...a11yProps(1)} />
            <Tab label="Create" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <InvoiceDashboard />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <InvoiceList
            data={data}
            loading={isLoading}
            totalRows={totalRows}
            perPage={perPage}
            currentPage={currentPage}
            lastPage={paginationData.lastPage}
            paginationLinks={paginationData.links}
            from={paginationData.from}
            to={paginationData.to}
            setPerPage={setPerPage}
            fetchInvoices={fetchInvoices}
            onSearch={handleSearch}
            searchParams={searchParams}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <CreateInvoice
            onSuccess={() => {
              fetchInvoices(searchParams);
            }}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
}
