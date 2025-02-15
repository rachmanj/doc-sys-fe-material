"use client";

import DataTable from "react-data-table-component";
import { Supplier } from "@/types/supplier";
import { Pencil as EditIcon, Trash as TrashIcon } from "lucide-react";
import Pagination from "@/components/ui/pagination";

interface SearchParams {
  page?: number;
  per_page?: number;
  sap_code?: string;
  name?: string;
  type?: string;
  payment_project?: string;
}

interface SupplierTableProps {
  data: Supplier[];
  loading: boolean;
  totalRows: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  paginationLinks: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  from: number;
  to: number;
  setPerPage: (perPage: number) => void;
  fetchSuppliers: (params: SearchParams) => Promise<void>;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  searchParams: SearchParams;
}

export default function SupplierTable({
  data,
  loading,
  totalRows,
  perPage,
  currentPage,
  lastPage,
  paginationLinks,
  from,
  to,
  setPerPage,
  fetchSuppliers,
  onEdit,
  onDelete,
  searchParams,
}: SupplierTableProps) {
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
        minHeight: "45px",
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
    pagination: {
      style: {
        borderTopWidth: "1px",
        borderTopColor: "#e5e7eb",
      },
    },
  };

  const columns = [
    {
      name: "#",
      cell: (row: Supplier, index: number) =>
        (currentPage - 1) * perPage + index + 1,
      width: "70px",
      sortable: true,
    },
    {
      name: "SAP Code",
      selector: (row: Supplier) => row.sap_code || "-",
      sortable: true,
    },
    {
      name: "Name",
      selector: (row: Supplier) => row.name,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row: Supplier) => row.type,
      sortable: true,
      cell: (row: Supplier) => <span className="capitalize">{row.type}</span>,
    },
    {
      name: "Payment Project",
      selector: (row: Supplier) => row.payment_project,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: Supplier) => row.is_active,
      sortable: true,
      cell: (row: Supplier) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row: Supplier) => (
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
      width: "120px",
      alignRight: true,
    },
  ];

  const handlePageChange = (page: number) => {
    fetchSuppliers({ ...searchParams, page });
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    fetchSuppliers({ ...searchParams, per_page: newPerPage, page });
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        customStyles={customStyles}
        pagination={false}
      />
      <Pagination
        currentPage={currentPage}
        lastPage={lastPage}
        links={paginationLinks}
        onPageChange={handlePageChange}
        perPage={perPage}
        total={totalRows}
        from={from}
        to={to}
      />
    </div>
  );
}
