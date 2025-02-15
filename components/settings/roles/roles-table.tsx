"use client";

import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { RoleDialog } from "./role-dialog";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import { getCookie } from "@/lib/cookies";
import { PageTitle } from "@/components/ui/page-title";

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
  const [roles, setRoles] = useState<Role[]>([]);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRoles = async (page: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data: PaginatedResponse = await response.json();
      setRoles(data.data);
      setTotalRows(data.total);
      setCurrentPage(data.current_page);
    } catch (error) {
      Swal.fire("Error!", "Failed to fetch roles.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }
        );

        if (response.ok) {
          await fetchRoles(currentPage);
          Swal.fire("Deleted!", "Role has been deleted.", "success");
        }
      } catch (error) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  const columns = [
    {
      name: "#",
      cell: (row: Role, index: number) =>
        (currentPage - 1) * perPage + index + 1,
      width: "70px",
    },
    {
      name: "Name",
      selector: (row: Role) => row.name,
      sortable: true,
    },
    {
      name: "Guard Name",
      selector: (row: Role) => row.guard_name,
      sortable: true,
    },
    {
      name: "Permissions",
      cell: (row: Role) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions.map((permission) => (
            <Badge key={permission.id} variant="success">
              {permission.name}
            </Badge>
          ))}
        </div>
      ),
      grow: 2,
    },
    {
      name: "Actions",
      cell: (row: Role) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingRole(row);
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
      width: "120px",
    },
  ];

  const handlePageChange = (page: number) => {
    fetchRoles(page);
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    fetchRoles(page);
  };

  useEffect(() => {
    fetchRoles(1);
  }, []);

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f9fafb",
        borderTopWidth: "1px",
        borderTopColor: "#e5e7eb",
      },
    },
    headCells: {
      style: {
        fontSize: "0.875rem",
        fontWeight: "600",
        color: "#374151",
        paddingLeft: "1rem",
        paddingRight: "1rem",
      },
    },
    rows: {
      style: {
        fontSize: "0.875rem",
        color: "#374151",
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f9fafb",
      },
    },
    cells: {
      style: {
        paddingLeft: "1rem",
        paddingRight: "1rem",
      },
    },
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Role
      </Button>

      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={roles}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
          customStyles={customStyles}
        />
      </div>
      <RoleDialog
        open={open}
        setOpen={setOpen}
        role={editingRole}
        onClose={() => {
          setEditingRole(null);
          setOpen(false);
        }}
        onSuccess={async () => {
          await fetchRoles(currentPage);
          setEditingRole(null);
          setOpen(false);
        }}
      />
    </>
  );
}
