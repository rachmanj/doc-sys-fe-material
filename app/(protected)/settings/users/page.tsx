"use client";

import { useState, useEffect } from "react";
import UsersTable from "@/components/settings/users/users-table";
import UserDialog from "@/components/settings/users/user-dialog";
import { User } from "@/types/user";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import Swal from "sweetalert2";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import { useAppTheme } from "@/components/theme/ThemeProvider";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

export default function UsersPage() {
  const { mode } = useAppTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [data, setData] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getCookie("token");
      const response = await fetch(
        getApiEndpoint(`/api/users?per_page=100`), // Get more users at once for client-side filtering
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        setData(result.data);
        setFilteredData(result.data);
        setTotalRows(result.data.length);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(data);
      setTotalRows(data.length);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = data.filter(
        (user) =>
          user.name.toLowerCase().includes(lowercaseQuery) ||
          user.username.toLowerCase().includes(lowercaseQuery) ||
          user.email.toLowerCase().includes(lowercaseQuery) ||
          user.project.toLowerCase().includes(lowercaseQuery) ||
          (user.department &&
            (typeof user.department === "string"
              ? user.department.toLowerCase().includes(lowercaseQuery)
              : user.department &&
                "name" in user.department &&
                user.department.name.toLowerCase().includes(lowercaseQuery)))
      );
      setFilteredData(filtered);
      setTotalRows(filtered.length);
    }
  }, [searchQuery, data]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = getCookie("token");
        const response = await fetch(getApiEndpoint(`/api/users/${user.id}`), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await response.json();
        if (data.status === "success") {
          Swal.fire("Deleted!", "User has been deleted.", "success");
          fetchUsers();
        }
      } catch (error) {
        Swal.fire("Error!", "Failed to delete user.", "error");
      }
    }
  };

  const handleSave = async (userData: Partial<User>) => {
    // Implement save functionality
    setIsDialogOpen(false);
    setSelectedUser(undefined);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Users
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage system users
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Add User
        </Button>
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
        }}
      >
        <TextField
          placeholder="Search users..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {loading && data.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <UsersTable
            data={filteredData}
            loading={loading}
            totalRows={totalRows}
            perPage={perPage}
            setPerPage={setPerPage}
            fetchUsers={fetchUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Paper>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedUser(undefined);
        }}
        user={selectedUser}
        onSave={handleSave}
        refreshData={() => fetchUsers()}
      />
    </Box>
  );
}
