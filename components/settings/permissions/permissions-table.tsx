"use client";

import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { PermissionDialog } from "./permission-dialog";
import Swal from "sweetalert2";
import { getCookie } from "@/lib/cookies";
import { PageTitle } from "@/components/ui/page-title";

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
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [open, setOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPermissions = async (page: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/permissions?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data: PaginatedResponse = await response.json();
      setPermissions(data.data);
      setTotalRows(data.total);
      setCurrentPage(data.current_page);
    } catch (error) {
      Swal.fire("Error!", "Failed to fetch permissions.", "error");
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/permissions/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }
        );

        if (response.ok) {
          await fetchPermissions(1);
          Swal.fire("Deleted!", "Permission has been deleted.", "success");
        }
      } catch (error) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  const columns = [
    {
      name: "#",
      cell: (row: Permission, index: number) =>
        (currentPage - 1) * perPage + index + 1,
      width: "70px",
    },
    {
      name: "Name",
      selector: (row: Permission) => row.name,
      sortable: true,
    },
    {
      name: "Guard Name",
      selector: (row: Permission) => row.guard_name,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Permission) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingPermission(row);
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
    fetchPermissions(page);
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    fetchPermissions(page);
  };

  useEffect(() => {
    fetchPermissions(1);
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
      <PageTitle title="Permissions" subtitle="Manage system permissions">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Permission
        </Button>
      </PageTitle>

      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={permissions}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
          customStyles={customStyles}
        />
      </div>
      <PermissionDialog
        open={open}
        setOpen={setOpen}
        permission={editingPermission}
        onClose={() => {
          setEditingPermission(null);
          setOpen(false);
        }}
        onSuccess={async () => {
          await fetchPermissions(1);
          setEditingPermission(null);
          setOpen(false);
        }}
      />
    </>
  );
}
