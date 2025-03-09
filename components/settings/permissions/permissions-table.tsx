"use client";

import { useEffect, useState } from "react";
import { PermissionDialog } from "./permission-dialog";
import Swal from "sweetalert2";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

interface Permission {
  id: string;
  name: string;
  guard_name: string;
}

interface PaginatedResponse {
  data: Permission[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export function PermissionsTable() {
  const { mode } = useAppTheme();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    []
  );
  const [open, setOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPermissions = async () => {
    try {
      const response = await fetch(
        getApiEndpoint(`/api/permissions?per_page=100`), // Get more permissions at once for client-side filtering
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }

      const data: PaginatedResponse = await response.json();
      setPermissions(data.data);
      setFilteredPermissions(data.data);
      setTotalRows(data.data.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Filter permissions when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPermissions(permissions);
      setTotalRows(permissions.length);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = permissions.filter(
        (permission) =>
          permission.name.toLowerCase().includes(lowercaseQuery) ||
          permission.guard_name.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredPermissions(filtered);
      setTotalRows(filtered.length);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchQuery, permissions]);

  const handleDelete = async (id: string) => {
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
        const response = await fetch(getApiEndpoint(`/api/permissions/${id}`), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete permission");
        }

        Swal.fire("Deleted!", "Permission has been deleted.", "success");
        fetchPermissions();
      } catch (error) {
        console.error("Error deleting permission:", error);
        Swal.fire("Error!", "Failed to delete permission.", "error");
      }
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setOpen(true);
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
    return filteredPermissions.slice(startIndex, endIndex);
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          placeholder="Search permissions..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: "300px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingPermission(null);
            setOpen(true);
          }}
        >
          Add Permission
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="permissions table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Guard</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredPermissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No permissions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((permission) => (
                  <TableRow key={permission.id} hover>
                    <TableCell>
                      <Typography variant="body1">{permission.name}</Typography>
                    </TableCell>
                    <TableCell>{permission.guard_name}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit permission">
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleEdit(permission)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete permission">
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(permission.id)}
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

      <PermissionDialog
        open={open}
        onOpenChange={setOpen}
        permission={editingPermission}
        onSuccess={() => {
          fetchPermissions();
          setOpen(false);
          setEditingPermission(null);
        }}
      />
    </>
  );
}
