"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DepartmentDialog from "@/components/master/departments/department-dialog";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import { Department } from "@/types/department";
import Swal from "sweetalert2";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
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

interface SearchParams {
  code?: string;
  name?: string;
}

export default function DepartmentsPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const { mode } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    []
  );
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | undefined
  >();
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const token = getCookie("token");

      // Create query params for search
      const queryParams = new URLSearchParams();
      queryParams.append("per_page", "100");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments/search?${queryParams}`,
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
      setDepartments(result.data.data);
      setFilteredDepartments(result.data.data);
      setTotalRows(result.data.data.length);
    } catch (error) {
      console.error("Error fetching departments:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch departments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter departments when search params change
  useEffect(() => {
    let filtered = [...departments];

    // Apply filters based on searchParams
    if (searchParams.code) {
      filtered = filtered.filter(
        (department) =>
          department.sap_code
            ?.toLowerCase()
            .includes(searchParams.code!.toLowerCase()) ||
          department.akronim
            .toLowerCase()
            .includes(searchParams.code!.toLowerCase())
      );
    }

    if (searchParams.name) {
      filtered = filtered.filter((department) =>
        department.name.toLowerCase().includes(searchParams.name!.toLowerCase())
      );
    }

    setFilteredDepartments(filtered);
    setTotalRows(filtered.length);
    setPage(0); // Reset to first page when filtering
  }, [searchParams, departments]);

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

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setDialogOpen(true);
  };

  const handleDelete = async (department: Department) => {
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments/${department.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          Swal.fire("Deleted!", "Department has been deleted.", "success");
          fetchDepartments();
        } else {
          throw new Error("Failed to delete department");
        }
      } catch (error) {
        console.error("Error deleting department:", error);
        Swal.fire("Error!", "Failed to delete department.", "error");
      }
    }
  };

  const handleSave = (savedDepartment: Department) => {
    fetchDepartments(); // Refresh data to ensure consistency
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
    return filteredDepartments.slice(startIndex, endIndex);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Departments
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage system departments
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Code/Acronym"
              name="code"
              value={searchParams.code || ""}
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
          <Grid item xs={12} sm={6}>
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
              setSelectedDepartment(undefined);
              setDialogOpen(true);
            }}
          >
            Add Department
          </Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="departments table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Acronym</TableCell>
                <TableCell>SAP Code</TableCell>
                <TableCell>Location Code</TableCell>
                <TableCell>Transit Code</TableCell>
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
              ) : filteredDepartments.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No departments found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((department) => (
                  <TableRow key={department.id} hover>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.project}</TableCell>
                    <TableCell>{department.akronim}</TableCell>
                    <TableCell>{department.sap_code || "-"}</TableCell>
                    <TableCell>{department.location_code || "-"}</TableCell>
                    <TableCell>{department.transit_code || "-"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit department">
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleEdit(department)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete department">
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(department)}
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

      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={selectedDepartment}
        onSave={handleSave}
        refreshData={fetchDepartments}
      />
    </Box>
  );
}
