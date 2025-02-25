"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { showToast } from "@/lib/toast";
import { getCookie } from "@/lib/cookies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import DataTable from "react-data-table-component";

interface Department {
  id: number;
  name: string;
}

interface CurrentLocation {
  id: number;
  location_code: string;
}

interface AdditionalDocument {
  id: number;
  document_number: string;
  document_date: string;
  receive_date: string | null;
  po_no: string;
  status: string;
  cur_loc: string;
  type: {
    id: number;
    name: string;
  };
  created_by: {
    id: number;
    name: string;
  };
  invoice: {
    id: number | null;
    invoice_number: string | null;
  };
}

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  origin_department: z.string().min(1, "Origin department is required"),
  destination_department: z
    .string()
    .min(1, "Destination department is required"),
  attention_person: z.string().optional(),
  notes: z.string().optional(),
  additional_documents: z.array(z.string()).optional(),
});

export const LpdCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocations, setCurrentLocations] = useState<CurrentLocation[]>(
    []
  );
  const [additionalDocuments, setAdditionalDocuments] = useState<
    AdditionalDocument[]
  >([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [userLocationCode, setUserLocationCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      origin_department: "",
      destination_department: "",
      attention_person: "",
      notes: "",
      additional_documents: [],
    },
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        const locationCode = userData.location_code;
        console.log("User data:", userData); // Log full user data
        console.log("Location code from user data:", locationCode); // Should show "000H-ACC"

        if (!locationCode) {
          console.error("No location code found in user data");
          return;
        }

        setUserLocationCode(locationCode);
        form.setValue("origin_department", locationCode);
        fetchAdditionalDocuments(locationCode);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    fetchCurrentLocations();
  }, []);

  const fetchCurrentLocations = async () => {
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments/cur-locs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch current locations");
      const result = await response.json();
      setCurrentLocations(result.data);
    } catch (error) {
      console.error("Error fetching current locations:", error);
      showToast.error({ message: "Failed to load current locations" });
    }
  };

  const fetchAdditionalDocuments = async (
    locationCode: string,
    page: number = 1,
    per_page: number = 10
  ) => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const url = `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }/api/documents/additional-documents/search?cur_loc=${encodeURIComponent(
        locationCode
      )}&page=${page}&per_page=${per_page}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response not OK:", response.status, errorText);
        throw new Error("Failed to fetch additional documents");
      }

      const result = await response.json();
      setAdditionalDocuments(result.data);
      setTotalRows(result.meta.total);
      setCurrentPage(result.meta.current_page);
    } catch (error) {
      console.error("Error fetching additional documents:", error);
      showToast.error({ message: "Failed to load additional documents" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpd/store`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) throw new Error("Failed to create LPD");

      showToast.success({ message: "LPD created successfully" });
      form.reset();
    } catch (error) {
      console.error("Error creating LPD:", error);
      showToast.error({ message: "Failed to create LPD" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentSelection = (id: number) => {
    setSelectedDocuments((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((docId) => docId !== id)
        : [...prev, id];

      form.setValue("additional_documents", newSelection.map(String));
      return newSelection;
    });
  };

  const handlePageChange = (page: number) => {
    fetchAdditionalDocuments(userLocationCode, page, perPage);
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    fetchAdditionalDocuments(userLocationCode, page, newPerPage);
  };

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
      name: "Select",
      cell: (row: AdditionalDocument) => (
        <input
          type="checkbox"
          checked={selectedDocuments.includes(row.id)}
          onChange={() => handleDocumentSelection(row.id)}
          className="rounded border-gray-300"
        />
      ),
      width: "80px",
    },
    {
      name: "DocNum",
      selector: (row: AdditionalDocument) => row.document_number,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row: AdditionalDocument) => row.type.name,
      sortable: true,
    },
    {
      name: "Date",
      cell: (row: AdditionalDocument) =>
        format(new Date(row.document_date), "dd MMM yyyy"),
      sortable: true,
    },
    {
      name: "PO Number",
      selector: (row: AdditionalDocument) => row.po_no || "-",
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
  ];

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attention_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attention Person</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter attention person" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="origin_department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin Department</FormLabel>
                  <FormControl>
                    <Input {...field} value={userLocationCode} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination_department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentLocations.map((location, index) => (
                        <SelectItem
                          key={`location-${location.id || index}-${
                            location.location_code
                          }`}
                          value={location.location_code}
                        >
                          {location.location_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="min-h-[100px]"
                    placeholder="Enter notes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Documents</label>
            <DataTable
              columns={columns}
              data={additionalDocuments}
              customStyles={customStyles}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
              progressPending={loading}
              selectableRows={false}
              dense
            />
          </div>

          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create LPD
          </Button>
        </form>
      </Form>
    </Card>
  );
};
