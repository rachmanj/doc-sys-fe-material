"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InvoiceTypeDialog from "@/components/master/invoice-types/invtype-dialog";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import { InvoiceType } from "@/types/invoice-type";
import Swal from "sweetalert2";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export default function InvoiceTypesPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const { mode } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceTypes, setInvoiceTypes] = useState<InvoiceType[]>([]);
  const [filteredInvoiceTypes, setFilteredInvoiceTypes] = useState<
    InvoiceType[]
  >([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<
    InvoiceType | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInvoiceTypes = async () => {
    try {
      setIsLoading(true);
      const token = getCookie("token");

      // Create query params for search
      const queryParams = new URLSearchParams();
      queryParams.append("per_page", "100");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/invoice-types/search?${queryParams}`,
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
      setInvoiceTypes(result.data.data);
      setFilteredInvoiceTypes(result.data.data);
      setTotalRows(result.data.data.length);
    } catch (error) {
      console.error("Error fetching invoice types:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch invoice types",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceTypes();
  }, []);

  // Filter invoice types when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInvoiceTypes(invoiceTypes);
      setTotalRows(invoiceTypes.length);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = invoiceTypes.filter((invoiceType) =>
        invoiceType.type_name.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredInvoiceTypes(filtered);
      setTotalRows(filtered.length);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchQuery, invoiceTypes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleEdit = (invoiceType: InvoiceType) => {
    setSelectedInvoiceType(invoiceType);
    setDialogOpen(true);
  };

  const handleDelete = async (invoiceType: InvoiceType) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = getCookie("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/invoice-types/${invoiceType.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          Swal.fire("Deleted!", "Invoice type has been deleted.", "success");
          fetchInvoiceTypes();
        } else {
          throw new Error("Failed to delete invoice type");
        }
      } catch (error) {
        console.error("Error deleting invoice type:", error);
        Swal.fire("Error!", "Failed to delete invoice type.", "error");
      }
    }
  };

  const handleSave = (savedInvoiceType: InvoiceType) => {
    fetchInvoiceTypes(); // Refresh data to ensure consistency
  };

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current page of data
  const getCurrentPageData = () => {
    const startIndex = page * perPage;
    const endIndex = startIndex + perPage;
    return filteredInvoiceTypes.slice(startIndex, endIndex);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Invoice Types
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage invoice types
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search invoice types..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: "300px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                    aria-label="clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedInvoiceType(undefined);
              setDialogOpen(true);
            }}
          >
            Add Invoice Type
          </Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="invoice types table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow key="loading-row">
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredInvoiceTypes.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No invoice types found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((invoiceType) => (
                  <TableRow key={invoiceType.id} hover>
                    <TableCell>{invoiceType.id}</TableCell>
                    <TableCell>{invoiceType.type_name}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit invoice type">
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleEdit(invoiceType)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete invoice type">
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(invoiceType)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
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
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={perPage}
          onRowsPerPageChange={handlePerRowsChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <InvoiceTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoiceType={selectedInvoiceType}
        onSave={handleSave}
        refreshData={fetchInvoiceTypes}
      />
    </Box>
  );
}
