"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddocTypeDialog from "@/components/master/addoc-types/addoctype-dialog";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import { AddocType } from "@/types/addoc-type";
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
import Grid from "@mui/material/Grid";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface SearchParams {
  type_name?: string;
}

export default function AddocTypesPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const { mode } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [addocTypes, setAddocTypes] = useState<AddocType[]>([]);
  const [filteredAddocTypes, setFilteredAddocTypes] = useState<AddocType[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAddocType, setSelectedAddocType] = useState<
    AddocType | undefined
  >();
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchAddocTypes = async () => {
    try {
      setIsLoading(true);
      const token = getCookie("token");

      // Create query params for search
      const queryParams = new URLSearchParams();
      queryParams.append("per_page", "100");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/document-types/search?${queryParams}`,
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
      setAddocTypes(result.data.data);
      setFilteredAddocTypes(result.data.data);
      setTotalRows(result.data.data.length);
    } catch (error) {
      console.error("Error fetching additional document types:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch additional document types",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddocTypes();
  }, []);

  // Filter addoc types when search params change
  useEffect(() => {
    let filtered = [...addocTypes];

    // Apply filters based on searchParams
    if (searchParams.type_name) {
      filtered = filtered.filter((addocType) =>
        addocType.type_name
          .toLowerCase()
          .includes(searchParams.type_name!.toLowerCase())
      );
    }

    setFilteredAddocTypes(filtered);
    setTotalRows(filtered.length);
    setPage(0); // Reset to first page when filtering
  }, [searchParams, addocTypes]);

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

  const handleEdit = (addocType: AddocType) => {
    setSelectedAddocType(addocType);
    setDialogOpen(true);
  };

  const handleDelete = async (addocType: AddocType) => {
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/document-types/${addocType.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          Swal.fire(
            "Deleted!",
            "Additional document type has been deleted.",
            "success"
          );
          fetchAddocTypes();
        } else {
          throw new Error("Failed to delete additional document type");
        }
      } catch (error) {
        console.error("Error deleting additional document type:", error);
        Swal.fire(
          "Error!",
          "Failed to delete additional document type.",
          "error"
        );
      }
    }
  };

  const handleSave = (savedAddocType: AddocType) => {
    fetchAddocTypes(); // Refresh data to ensure consistency
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
    return filteredAddocTypes.slice(startIndex, endIndex);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Additional Document Types
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage additional document types
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Type Name"
              name="type_name"
              value={searchParams.type_name || ""}
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
              setSelectedAddocType(undefined);
              setDialogOpen(true);
            }}
          >
            Add Document Type
          </Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 650 }}
            aria-label="additional document types table"
          >
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type Name</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow key="loading-row">
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredAddocTypes.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No additional document types found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((addocType) => (
                  <TableRow key={addocType.id} hover>
                    <TableCell>{addocType.id}</TableCell>
                    <TableCell>{addocType.type_name}</TableCell>
                    <TableCell>{addocType.created_by}</TableCell>
                    <TableCell>
                      {addocType.created_at
                        ? new Date(addocType.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit document type">
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleEdit(addocType)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete document type">
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(addocType)}
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

      <AddocTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        addocType={selectedAddocType}
        onSave={handleSave}
        refreshData={fetchAddocTypes}
      />
    </Box>
  );
}
