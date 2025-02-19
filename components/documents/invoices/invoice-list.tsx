"use client";

import DataTable from "react-data-table-component";
import { Invoice } from "@/types/invoice";
import { Eye as ViewIcon, Pencil } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchParams {
  page?: number;
  per_page?: number;
  invoice_number?: string;
  supplier_name?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

interface InvoiceListProps {
  data: Invoice[];
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
  fetchInvoices: (params?: SearchParams) => Promise<void>;
  onSearch: (params: SearchParams) => void;
  searchParams: SearchParams;
}

export default function InvoiceList({
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
  fetchInvoices,
  onSearch,
  searchParams,
}: InvoiceListProps) {
  const router = useRouter();
  const [searchValues, setSearchValues] = useState<SearchParams>({
    invoice_number: "",
    supplier_name: "",
    status: "",
    date_from: "",
    date_to: "",
  });

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
  };

  const columns = [
    {
      name: "#",
      cell: (row: Invoice, index: number) =>
        (currentPage - 1) * perPage + index + 1,
      width: "70px",
      sortable: true,
    },
    {
      name: "Invoice Number",
      selector: (row: Invoice) => row.invoice_number,
      sortable: true,
    },
    {
      name: "Supplier",
      selector: (row: Invoice) => row.supplier?.name || "-",
      sortable: true,
    },
    {
      name: "Date",
      cell: (row: Invoice) => format(new Date(row.invoice_date), "dd MMM yyyy"),
      sortable: true,
    },
    {
      name: "Project",
      selector: (row: Invoice) => row.invoice_project || "-",
      sortable: true,
    },
    {
      name: "Amount",
      cell: (row: Invoice) => `${row.currency} ${row.amount}`,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: Invoice) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "open"
              ? "bg-blue-100 text-blue-800"
              : row.status === "processing"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Invoice) => (
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:text-blue-800">
            <ViewIcon className="w-5 h-5" />
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.id)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
      width: "100px",
      alignRight: true,
    },
  ];

  const handlePageChange = (page: number) => {
    fetchInvoices({ ...searchParams, page });
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    fetchInvoices({ ...searchParams, per_page: newPerPage, page });
  };

  const handleSearch = () => {
    onSearch(searchValues);
  };

  const handleReset = () => {
    setSearchValues({
      invoice_number: "",
      supplier_name: "",
      status: "",
      date_from: "",
      date_to: "",
    });
    onSearch({});
  };

  const handleEdit = (invoiceId: number) => {
    router.push(`/documents/invoices/edit/${invoiceId}`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Number</label>
            <Input
              placeholder="Search invoice number..."
              value={searchValues.invoice_number}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  invoice_number: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Supplier Name</label>
            <Input
              placeholder="Search supplier..."
              value={searchValues.supplier_name}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  supplier_name: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={searchValues.status}
              onValueChange={(value) =>
                setSearchValues((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date From</label>
            <Input
              type="date"
              value={searchValues.date_from}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  date_from: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date To</label>
            <Input
              type="date"
              value={searchValues.date_to}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  date_to: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex items-end space-x-2">
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

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
    </div>
  );
}
