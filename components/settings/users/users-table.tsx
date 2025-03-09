"use client";

import { useState } from "react";
import { User } from "@/types/user";
import { getCookie } from "@/lib/cookies";

// Material UI imports
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppTheme } from "@/components/theme/ThemeProvider";

interface UsersTableProps {
  data: User[];
  loading: boolean;
  totalRows: number;
  perPage: number;
  setPerPage: (perPage: number) => void;
  fetchUsers: () => Promise<void>;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersTable({
  data,
  loading,
  totalRows,
  perPage,
  setPerPage,
  fetchUsers,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const { mode } = useAppTheme();
  const [page, setPage] = useState(0);

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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-"; // Invalid date

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  // Get current page of data
  const getCurrentPageData = () => {
    const startIndex = page * perPage;
    const endIndex = startIndex + perPage;
    return data.slice(startIndex, endIndex);
  };

  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Project / Department</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              getCurrentPageData().map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box>
                      {user.project && (
                        <Typography variant="body2">{user.project}</Typography>
                      )}
                      {user.department && (
                        <Typography variant="caption" color="text.secondary">
                          {typeof user.department === "string"
                            ? user.department
                            : user.department.name}
                        </Typography>
                      )}
                      {!user.project && !user.department && "-"}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <Chip
                            key={index}
                            label={role}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No roles
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit user">
                      <IconButton
                        aria-label="edit"
                        onClick={() => onEdit(user)}
                        size="small"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete user">
                      <IconButton
                        aria-label="delete"
                        onClick={() => onDelete(user)}
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
    </>
  );
}
