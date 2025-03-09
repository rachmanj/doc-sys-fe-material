"use client";

import { useState } from "react";
import { Invoice } from "@/types/invoice";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
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

interface SearchParams {
  page?: number;
  per_page?: number;
  invoice_number?: string;
  supplier_name?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

interface InvoiceListProps {
  data: Invoice[];
  loading: boolean;
  totalRows: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  paginationLinks: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  from: number;
  to: number;
  setPerPage: (perPage: number) => void;
  fetchInvoices: (params?: SearchParams) => Promise<void>;
  onSearch: (params: SearchParams) => void;
  searchParams: SearchParams;
}

export default function InvoiceList({
  data,
  loading,
  totalRows,
  perPage,
  currentPage,
  lastPage,
  paginationLinks,
  from,
  to,
  setPerPage,
  fetchInvoices,
  onSearch,
  searchParams,
}: InvoiceListProps) {
  const router = useRouter();
  const { mode } = useAppTheme();
  const [searchValues, setSearchValues] = useState<SearchParams>({
    invoice_number: "",
    supplier_name: "",
    status: "",
    date_from: "",
    date_to: "",
  });
  const [page, setPage] = useState(currentPage - 1);

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
    fetchInvoices({ ...searchParams, page: newPage + 1 });
  };

  const handlePerRowsChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newPerPage = parseInt(event.target.value, 10);
    setPerPage(newPerPage);
    setPage(0);
    fetchInvoices({ ...searchParams, per_page: newPerPage, page: 1 });
  };

  const handleSearch = () => {
    onSearch(searchValues);
  };

  const handleReset = () => {
    setSearchValues({
      invoice_number: "",
      supplier_name: "",
      status: "",
      date_from: "",
      date_to: "",
    });
    onSearch({});
  };

  const handleEdit = (invoiceId: number) => {
    router.push(`/documents/invoices/edit/${invoiceId}`);
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case "open":
        return { color: "primary", variant: "outlined" };
      case "processing":
        return { color: "warning", variant: "outlined" };
      case "completed":
        return { color: "success", variant: "outlined" };
      default:
        return { color: "default", variant: "outlined" };
    }
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Invoice Number"
              placeholder="Search invoice number..."
              size="small"
              value={searchValues.invoice_number}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  invoice_number: e.target.value,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Supplier Name"
              placeholder="Search supplier..."
              size="small"
              value={searchValues.supplier_name}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  supplier_name: e.target.value,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                label="Status"
                value={searchValues.status}
                onChange={(e) =>
                  setSearchValues((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Date From"
              type="date"
              size="small"
              value={searchValues.date_from}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  date_from: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Date To"
              type="date"
              size="small"
              value={searchValues.date_to}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  date_to: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Search"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="invoices table">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow key="loading-row">
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">No invoices found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((invoice, index) => {
                  const statusChip = getStatusChipColor(invoice.status);
                  return (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        {(currentPage - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.supplier?.name || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>{invoice.invoice_project || "-"}</TableCell>
                      <TableCell>{`${invoice.currency} ${invoice.amount}`}</TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          color={statusChip.color as any}
                          variant={statusChip.variant as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Tooltip title="View invoice">
                            <IconButton
                              aria-label="view"
                              size="small"
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit invoice">
                            <IconButton
                              aria-label="edit"
                              onClick={() => handleEdit(invoice.id)}
                              size="small"
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={perPage}
          onRowsPerPageChange={handlePerRowsChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}
