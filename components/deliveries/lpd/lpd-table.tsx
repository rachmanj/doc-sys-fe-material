"use client";

import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Eye as ViewIcon, Pencil as EditIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { getCookie } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  nik: string;
  project: string;
}

interface LPD {
  id: number;
  nomor: string;
  date: string;
  origin_code: string;
  destination_code: string;
  attention_person: string;
  created_by: User;
  sent_at: string | null;
  received_at: string | null;
  received_by: User | null;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const LpdTable = () => {
  const [data, setData] = useState<LPD[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpds/data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch LPDs");

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("Error fetching LPDs:", error);
      showToast.error({ message: "Failed to load LPDs" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = data.filter(
    (item) =>
      (item.nomor &&
        item.nomor.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.destination_code &&
        item.destination_code
          .toLowerCase()
          .includes(filterText.toLowerCase())) ||
      (item.attention_person &&
        item.attention_person
          .toLowerCase()
          .includes(filterText.toLowerCase())) ||
      (item.status &&
        item.status.toLowerCase().includes(filterText.toLowerCase()))
  );

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
      name: "LPD Number",
      selector: (row: LPD) => row.nomor,
      sortable: true,
      cell: (row: LPD) => <span className="text-xs">{row.nomor}</span>,
    },
    {
      name: "Date",
      cell: (row: LPD) => format(new Date(row.date), "dd MMM yyyy"),
      sortable: true,
    },
    {
      name: "Destination",
      selector: (row: LPD) => row.destination_code,
      sortable: true,
    },
    {
      name: "Attention",
      selector: (row: LPD) => row.attention_person || "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: LPD) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "draft"
              ? "bg-gray-100 text-gray-800"
              : row.status === "sent"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Created By",
      selector: (row: LPD) => row.created_by.name,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: LPD) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/deliveries/lpd/${row.id}`)}
            className="h-8 w-8 text-blue-600 hover:text-blue-800"
          >
            <ViewIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/deliveries/lpd/edit/${row.id}`)}
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
    <Card className="p-6">
      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        pagination
        progressPending={loading}
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Search..."
            className="w-25 h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        }
      />
    </Card>
  );
};
