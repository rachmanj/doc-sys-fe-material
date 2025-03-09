"use client";

import { useEffect, useState } from "react";
import { RoleDialog } from "./role-dialog";
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
import Chip from "@mui/material/Chip";
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

interface Role {
  id: string;
  name: string;
  guard_name: string;
  permissions: Permission[];
}

interface PaginatedResponse {
  data: Role[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export function RolesTable() {
  const { mode } = useAppTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRoles = async () => {
    try {
      const response = await fetch(
        getApiEndpoint(`/api/roles?per_page=100`), // Get more roles at once for client-side filtering
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const data: PaginatedResponse = await response.json();
      setRoles(data.data);
      setFilteredRoles(data.data);
      setTotalRows(data.data.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter roles when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRoles(roles);
      setTotalRows(roles.length);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = roles.filter(
        (role) =>
          role.name.toLowerCase().includes(lowercaseQuery) ||
          role.guard_name.toLowerCase().includes(lowercaseQuery) ||
          role.permissions.some((permission) =>
            permission.name.toLowerCase().includes(lowercaseQuery)
          )
      );
      setFilteredRoles(filtered);
      setTotalRows(filtered.length);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchQuery, roles]);

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
        const response = await fetch(getApiEndpoint(`/api/roles/${id}`), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete role");
        }

        Swal.fire("Deleted!", "Role has been deleted.", "success");
        fetchRoles();
      } catch (error) {
        console.error("Error deleting role:", error);
        Swal.fire("Error!", "Failed to delete role.", "error");
      }
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
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
    return filteredRoles.slice(startIndex, endIndex);
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          placeholder="Search roles..."
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
            setEditingRole(null);
            setOpen(true);
          }}
        >
          Add Role
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="roles table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Guard</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">No roles found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {role.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{role.guard_name}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          maxWidth: "500px",
                        }}
                      >
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map((permission) => (
                            <Chip
                              key={permission.id}
                              label={permission.name}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{ mb: 0.5 }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No permissions
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit role">
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleEdit(role)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete role">
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(role.id)}
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

      <RoleDialog
        open={open}
        onOpenChange={setOpen}
        role={editingRole}
        onSuccess={() => {
          fetchRoles();
          setOpen(false);
          setEditingRole(null);
        }}
      />
    </>
  );
}
