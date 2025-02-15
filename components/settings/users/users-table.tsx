"use client";

import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { Pencil as EditIcon, Trash as TrashIcon } from "lucide-react";
import { getCookie } from "@/lib/cookies";

interface UsersTableProps {
  data: User[];
  loading: boolean;
  totalRows: number;
  perPage: number;
  setPerPage: (perPage: number) => void;
  fetchUsers: (page: number) => Promise<void>;
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

  const columns = [
    {
      name: "#",
      selector: (row: User, index: number = 0) => index + 1,
      width: "70px",
      alignRight: true,
    },
    {
      name: "Name",
      selector: (row: User) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: User) => row.email,
      sortable: true,
    },
    {
      name: "NIK",
      selector: (row: User) => row.nik,
      sortable: true,
    },
    {
      name: "Project",
      selector: (row: User) => row.project,
      sortable: true,
    },
    {
      name: "Role",
      selector: (row: User) => row.roles?.join(", ") ?? "N/A",
      sortable: true,
      cell: (row: User) => (
        <span className="capitalize">{row.roles?.join(", ") ?? "N/A"}</span>
      ),
    },
    {
      name: "Actions",
      cell: (row: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row)}
            className="p-2 text-blue-600 hover:text-blue-800"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(row)}
            className="p-2 text-red-600 hover:text-red-800"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
      alignRight: true,
    },
  ];

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    fetchUsers(page);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      progressPending={loading}
      pagination
      paginationServer
      paginationTotalRows={totalRows}
      onChangeRowsPerPage={handlePerRowsChange}
      onChangePage={handlePageChange}
      customStyles={customStyles}
    />
  );
}
