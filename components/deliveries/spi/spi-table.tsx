"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getCookie } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { useAppTheme } from "@/components/theme/ThemeProvider";
import React from "react";

// Material UI imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  nik: string;
  project: string;
}

interface Supplier {
  id: number;
  name: string;
  code: string;
}

interface SPI {
  id: number;
  spi_number: string;
  spi_date: string;
  supplier_id: number;
  supplier: Supplier;
  po_number: string | null;
  project: string | null;
  status: string;
  remarks: string | null;
  created_by: User;
  created_at: string;
  updated_at: string;
}

interface SearchParams {
  page?: number;
  per_page?: number;
  spi_number?: string;
  po_number?: string;
  project?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export const SpiTable = () => {
  const { mode } = useAppTheme();
  const router = useRouter();

  // State for data
  const [data, setData] = useState<SPI[]>([]);
  const [loading, setLoading] = useState(false);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // State for filters
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    per_page: 10,
  });

  // Initialize search states
  const [spiNumber, setSpiNumber] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Add a ref to track if the component is mounted
  const isMounted = React.useRef(false);

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;

    // Initial data fetch
    fetchData();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array for initial mount only

  // Effect for pagination and search changes
  useEffect(() => {
    // Skip the initial mount since we already fetch in the mount effect
    if (isMounted.current) {
      fetchData();
    }
  }, [page, rowsPerPage, searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", String(page + 1));
      params.append("per_page", String(rowsPerPage));

      if (searchParams.spi_number)
        params.append("spi_number", searchParams.spi_number);
      if (searchParams.po_number)
        params.append("po_number", searchParams.po_number);
      if (searchParams.project) params.append("project", searchParams.project);
      if (searchParams.status) params.append("status", searchParams.status);
      if (searchParams.date_from)
        params.append("date_from", searchParams.date_from);
      if (searchParams.date_to) params.append("date_to", searchParams.date_to);

      console.log(`Fetching SPIs with params: ${params.toString()}`);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/deliveries/spis?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Check content type to ensure it's JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("API response is not JSON:", contentType);
        setData([]);
        setTotalRows(0);
        showToast.error({
          message: "Server returned an invalid response format",
        });
        return;
      }

      // Get the response text first to log in case of error
      const responseText = await response.text();

      try {
        // Try to parse the JSON
        const result = JSON.parse(responseText);
        console.log("API Response:", result);

        if (result.success) {
          // Handle Laravel pagination response format
          if (result.data && typeof result.data === "object") {
            // The data array is in result.data.data
            setData(Array.isArray(result.data.data) ? result.data.data : []);

            // Total count is in result.data.total
            setTotalRows(
              typeof result.data.total === "number" ? result.data.total : 0
            );

            // If we need to update the current page based on the response
            const currentPage = result.data.current_page;
            if (typeof currentPage === "number" && currentPage > 0) {
              // Only update if different to avoid infinite loop
              if (currentPage - 1 !== page) {
                setPage(currentPage - 1); // Convert 1-based to 0-based
              }
            }
          } else {
            console.error("Unexpected API response format:", result);
            setData([]);
            setTotalRows(0);
            showToast.error({
              message: "Received invalid data format from server",
            });
          }
        } else {
          showToast.error({
            message: result.message || "Failed to fetch SPI data",
          });
        }
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError);
        console.error("Response text:", responseText);
        setData([]);
        setTotalRows(0);
        showToast.error({ message: "Failed to parse server response" });
      }
    } catch (error) {
      console.error("Error fetching SPI data:", error);
      showToast.error({ message: "An error occurred while fetching SPI data" });
      setData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    // Convert from 0-based (MUI) to 1-based (Laravel)
    const laravelPage = newPage + 1;
    console.log(`Changing page from ${page + 1} to ${laravelPage}`);
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(
      `Changing rows per page from ${rowsPerPage} to ${newRowsPerPage}`
    );
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page
  };

  const handleSearch = () => {
    setPage(0);
    const newSearchParams = {
      page: 1,
      per_page: rowsPerPage,
      spi_number: spiNumber || undefined,
      po_number: poNumber || undefined,
      project: project || undefined,
      status: status || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    };
    setSearchParams(newSearchParams);
  };

  const handleReset = () => {
    setSpiNumber("");
    setPoNumber("");
    setProject("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
    const newSearchParams = {
      page: 1,
      per_page: rowsPerPage,
    };
    setSearchParams(newSearchParams);
  };

  const handleView = (id: number) => {
    router.push(`/deliveries/spi/view/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/deliveries/spi/edit/${id}`);
  };

  const handlePrint = (id: number) => {
    window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/spis/print/${id}`,
      "_blank"
    );
  };

  const getStatusChip = (status: string) => {
    let color:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning" = "default";

    switch (status) {
      case "DRAFT":
        color = "warning";
        break;
      case "SENT":
        color = "info";
        break;
      case "RECEIVED":
        color = "success";
        break;
      default:
        color = "default";
    }

    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Search filters section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Search Filters
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="SPI Number"
              fullWidth
              value={spiNumber}
              onChange={(e) => setSpiNumber(e.target.value)}
              margin="normal"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="PO Number"
              fullWidth
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              margin="normal"
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Project"
              fullWidth
              value={project}
              onChange={(e) => setProject(e.target.value)}
              margin="normal"
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="SENT">Sent</MenuItem>
                <MenuItem value="RECEIVED">Received</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Date From"
              type="date"
              fullWidth
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              margin="normal"
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Date To"
              type="date"
              fullWidth
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              margin="normal"
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            sx={{ display: "flex", alignItems: "center", mt: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              sx={{ mr: 1 }}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<ClearIcon />}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table section */}
      <Paper elevation={2} sx={{ width: "100%", borderRadius: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="SPI table">
            <TableHead>
              <TableRow
                sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
              >
                <TableCell>SPI Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>PO Number</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No SPI records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {Object.keys(searchParams).length > 2
                        ? "Try adjusting your search filters"
                        : "Create a new SPI to get started"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.spi_number}</TableCell>
                    <TableCell>
                      {format(new Date(row.spi_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{row.supplier.name}</TableCell>
                    <TableCell>{row.po_number || "-"}</TableCell>
                    <TableCell>{row.project || "-"}</TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleView(row.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleEdit(row.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print">
                        <IconButton
                          size="small"
                          onClick={() => handlePrint(row.id)}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Paper>
    </Box>
  );
};
