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
import { Loader2, Save, Plus, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { showToast } from "@/lib/toast";
import { getCookie } from "@/lib/cookies";
import { format } from "date-fns";
import DataTable from "react-data-table-component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Add UpdateButton component
const UpdateButton = ({
  fieldName,
  isSubmitting,
  onClick,
}: {
  fieldName: string;
  isSubmitting?: boolean;
  onClick: () => void;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    disabled={isSubmitting}
    onClick={onClick}
    className="h-10 w-10 text-blue-600 hover:text-blue-800"
    title={`Update ${fieldName}`}
  >
    {isSubmitting ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Save className="h-4 w-4" />
    )}
  </Button>
);

interface LpdData {
  id: number;
  nomor: string;
  date: string;
  origin_department: string | null;
  destination_department: string | null;
  attention_person: string;
  created_by: string;
  sent_at: string | null;
  received_at: string | null;
  received_by: string | null;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
  additional_document_ids: number[];
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

interface CurrentLocation {
  id: number;
  location_code: string;
}

const formSchema = z.object({
  nomor: z.string().min(1, "Document number is required"),
  date: z.string().min(1, "Date is required"),
  origin_department: z.string().optional(),
  destination_department: z.string().optional(),
  attention_person: z.string().optional(),
  notes: z.string().optional(),
});

interface LpdEditProps {
  lpdId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const LpdEdit = ({ lpdId, onSuccess, onCancel }: LpdEditProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lpdData, setLpdData] = useState<LpdData | null>(null);
  const [additionalDocuments, setAdditionalDocuments] = useState<
    AdditionalDocument[]
  >([]);
  const [currentLocations, setCurrentLocations] = useState<CurrentLocation[]>(
    []
  );
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Add state for field updates
  const [fieldUpdates, setFieldUpdates] = useState<
    Record<string, { isSubmitting: boolean }>
  >({});

  // Add these states
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [showAddDocsModal, setShowAddDocsModal] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<AdditionalDocument[]>([]);
  const [isLoadingAvailableDocs, setIsLoadingAvailableDocs] = useState(false);
  const [filterText, setFilterText] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomor: "",
      date: "",
      origin_department: "",
      destination_department: "",
      attention_person: "",
      notes: "",
    },
  });

  // Fetch LPD data
  useEffect(() => {
    const fetchLpdData = async () => {
      try {
        setIsLoading(true);
        const token = getCookie("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpds/${lpdId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch LPD data");

        const result = await response.json();
        setLpdData(result.data);

        // Format date for form input (YYYY-MM-DD)
        const formattedDate = result.data.date
          ? new Date(result.data.date).toISOString().split("T")[0]
          : "";

        // Set form values
        form.reset({
          nomor: result.data.nomor || "",
          date: formattedDate,
          // Use origin_code if origin_department is null
          origin_department:
            result.data.origin_department || result.data.origin_code || "",
          // Use destination_code if destination_department is null
          destination_department:
            result.data.destination_department ||
            result.data.destination_code ||
            "",
          attention_person: result.data.attention_person || "",
          notes: result.data.notes || "",
        });

        // Fetch additional documents if there are any
        if (result.data.additional_document_ids?.length > 0) {
          fetchAdditionalDocuments(result.data.additional_document_ids);
        }
      } catch (error) {
        console.error("Error fetching LPD data:", error);
        showToast.error({ message: "Failed to load LPD data" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLpdData();
    fetchCurrentLocations();
  }, [lpdId]);

  // Fetch additional documents
  const fetchAdditionalDocuments = async (documentIds: number[]) => {
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/documents/additional-documents/by-ids?ids=${documentIds.join(
          ","
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch additional documents");

      const result = await response.json();
      setAdditionalDocuments(result.data);
      setSelectedDocIds(documentIds); // Set initially selected docs
    } catch (error) {
      console.error("Error fetching additional documents:", error);
      showToast.error({ message: "Failed to load additional documents" });
    }
  };

  // Add function to fetch available documents
  const fetchAvailableDocs = async () => {
    try {
      setIsLoadingAvailableDocs(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpds/ready-to-send`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch available documents");

      const result = await response.json();
      setAvailableDocs(result.data);
    } catch (error) {
      console.error("Error fetching available documents:", error);
      showToast.error({ message: "Failed to load available documents" });
    } finally {
      setIsLoadingAvailableDocs(false);
    }
  };

  // Add function to handle document selection
  const handleDocumentSelect = (docId: number) => {
    setSelectedDocIds((prev) => {
      if (prev.includes(docId)) {
        return prev.filter((id) => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  // Add function to update additional documents
  const updateAdditionalDocuments = async () => {
    try {
      setFieldUpdates((prev) => ({
        ...prev,
        additional_documents: { isSubmitting: true },
      }));

      const token = getCookie("token");
      const payload = {
        additional_document_ids: selectedDocIds,
      };

      // Add console log to show what's being sent
      console.log("Updating additional documents with payload:", payload);
      console.log("Selected document IDs:", selectedDocIds);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpds/${lpdId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      // Log the response status
      console.log("Update response status:", response.status);

      if (!response.ok)
        throw new Error("Failed to update additional documents");

      // Log the response data
      const responseData = await response.json();
      console.log("Update response data:", responseData);

      showToast.success({
        message: "Additional documents updated successfully",
      });

      // Refresh the documents list
      if (selectedDocIds.length > 0) {
        await fetchAdditionalDocuments(selectedDocIds);
      } else {
        setAdditionalDocuments([]);
      }
    } catch (error) {
      console.error("Error updating additional documents:", error);
      showToast.error({ message: "Failed to update additional documents" });
    } finally {
      setFieldUpdates((prev) => ({
        ...prev,
        additional_documents: { isSubmitting: false },
      }));
    }
  };

  // Filter available documents
  const filteredAvailableDocs = availableDocs.filter(
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

  // Add function to handle individual field updates
  const handleFieldUpdate = async (fieldName: string) => {
    try {
      // Update field update state
      setFieldUpdates((prev) => ({
        ...prev,
        [fieldName]: { isSubmitting: true },
      }));

      const token = getCookie("token");
      const value = form.getValues(fieldName as any);

      // Create payload with just the field being updated
      const payload = {
        [fieldName]: value,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpds/${lpdId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(`Failed to update ${fieldName}`);

      showToast.success({ message: `${fieldName} updated successfully` });
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      showToast.error({ message: `Failed to update ${fieldName}` });
    } finally {
      // Reset field update state
      setFieldUpdates((prev) => ({
        ...prev,
        [fieldName]: { isSubmitting: false },
      }));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const token = getCookie("token");

      // Only send fields that can be updated
      const payload = {
        attention_person: values.attention_person,
        notes: values.notes,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/lpds/${lpdId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to update LPD");

      showToast.success({ message: "LPD updated successfully" });
      onSuccess();
    } catch (error) {
      console.error("Error updating LPD:", error);
      showToast.error({ message: "Failed to update LPD" });
    } finally {
      setIsSubmitting(false);
    }
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
    },
    cells: {
      style: {
        paddingLeft: "1rem",
        paddingRight: "1rem",
      },
    },
  };

  // Update columns to include checkbox
  const columns = [
    {
      name: "Select",
      cell: (row: AdditionalDocument) => (
        <input
          type="checkbox"
          checked={selectedDocIds.includes(row.id)}
          onChange={() => handleDocumentSelect(row.id)}
          className="rounded border-gray-300"
        />
      ),
      width: "80px",
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

  // Add columns for available documents modal
  const availableDocsColumns = [
    {
      name: "Select",
      cell: (row: AdditionalDocument) => (
        <input
          type="checkbox"
          checked={selectedDocIds.includes(row.id)}
          onChange={() => handleDocumentSelect(row.id)}
          className="rounded border-gray-300"
        />
      ),
      width: "80px",
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

  // Add function to fetch current locations
  const fetchCurrentLocations = async () => {
    try {
      setIsLoadingLocations(true);
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
    } finally {
      setIsLoadingLocations(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nomor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
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
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <UpdateButton
                      fieldName="date"
                      isSubmitting={fieldUpdates.date?.isSubmitting}
                      onClick={() => handleFieldUpdate("date")}
                    />
                  </div>
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
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} placeholder="Enter attention person" />
                    </FormControl>
                    <UpdateButton
                      fieldName="attention person"
                      isSubmitting={fieldUpdates.attention_person?.isSubmitting}
                      onClick={() => handleFieldUpdate("attention_person")}
                    />
                  </div>
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
                    <Input {...field} disabled />
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
                  <div className="flex gap-2">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select destination department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLocations ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </div>
                        ) : currentLocations.length === 0 ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No departments found
                          </div>
                        ) : (
                          currentLocations.map((location, index) => (
                            <SelectItem
                              key={`location-${location.id || index}-${
                                location.location_code
                              }`}
                              value={location.location_code}
                            >
                              {location.location_code}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <UpdateButton
                      fieldName="destination department"
                      isSubmitting={
                        fieldUpdates.destination_department?.isSubmitting
                      }
                      onClick={() =>
                        handleFieldUpdate("destination_department")
                      }
                    />
                  </div>
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
                <div className="flex gap-2">
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[100px]"
                      placeholder="Enter notes"
                    />
                  </FormControl>
                  <UpdateButton
                    fieldName="notes"
                    isSubmitting={fieldUpdates.notes?.isSubmitting}
                    onClick={() => handleFieldUpdate("notes")}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {additionalDocuments.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Additional Documents
                </label>
                <div className="flex gap-2">
                  <Dialog
                    open={showAddDocsModal}
                    onOpenChange={setShowAddDocsModal}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          fetchAvailableDocs();
                          setShowAddDocsModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Documents
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add Additional Documents</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
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
                          columns={availableDocsColumns}
                          data={filteredAvailableDocs}
                          customStyles={{
                            ...customStyles,
                            rows: {
                              ...customStyles.rows,
                              style: {
                                ...customStyles.rows.style,
                                minHeight: "35px", // Reduce row height
                              },
                            },
                          }}
                          pagination
                          paginationPerPage={5} // Show fewer rows per page
                          paginationRowsPerPageOptions={[5, 10, 15]} // Smaller page size options
                          progressPending={isLoadingAvailableDocs}
                          selectableRows={false}
                          dense
                        />

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddDocsModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              updateAdditionalDocuments();
                              setShowAddDocsModal(false);
                            }}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <UpdateButton
                    fieldName="additional documents"
                    isSubmitting={
                      fieldUpdates.additional_documents?.isSubmitting
                    }
                    onClick={updateAdditionalDocuments}
                  />
                </div>
              </div>
              <DataTable
                columns={columns}
                data={additionalDocuments}
                customStyles={customStyles}
                pagination
                dense
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Additional Documents
                </label>
                <Dialog
                  open={showAddDocsModal}
                  onOpenChange={setShowAddDocsModal}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        fetchAvailableDocs();
                        setShowAddDocsModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Documents
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              <div className="p-8 text-center border rounded-md bg-muted/10">
                <p className="text-muted-foreground">
                  No additional documents added
                </p>
              </div>
            </div>
          )}
        </form>
      </Form>
    </Card>
  );
};
