"use client";

import DataTable from "react-data-table-component";
import { AdditionalDocument } from "@/types/additional-document";
import { Eye as ViewIcon, Pencil as EditIcon } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookies";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface SearchParams {
  page?: number;
  per_page?: number;
  document_number?: string;
  type_id?: string;
  po_no?: string;
  date_from?: string;
  date_to?: string;
}

interface DocumentType {
  id: number;
  type_name: string;
}

export const AddocTable = () => {
  const [data, setData] = useState<AdditionalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    lastPage: 1,
    links: [],
    from: 0,
    to: 0,
  });
  const [searchValues, setSearchValues] = useState<SearchParams>({
    document_number: "",
    type_id: "all",
    po_no: "",
    date_from: "",
    date_to: "",
  });
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
      name: "Document Number",
      selector: (row: AdditionalDocument) => row.document_number,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row: AdditionalDocument) =>
        row.type.name || `Type ${row.type.id}`,
      sortable: true,
    },
    {
      name: "Document Date",
      cell: (row: AdditionalDocument) =>
        format(new Date(row.document_date), "dd MMM yyyy"),
      sortable: true,
    },
    {
      name: "Receive Date",
      cell: (row: AdditionalDocument) =>
        row.receive_date
          ? format(new Date(row.receive_date), "dd MMM yyyy")
          : "-",
      sortable: true,
    },
    {
      name: "PO Number",
      selector: (row: AdditionalDocument) => row.po_no || "-",
      sortable: true,
    },
    {
      name: "Location",
      selector: (row: AdditionalDocument) => row.cur_loc || "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: AdditionalDocument) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "open"
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
      name: "Invoice",
      selector: (row: AdditionalDocument) => row.invoice.invoice_number || "-",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: AdditionalDocument) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(row.attachment || "#", "_blank")}
            className="h-8 w-8 text-green-600 hover:text-green-800"
          >
            <ViewIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(`/documents/additional-documents/edit/${row.id}`)
            }
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

  const fetchDocuments = async (params: SearchParams = {}) => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value && !(key === "type_id" && value === "all")) {
          queryParams.append(key, value.toString());
        }
      });

      if (!params.per_page) {
        queryParams.append("per_page", perPage.toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/search?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch documents");

      const result = await response.json();
      setData(result.data);
      setTotalRows(result.meta.total);
      setCurrentPage(result.meta.current_page);
      setPaginationData({
        lastPage: result.meta.last_page,
        links: result.meta.links,
        from: result.meta.from,
        to: result.meta.to,
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/document-types/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch document types");
      const result = await response.json();
      setDocumentTypes(result.data || []);
    } catch (error) {
      console.error("Error fetching document types:", error);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const handlePageChange = (page: number) => {
    fetchDocuments({ ...searchValues, page });
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    if (!isInitialLoad) {
      fetchDocuments({ ...searchValues, per_page: newPerPage, page });
    }
  };

  const handleSearch = () => {
    setIsInitialLoad(false);
    fetchDocuments({ ...searchValues, page: 1 });
  };

  const handleReset = () => {
    setSearchValues({
      document_number: "",
      type_id: "all",
      po_no: "",
      date_from: "",
      date_to: "",
    });
    setIsInitialLoad(true);
    setData([]);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Number</label>
            <Input
              placeholder="Search document number..."
              value={searchValues.document_number}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  document_number: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <Select
              value={searchValues.type_id}
              onValueChange={(value) =>
                setSearchValues((prev) => ({ ...prev, type_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PO Number</label>
            <Input
              placeholder="Search PO number..."
              value={searchValues.po_no}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  po_no: e.target.value,
                }))
              }
            />
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
          data={isInitialLoad ? [] : data}
          progressPending={loading}
          customStyles={customStyles}
          pagination={false}
        />
        {!isInitialLoad && (
          <Pagination
            currentPage={currentPage}
            lastPage={paginationData.lastPage}
            links={paginationData.links}
            onPageChange={handlePageChange}
            perPage={perPage}
            total={totalRows}
            from={paginationData.from}
            to={paginationData.to}
          />
        )}
      </div>
    </div>
  );
};
