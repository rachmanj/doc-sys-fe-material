"use client";

import DataTable from "react-data-table-component";
import { InvoiceType } from "@/types/invoice-type";
import { Pencil as EditIcon, Trash as TrashIcon } from "lucide-react";
import Pagination from "@/components/ui/pagination";

interface SearchParams {
  page?: number;
  per_page?: number;
  type_name?: string;
}

interface InvoiceTypeTableProps {
  data: InvoiceType[];
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
  fetchInvoiceTypes: (params: SearchParams) => Promise<void>;
  onEdit: (invoiceType: InvoiceType) => void;
  onDelete: (invoiceType: InvoiceType) => void;
  searchParams: SearchParams;
}

export default function InvoiceTypeTable({
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
  fetchInvoiceTypes,
  onEdit,
  onDelete,
  searchParams,
}: InvoiceTypeTableProps) {
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
      cell: (row: InvoiceType, index: number) =>
        (currentPage - 1) * perPage + index + 1,
      width: "70px",
      sortable: true,
    },
    {
      name: "Type Name",
      selector: (row: InvoiceType) => row.type_name,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: InvoiceType) => (
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
    fetchInvoiceTypes({ ...searchParams, page });
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    fetchInvoiceTypes({ ...searchParams, per_page: newPerPage, page });
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
