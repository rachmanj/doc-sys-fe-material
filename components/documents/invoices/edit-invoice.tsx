"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getCookie } from "@/lib/cookies";
import { Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";
import { Check, ChevronsUpDown, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Supplier,
  InvoiceType,
  AdditionalDocument,
  Project,
} from "@/types/create-invoice";
import {
  createInvoiceSchema,
  CreateInvoiceFormValues,
} from "@/schemas/create-invoice-schema";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditInvoiceProps {
  invoiceId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const formatNumber = (value: string) => {
  // Handle empty or invalid input
  if (!value) return "";

  // Split into integer and decimal parts
  let [integer, decimal] = value.split(".");

  // Remove non-digits from integer part
  integer = integer.replace(/\D/g, "");

  // Add commas to integer part
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Handle decimal part if exists
  if (decimal !== undefined) {
    // Limit decimal to 2 places and remove non-digits
    decimal = decimal.replace(/\D/g, "").slice(0, 2);
    return `${formattedInteger}.${decimal}`;
  }

  return formattedInteger;
};

const unformatNumber = (value: string) => {
  return value.replace(/,/g, "");
};

const getUserFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const userString = localStorage.getItem("user");
    if (userString) {
      return JSON.parse(userString);
    }
  }
  return null;
};

const checkInvoiceNumberDuplication = async (
  invoiceNumber: string,
  supplierId: string
) => {
  try {
    const token = getCookie("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/check-duplication?invoice_number=${invoiceNumber}&supplier_id=${supplierId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check invoice number");
    }

    const result = await response.json();
    return result.exists;
  } catch (error) {
    console.error("Error checking invoice number:", error);
    return false;
  }
};

// Add this type for field updates
type FieldUpdate = {
  [K in keyof CreateInvoiceFormValues | "selected_documents"]?: {
    isSubmitting: boolean;
  };
};

interface UpdateButtonProps {
  fieldName: string;
  isSubmitting?: boolean;
  onClick: () => void;
}

const UpdateButton = ({
  fieldName,
  isSubmitting,
  onClick,
}: UpdateButtonProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onClick}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCw className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Update {fieldName.replace("_", " ")}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function EditInvoice({
  invoiceId,
  onSuccess,
  onCancel,
}: EditInvoiceProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [invoiceTypes, setInvoiceTypes] = useState<InvoiceType[]>([]);
  const [isLoadingInvoiceTypes, setIsLoadingInvoiceTypes] = useState(false);
  const [additionalDocs, setAdditionalDocs] = useState<AdditionalDocument[]>(
    []
  );
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [openInvoiceType, setOpenInvoiceType] = useState(false);
  const [openInvoiceProject, setOpenInvoiceProject] = useState(false);
  const [fieldUpdates, setFieldUpdates] = useState<FieldUpdate>({});

  const form = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      invoice_number: "",
      supplier_id: "",
      invoice_date: "",
      receive_date: "",
      po_no: "",
      currency: "IDR",
      amount: "",
      type_id: "",
      remarks: "",
      receive_project: getUserFromLocalStorage()?.project || "",
      invoice_project: "",
      payment_project: "",
    },
  });

  const fetchSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/suppliers/all?type=vendor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const result = await response.json();
      setSuppliers(result.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      showToast.error({
        message: "Failed to load suppliers",
      });
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const fetchInvoiceTypes = async () => {
    try {
      setIsLoadingInvoiceTypes(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/invoice-types/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoice types");
      }

      const result = await response.json();
      setInvoiceTypes(result.data || []);
    } catch (error) {
      console.error("Error fetching invoice types:", error);
      showToast.error({
        message: "Failed to load invoice types",
      });
    } finally {
      setIsLoadingInvoiceTypes(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/projects/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const result = await response.json();
      setProjects(result || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToast.error({
        message: "Failed to load projects",
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchAdditionalDocs = async (poNo: string) => {
    if (!poNo) return;

    try {
      setIsLoadingDocs(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/get-by-po?po_no=${poNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch additional documents");
      }

      const result = await response.json();
      setAdditionalDocs(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error fetching additional documents:", error);
      showToast.error({
        message: "Failed to load additional documents",
      });
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleDocumentSelect = (docId: number) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const fetchInvoiceData = async () => {
    try {
      setIsLoading(true);
      const token = getCookie("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/get-by-id?invoice_id=${invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }

      const result = await response.json();
      const data = result.data;

      // Set form values
      form.reset({
        invoice_number: data.invoice_number,
        supplier_id: data.supplier_id.toString(),
        invoice_date: data.invoice_date,
        receive_date: data.receive_date,
        po_no: data.po_no || "",
        currency: data.currency,
        amount: data.amount,
        type_id: data.type_id.toString(),
        remarks: data.remarks || "",
        receive_project: data.receive_project || "",
        invoice_project: data.invoice_project || "",
        payment_project: data.payment_project || "",
      });

      // Set selected documents if they exist
      if (data.additional_documents?.length > 0) {
        setSelectedDocs(
          data.additional_documents.map((doc: AdditionalDocument) => doc.id)
        );
        setAdditionalDocs(data.additional_documents);
        setShowTable(true);
      }
    } catch (error) {
      showToast.error({
        message: "Failed to load invoice data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
    fetchSuppliers();
    fetchInvoiceTypes();
    fetchProjects();
  }, [invoiceId]);

  const onSubmit = async (values: CreateInvoiceFormValues) => {
    try {
      setIsSubmitting(true);
      const token = getCookie("token");
      const user = getUserFromLocalStorage();

      const payload = {
        ...values,
        selected_documents: selectedDocs,
        user_id: user?.id,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/update/${invoiceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Failed to update invoice");
      }

      const result = await response.json();

      showToast.success({
        message: "Invoice updated successfully",
      });

      onSuccess();
    } catch (error) {
      showToast.error({
        message: "Failed to update invoice",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Use searchParams to ensure we land on the list tab
    const searchParams = new URLSearchParams();
    searchParams.set("tab", "list");
    router.push(`/documents/invoices?${searchParams.toString()}`);
    router.refresh();
  };

  // Add function for individual field update
  const handleFieldUpdate = async (
    fieldName: keyof CreateInvoiceFormValues | "selected_documents"
  ) => {
    try {
      setFieldUpdates((prev) => ({
        ...prev,
        [fieldName]: { isSubmitting: true },
      }));

      const token = getCookie("token");
      let payload;

      if (fieldName === "selected_documents") {
        payload = {
          selected_documents: selectedDocs,
        };
      } else {
        const value = form.getValues(fieldName);
        payload = {
          [fieldName]: value,
        };
      }

      // Check for invoice number and supplier combination duplication
      if (fieldName === "invoice_number" || fieldName === "supplier_id") {
        const invoiceNumber = form.getValues("invoice_number");
        const supplierId = form.getValues("supplier_id");

        if (invoiceNumber && supplierId) {
          const exists = await checkInvoiceNumberDuplication(
            invoiceNumber,
            supplierId
          );

          if (exists) {
            showToast.error({
              message: "Invoice number already exists for this supplier",
            });
            return;
          }
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/update/${invoiceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update ${fieldName}`);
      }

      const result = await response.json();

      // Format the changes for the toast message
      const changes = result.data.changes;
      const changeMessages = Object.entries(changes)
        .map(([field, value]) => `${field.replace("_", " ")}: ${value}`)
        .join(", ");

      showToast.success({
        message: `Updated ${changeMessages}`,
      });
    } catch (error) {
      showToast.error({
        message: `Failed to update ${fieldName.replace("_", " ")}`,
      });
    } finally {
      setFieldUpdates((prev) => ({
        ...prev,
        [fieldName]: { isSubmitting: false },
      }));
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>

      <Form {...form}>
        <div className="space-y-6">
          {/* First Row - Suppliers and Invoice Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Supplier</FormLabel>
                  <div className="flex gap-2">
                    <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoadingSuppliers}
                          >
                            {field.value
                              ? suppliers.find(
                                  (supplier) =>
                                    supplier.id.toString() === field.value
                                )?.name || "Select supplier"
                              : "Select supplier"}
                            {isLoadingSuppliers ? (
                              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search supplier..."
                            onValueChange={(search) => {
                              // This will handle the search input
                              setOpenSupplier(true);
                            }}
                          />
                          <CommandEmpty>No supplier found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-auto">
                            {suppliers
                              .filter((supplier) =>
                                supplier.name.toLowerCase().includes(
                                  // Use CommandInput's value for filtering
                                  (
                                    document.querySelector(
                                      '[placeholder="Search supplier..."]'
                                    ) as HTMLInputElement
                                  )?.value.toLowerCase() || ""
                                )
                              )
                              .map((supplier) => (
                                <CommandItem
                                  key={supplier.id}
                                  value={supplier.name}
                                  onSelect={() => {
                                    form.setValue(
                                      "supplier_id",
                                      supplier.id.toString(),
                                      {
                                        shouldValidate: true,
                                      }
                                    );
                                    setOpenSupplier(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      supplier.id.toString() === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {supplier.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <UpdateButton
                      fieldName="supplier selection"
                      isSubmitting={fieldUpdates.supplier_id?.isSubmitting}
                      onClick={() => handleFieldUpdate("supplier_id")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Invoice Type</FormLabel>
                  <div className="flex gap-2">
                    <Popover
                      open={openInvoiceType}
                      onOpenChange={setOpenInvoiceType}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoadingInvoiceTypes}
                          >
                            {field.value
                              ? invoiceTypes.find(
                                  (type) => type.id.toString() === field.value
                                )?.type_name || "Select type"
                              : "Select type"}
                            {isLoadingInvoiceTypes ? (
                              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search type..."
                            onValueChange={(search) => {
                              // This will handle the search input
                              setOpenInvoiceType(true);
                            }}
                          />
                          <CommandEmpty>No type found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-auto">
                            {invoiceTypes
                              .filter((type) =>
                                type.type_name.toLowerCase().includes(
                                  // Use CommandInput's value for filtering
                                  (
                                    document.querySelector(
                                      '[placeholder="Search type..."]'
                                    ) as HTMLInputElement
                                  )?.value.toLowerCase() || ""
                                )
                              )
                              .map((type) => (
                                <CommandItem
                                  key={type.id}
                                  value={type.type_name}
                                  onSelect={() => {
                                    form.setValue(
                                      "type_id",
                                      type.id.toString(),
                                      {
                                        shouldValidate: true,
                                      }
                                    );
                                    setOpenInvoiceType(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      type.id.toString() === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {type.type_name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <UpdateButton
                      fieldName="invoice type"
                      isSubmitting={fieldUpdates.type_id?.isSubmitting}
                      onClick={() => handleFieldUpdate("type_id")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Copy all other form fields from create-invoice.tsx */}
          {/* Including the grid layouts and all FormFields */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <UpdateButton
                      fieldName="invoice number"
                      isSubmitting={fieldUpdates.invoice_number?.isSubmitting}
                      onClick={() => handleFieldUpdate("invoice_number")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Date</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <UpdateButton
                      fieldName="invoice date"
                      isSubmitting={fieldUpdates.invoice_date?.isSubmitting}
                      onClick={() => handleFieldUpdate("invoice_date")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receive_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receive Date</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <UpdateButton
                      fieldName="receive date"
                      isSubmitting={fieldUpdates.receive_date?.isSubmitting}
                      onClick={() => handleFieldUpdate("receive_date")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="receive_project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receive Project</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_project"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Invoice Project</FormLabel>
                  <div className="flex gap-2">
                    <Popover
                      open={openInvoiceProject}
                      onOpenChange={setOpenInvoiceProject}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoadingProjects}
                          >
                            {field.value || "Select project"}
                            {isLoadingProjects ? (
                              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search project..." />
                          <CommandEmpty>No project found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-auto">
                            {projects.map((project) => (
                              <CommandItem
                                key={project.code}
                                value={project.code}
                                onSelect={() => {
                                  form.setValue(
                                    "invoice_project",
                                    project.code,
                                    {
                                      shouldValidate: true,
                                    }
                                  );
                                  setOpenInvoiceProject(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    project.code === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {project.code}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <UpdateButton
                      fieldName="invoice project"
                      isSubmitting={fieldUpdates.invoice_project?.isSubmitting}
                      onClick={() => handleFieldUpdate("invoice_project")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Project</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} placeholder="Enter payment project" />
                    </FormControl>
                    <UpdateButton
                      fieldName="payment project"
                      isSubmitting={fieldUpdates.payment_project?.isSubmitting}
                      onClick={() => handleFieldUpdate("payment_project")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IDR">IDR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <UpdateButton
                      fieldName="currency"
                      isSubmitting={fieldUpdates.currency?.isSubmitting}
                      onClick={() => handleFieldUpdate("currency")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        value={formatNumber(field.value)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[\d,]*\.?\d*$/.test(value)) {
                            const unformatted = unformatNumber(value);
                            field.onChange(unformatted);
                          }
                        }}
                        onBlur={(e) => {
                          const value = unformatNumber(e.target.value);
                          if (value && !isNaN(Number(value))) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <UpdateButton
                      fieldName="amount"
                      isSubmitting={fieldUpdates.amount?.isSubmitting}
                      onClick={() => handleFieldUpdate("amount")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="po_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        if (e.target.value) {
                          setShowTable(true);
                          fetchAdditionalDocs(e.target.value);
                        } else {
                          setShowTable(false);
                          setAdditionalDocs([]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {showTable && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">
                  Additional Documents for PO: {form.getValues("po_no")}
                </h3>
                <UpdateButton
                  fieldName="selected documents"
                  isSubmitting={fieldUpdates.selected_documents?.isSubmitting}
                  onClick={() => handleFieldUpdate("selected_documents")}
                />
              </div>
              <div className="relative overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={
                            selectedDocs.length === additionalDocs.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocs(
                                additionalDocs.map((doc) => doc.id)
                              );
                            } else {
                              setSelectedDocs([]);
                            }
                          }}
                        />
                      </th>
                      <th className="text-left py-3 px-4">Document No</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Document Date</th>
                      <th className="text-left py-3 px-4">Receive Date</th>
                      <th className="text-left py-3 px-4">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingDocs ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : additionalDocs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No additional documents found
                        </td>
                      </tr>
                    ) : (
                      additionalDocs.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedDocs.includes(doc.id)}
                              onChange={() => handleDocumentSelect(doc.id)}
                            />
                          </td>
                          <td className="py-3 px-4">{doc.document_number}</td>
                          <td className="py-3 px-4">
                            {doc.type_id === 26 ? "ITO" : "Other"}
                          </td>
                          <td className="py-3 px-4">
                            {format(new Date(doc.document_date), "dd MMM yyyy")}
                          </td>
                          <td className="py-3 px-4">
                            {doc.receive_date
                              ? format(
                                  new Date(doc.receive_date),
                                  "dd MMM yyyy"
                                )
                              : "-"}
                          </td>
                          <td className="py-3 px-4">{doc.cur_loc}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <UpdateButton
                    fieldName="remarks"
                    isSubmitting={fieldUpdates.remarks?.isSubmitting}
                    onClick={() => handleFieldUpdate("remarks")}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </Card>
  );
}
