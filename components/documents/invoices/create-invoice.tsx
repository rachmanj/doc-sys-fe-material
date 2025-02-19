"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Check, ChevronsUpDown } from "lucide-react";
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
  CreateInvoiceProps,
} from "@/types/create-invoice";
import {
  createInvoiceSchema,
  CreateInvoiceFormValues,
} from "@/schemas/create-invoice-schema";

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
  // Remove commas but keep decimal point and numbers
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

export default function CreateInvoice({ onSuccess }: CreateInvoiceProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    const user = getUserFromLocalStorage();
    if (user?.project) {
      form.setValue("receive_project", user.project, {
        shouldValidate: true,
      });
    }
  }, [form]);

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
      console.log("Suppliers data:", result);

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
      console.log("Additional docs:", result);

      // The API returns the array directly, not wrapped in a data property
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

  const fetchSupplierPaymentProject = async (supplierId: string) => {
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/suppliers/get-payment-project?supplier_id=${supplierId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch supplier payment project");
      }

      const result = await response.json();
      return result.payment_project;
    } catch (error) {
      console.error("Error fetching supplier payment project:", error);
      showToast.error({
        message: "Failed to load supplier payment project",
      });
      return null;
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
      setProjects(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToast.error({
        message: "Failed to load projects",
      });
    } finally {
      setIsLoadingProjects(false);
    }
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

  useEffect(() => {
    fetchSuppliers();
    fetchInvoiceTypes();
    fetchProjects();
  }, []);

  const handleDocumentSelect = (docId: number) => {
    setSelectedDocs((prev) => {
      if (prev.includes(docId)) {
        return prev.filter((id) => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

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

      console.log(payload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/store`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      showToast.success({
        message: "Invoice created successfully",
      });

      // Reset form and additional documents
      form.reset();
      setShowTable(false);
      setAdditionalDocs([]);
      setSelectedDocs([]);
      onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", error);
      showToast.error({
        message: "Failed to create invoice",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Supplier</FormLabel>
                  <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
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
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search supplier..." />
                        <CommandEmpty>No supplier found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {suppliers.map((supplier) => (
                            <CommandItem
                              key={supplier.id}
                              value={supplier.name}
                              onSelect={async () => {
                                form.setValue(
                                  "supplier_id",
                                  supplier.id.toString(),
                                  {
                                    shouldValidate: true,
                                  }
                                );

                                // Reset payment project first
                                form.setValue("payment_project", "", {
                                  shouldValidate: true,
                                });

                                // Fetch and set payment project
                                const paymentProject =
                                  await fetchSupplierPaymentProject(
                                    supplier.id.toString()
                                  );
                                if (paymentProject) {
                                  form.setValue(
                                    "payment_project",
                                    paymentProject,
                                    {
                                      shouldValidate: true,
                                    }
                                  );
                                }
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
                              <span className="ml-2 text-muted-foreground">
                                ({supplier.sap_code})
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <Popover
                    open={openInvoiceType}
                    onOpenChange={setOpenInvoiceType}
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
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search invoice type..." />
                        <CommandEmpty>No invoice type found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {invoiceTypes.map((type) => (
                            <CommandItem
                              key={type.id}
                              value={type.type_name}
                              onSelect={() => {
                                form.setValue("type_id", type.id.toString());
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={async (e) => {
                        field.onBlur();
                        const invoiceNumber = e.target.value;
                        const supplierId = form.getValues("supplier_id");

                        if (invoiceNumber && supplierId) {
                          const exists = await checkInvoiceNumberDuplication(
                            invoiceNumber,
                            supplierId
                          );
                          if (exists) {
                            form.setError("invoice_number", {
                              type: "manual",
                              message:
                                "Invoice number is exist for selected supplier",
                            });
                          } else {
                            form.clearErrors("invoice_number");
                          }
                        }
                      }}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                                form.setValue("invoice_project", project.code, {
                                  shouldValidate: true,
                                });
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
                  <FormControl>
                    <Input {...field} placeholder="Enter payment project" />
                  </FormControl>
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
              <h3 className="text-sm font-medium mb-4">
                Additional Documents for PO: {form.getValues("po_no")}
              </h3>
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
                <FormControl>
                  <Textarea {...field} className="min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Invoice
          </Button>
        </form>
      </Form>
    </Card>
  );
}
