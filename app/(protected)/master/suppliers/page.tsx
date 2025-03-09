"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SupplierDialog from "@/components/master/suppliers/supplier-dialog";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import { Supplier } from "@/types/supplier";
import Swal from "sweetalert2";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
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
import Chip from "@mui/material/Chip";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface SearchParams {
  sap_code?: string;
  name?: string;
  type?: string;
  payment_project?: string;
}

export default function SuppliersPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const { mode } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<
    Supplier | undefined
  >();
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const token = getCookie("token");

      // Create query params for search
      const queryParams = new URLSearchParams();
      queryParams.append("per_page", "100");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/suppliers/search?${queryParams}`,
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
      setSuppliers(result.data.data);
      setFilteredSuppliers(result.data.data);
      setTotalRows(result.data.data.length);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch suppliers",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers when search params change
  useEffect(() => {
    let filtered = [...suppliers];

    // Apply filters based on searchParams
    if (searchParams.sap_code) {
      filtered = filtered.filter((supplier) =>
        supplier.sap_code
          ?.toLowerCase()
          .includes(searchParams.sap_code!.toLowerCase())
      );
    }

    if (searchParams.name) {
      filtered = filtered.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchParams.name!.toLowerCase())
      );
    }

    if (searchParams.type) {
      filtered = filtered.filter(
        (supplier) => supplier.type === searchParams.type
      );
    }

    if (searchParams.payment_project) {
      filtered = filtered.filter((supplier) =>
        supplier.payment_project
          .toLowerCase()
          .includes(searchParams.payment_project!.toLowerCase())
      );
    }

    setFilteredSuppliers(filtered);
    setTotalRows(filtered.length);
    setPage(0); // Reset to first page when filtering
  }, [searchParams, suppliers]);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearSearch = () => {
    setSearchParams({});
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDelete = async (supplier: Supplier) => {
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/suppliers/${supplier.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          Swal.fire("Deleted!", "Supplier has been deleted.", "success");
          fetchSuppliers();
        } else {
          throw new Error("Failed to delete supplier");
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
        Swal.fire("Error!", "Failed to delete supplier.", "error");
      }
    }
  };

  const handleSave = (savedSupplier: Supplier) => {
    fetchSuppliers(); // Refresh data to ensure consistency
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
    return filteredSuppliers.slice(startIndex, endIndex);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Suppliers
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage system suppliers
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="SAP Code"
              name="sap_code"
              value={searchParams.sap_code || ""}
              onChange={handleSearchChange}
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
              fullWidth
              size="small"
              label="Name"
              name="name"
              value={searchParams.name || ""}
              onChange={handleSearchChange}
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
              fullWidth
              select
              size="small"
              label="Type"
              name="type"
              value={searchParams.type || ""}
              onChange={handleSearchChange}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="vendor">Vendor</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Payment Project"
              name="payment_project"
              value={searchParams.payment_project || ""}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          {Object.values(searchParams).some((value) => value) && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearSearch}
              size="small"
            >
              Clear Filters
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedSupplier(undefined);
              setDialogOpen(true);
            }}
          >
            Add Supplier
          </Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="suppliers table">
            <TableHead>
              <TableRow>
                <TableCell>SAP Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Payment Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow key="loading-row">
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">No suppliers found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((supplier) => (
                  <TableRow key={supplier.id} hover>
                    <TableCell>{supplier.sap_code || "-"}</TableCell>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {supplier.type}
                    </TableCell>
                    <TableCell>{supplier.city || "-"}</TableCell>
                    <TableCell>{supplier.payment_project}</TableCell>
                    <TableCell>
                      <Chip
                        label={supplier.is_active ? "Active" : "Inactive"}
                        color={supplier.is_active ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit supplier">
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleEdit(supplier)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete supplier">
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(supplier)}
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

      <SupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={selectedSupplier}
        onSave={handleSave}
        refreshData={fetchSuppliers}
      />
    </Box>
  );
}
