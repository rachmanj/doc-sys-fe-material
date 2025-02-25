"use client";

import DataTable from "react-data-table-component";
import { Eye as ViewIcon, Pencil as EditIcon } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { getCookie } from "@/lib/cookies";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface LPD {
  id: number;
  date: string;
  origin_department: {
    id: number;
    name: string;
  };
  destination_department: {
    id: number;
    name: string;
  };
  attention_person: string;
  notes: string;
  status: string;
  additional_documents: any[];
}

interface SearchParams {
  page?: number;
  per_page?: number;
  date_from?: string;
  date_to?: string;
  origin_department?: string;
  destination_department?: string;
  status?: string;
}

export const LpdTable = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LPD[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

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
      cell: (_: any, index: number) => (currentPage - 1) * perPage + index + 1,
      width: "70px",
      sortable: true,
    },
    {
      name: "Date",
      cell: (row: LPD) => format(new Date(row.date), "dd MMM yyyy"),
      sortable: true,
    },
    {
      name: "Origin Department",
      selector: (row: LPD) => row.origin_department.name,
      sortable: true,
    },
    {
      name: "Destination Department",
      selector: (row: LPD) => row.destination_department.name,
      sortable: true,
    },
    {
      name: "Attention Person",
      selector: (row: LPD) => row.attention_person || "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: LPD) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: LPD) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              /* View action */
            }}
            className="h-8 w-8 text-green-600 hover:text-green-800"
          >
            <ViewIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              /* Edit action */
            }}
            className="h-8 w-8 text-blue-600 hover:text-blue-800"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
      width: "100px",
      alignRight: true,
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">LPD Number</label>
            <Input placeholder="Search LPD number..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end space-x-2">
            <Button disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
            <Button variant="outline" disabled={loading}>
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
          pagination
          paginationTotalRows={totalRows}
          paginationPerPage={perPage}
          paginationDefaultPage={currentPage}
        />
      </div>
    </div>
  );
};
