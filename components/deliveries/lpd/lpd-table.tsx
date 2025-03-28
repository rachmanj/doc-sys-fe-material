"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getCookie } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { useAppTheme } from "@/components/theme/ThemeProvider";

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

interface Department {
  id: number;
  name: string;
  code: string;
}

interface LPD {
  id: number;
  nomor: string;
  date: string;
  origin_code: string;
  destination_code: string;
  attention_person: string | null;
  created_by: User;
  sent_at: string | null;
  received_at: string | null;
  received_by: User | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SearchParams {
  page?: number;
  per_page?: number;
  nomor?: string;
  origin_code?: string;
  destination_code?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export const LpdTable = () => {
  const { mode } = useAppTheme();
  const router = useRouter();

  // State for data
  const [data, setData] = useState<LPD[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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
  const [lpdNumber, setLpdNumber] = useState("");
  const [originCode, setOriginCode] = useState("");
  const [destinationCode, setDestinationCode] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, [page, rowsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", String(page + 1));
      params.append("per_page", String(rowsPerPage));

      if (searchParams.nomor) params.append("nomor", searchParams.nomor);
      if (searchParams.origin_code)
        params.append("origin_code", searchParams.origin_code);
      if (searchParams.destination_code)
        params.append("destination_code", searchParams.destination_code);
      if (searchParams.status) params.append("status", searchParams.status);
      if (searchParams.date_from)
        params.append("date_from", searchParams.date_from);
      if (searchParams.date_to) params.append("date_to", searchParams.date_to);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/deliveries/lpds?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setData(result.data.data);
        setTotalRows(result.data.total);
      } else {
        showToast.error({
          message: result.message || "Failed to fetch LPD data",
        });
      }
    } catch (error) {
      console.error("Error fetching LPD data:", error);
      showToast.error({ message: "An error occurred while fetching LPD data" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    setSearchParams({
      page: 1,
      per_page: rowsPerPage,
      nomor: lpdNumber || undefined,
      origin_code: originCode || undefined,
      destination_code: destinationCode || undefined,
      status: status || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
    fetchData();
  };

  const handleReset = () => {
    setLpdNumber("");
    setOriginCode("");
    setDestinationCode("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
    setSearchParams({
      page: 1,
      per_page: rowsPerPage,
    });
    fetchData();
  };

  const handleView = (id: number) => {
    router.push(`/deliveries/lpd/view/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/deliveries/lpd/edit/${id}`);
  };

  const handlePrint = (id: number) => {
    window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpds/print/${id}`,
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

  const getDepartmentName = (code: string) => {
    const department = departments.find((dept) => dept.code === code);
    return department ? department.name : code;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Search Filters
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="LPD Number"
              fullWidth
              value={lpdNumber}
              onChange={(e) => setLpdNumber(e.target.value)}
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
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Origin</InputLabel>
              <Select
                value={originCode}
                onChange={(e) => setOriginCode(e.target.value)}
                label="Origin"
              >
                <MenuItem value="">All Origins</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.code}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Destination</InputLabel>
              <Select
                value={destinationCode}
                onChange={(e) => setDestinationCode(e.target.value)}
                label="Destination"
              >
                <MenuItem value="">All Destinations</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.code}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

      <Paper elevation={2} sx={{ width: "100%", borderRadius: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="LPD table">
            <TableHead>
              <TableRow
                sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
              >
                <TableCell>LPD Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Origin</TableCell>
                <TableCell>Destination</TableCell>
                <TableCell>Attention</TableCell>
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
                      No LPD records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.nomor}</TableCell>
                    <TableCell>
                      {format(new Date(row.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{getDepartmentName(row.origin_code)}</TableCell>
                    <TableCell>
                      {getDepartmentName(row.destination_code)}
                    </TableCell>
                    <TableCell>{row.attention_person || "-"}</TableCell>
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
        />
      </Paper>
    </Box>
  );
};
