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
import { Search } from "lucide-react";

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
  type_id: number;
  document_number: string;
  document_date: string;
  po_no: string | null;
  remarks: string | null;
  status: string;
  cur_loc: string;
  ito_creator: string;
  grpo_no: string | null;
  origin_wh: string;
  destination_wh: string;
}

// Add interface for API response
interface LpdCreateResponse {
  success: boolean;
  message: string;
  data: {
    nomor: string;
    date: string;
    origin_code: string;
    destination_code: string;
    attention_person: string;
    notes: string;
    status: string;
    created_by: number;
    updated_at: string;
    created_at: string;
    id: number;
    additional_documents: Array<any>; // You can type this more specifically if needed
  };
}

const formSchema = z.object({
  document_number: z.string().min(1, "Document number is required"),
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingDocNum, setIsLoadingDocNum] = useState(false);
  const [filterText, setFilterText] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      document_number: "",
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
        fetchAdditionalDocuments();
        generateDocumentNumber(locationCode);
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

  const fetchAdditionalDocuments = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpds/ready-to-send`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response not OK:", response.status, errorText);
        throw new Error("Failed to fetch additional documents");
      }

      const result = await response.json();
      setAdditionalDocuments(result.data);
    } catch (error) {
      console.error("Error fetching additional documents:", error);
      showToast.error({ message: "Failed to load additional documents" });
    } finally {
      setLoading(false);
    }
  };

  const generateDocumentNumber = async (deptCode: string) => {
    try {
      setIsLoadingDocNum(true);
      const token = getCookie("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/generate-docnum?doc_type=LPD&dept_code=${encodeURIComponent(
          deptCode
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to generate document number");

      const result = await response.json();
      form.setValue("document_number", result.document_number);
    } catch (error) {
      console.error("Error generating document number:", error);
      showToast.error({ message: "Failed to generate document number" });
    } finally {
      setIsLoadingDocNum(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const token = getCookie("token");

      // Transform the form data to match backend requirements
      const payload = {
        date: values.date,
        origin_code: values.origin_department,
        destination_code: values.destination_department,
        attention_person: values.attention_person || "",
        notes: values.notes || "",
        additional_documents: selectedDocuments,
      };

      console.log("Submitting payload:", payload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpds`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to create LPD");

      const result: LpdCreateResponse = await response.json();

      // Show success message with the document number
      showToast.success({
        message: `LPD created successfully. Document number: ${result.data.nomor}`,
      });

      // Reset form except for origin_department
      form.reset({
        document_number: "",
        date: "",
        origin_department: userLocationCode,
        destination_department: "",
        attention_person: "",
        notes: "",
        additional_documents: [],
      });

      // Reset selected documents
      setSelectedDocuments([]);

      // Generate new document number
      await generateDocumentNumber(userLocationCode);

      // Refresh the table data
      await fetchAdditionalDocuments();

      // Clear search/filter if any
      setFilterText("");
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    console.log("Search term changed to:", value);

    if (value.length >= 3) {
      console.log("Search term is 3+ characters, triggering search");
      fetchAdditionalDocuments();
    } else if (value === "") {
      console.log("Search term cleared, resetting to default data");
      fetchAdditionalDocuments();
    } else {
      console.log("Search term too short, not triggering search yet");
    }
  };

  const handlePageChange = (page: number) => {
    fetchAdditionalDocuments();
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    fetchAdditionalDocuments();
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

  const filteredItems = additionalDocuments.filter(
    (item) =>
      (item.document_number &&
        item.document_number
          .toLowerCase()
          .includes(filterText.toLowerCase())) ||
      (item.po_no &&
        item.po_no.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.remarks &&
        item.remarks.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.destination_wh &&
        item.destination_wh.toLowerCase().includes(filterText.toLowerCase()))
  );

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
      width: "60px",
    },
    {
      name: "Document No",
      selector: (row: AdditionalDocument) => row.document_number,
      sortable: true,
      cell: (row: AdditionalDocument) => (
        <span className="text-xs">{row.document_number}</span>
      ),
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
      name: "To",
      selector: (row: AdditionalDocument) => row.destination_wh,
      sortable: true,
    },
    {
      name: "Remarks",
      selector: (row: AdditionalDocument) => row.remarks || "-",
      sortable: true,
      wrap: true,
    },
  ];

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} disabled />
                      {isLoadingDocNum && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search document number, PO number, remarks..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
              {filterText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterText("")}
                >
                  Clear
                </Button>
              )}
            </div>

            <DataTable
              columns={columns}
              data={filteredItems}
              customStyles={customStyles}
              pagination
              progressPending={loading}
              selectableRows={false}
              dense
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating LPD...
              </>
            ) : (
              "Create LPD"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
