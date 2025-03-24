"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCookie } from "@/lib/cookies";
import Swal from "sweetalert2";
import { useAppTheme } from "@/components/theme/ThemeProvider";
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

// Material UI imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import ListSubheader from "@mui/material/ListSubheader";
import { ListChildComponentProps, FixedSizeList } from "react-window";
import Popper from "@mui/material/Popper";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";

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

// Replace VirtualizedMenuItems with a simpler approach
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

// Custom Popper component for Autocomplete
const CustomPopper = (props: any) => {
  return (
    <Popper
      {...props}
      style={{ zIndex: 1301, width: "auto", minWidth: props.style?.width }}
    />
  );
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

  // Memoize form to prevent unnecessary re-renders
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
      Swal.fire({
        icon: "error",
        title: "Failed to load suppliers",
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
      Swal.fire({
        icon: "error",
        title: "Failed to load invoice types",
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
      Swal.fire({
        icon: "error",
        title: "Failed to load additional documents",
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
      console.log("Payment project response:", result);

      // Check if the response has a data property with an array of payment projects
      if (
        result.success &&
        result.data &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        // Return the first payment project code from the array
        return result.data[0];
      } else if (result.payment_project) {
        // Fallback to direct payment_project property for backward compatibility
        return result.payment_project;
      }
      return null;
    } catch (error) {
      console.error("Error fetching supplier payment project:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to load supplier payment project",
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
      // Extract projects from the data property and sort by code
      const projectsData = result.data || [];
      const sortedProjects = [...projectsData].sort((a, b) =>
        a.code.localeCompare(b.code)
      );
      setProjects(sortedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to load projects",
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

  // Memoize the sorted projects to prevent re-sorting on every render
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.code.localeCompare(b.code));
  }, [projects]);

  // Memoize the supplier options to prevent re-rendering
  const supplierOptions = useMemo(() => {
    return suppliers.map((supplier) => ({
      id: supplier.id,
      label: `${supplier.name} (${supplier.sap_code})`,
    }));
  }, [suppliers]);

  // Memoize the invoice type options
  const invoiceTypeOptions = useMemo(() => {
    return invoiceTypes.map((type) => ({
      id: type.id,
      label: type.type_name,
    }));
  }, [invoiceTypes]);

  // Use callbacks for event handlers to prevent unnecessary re-renders
  const handleSupplierChange = useCallback(
    async (_: React.SyntheticEvent, newValue: Supplier | null, field: any) => {
      const supplierId = newValue ? newValue.id.toString() : "";
      form.setValue("supplier_id", supplierId);
      field.onChange(supplierId);

      // Fetch and set payment project when supplier changes
      if (supplierId) {
        const paymentProject = await fetchSupplierPaymentProject(supplierId);
        if (paymentProject) {
          console.log("Setting payment project to:", paymentProject);
          form.setValue("payment_project", paymentProject, {
            shouldValidate: true,
          });
        } else {
          // Clear payment project if none is returned
          form.setValue("payment_project", "", {
            shouldValidate: true,
          });
        }
      } else {
        // Clear payment project if no supplier is selected
        form.setValue("payment_project", "", {
          shouldValidate: true,
        });
      }
    },
    [form]
  );

  const handleDocumentSelect = useCallback((docId: number) => {
    setSelectedDocs((prev) => {
      if (prev.includes(docId)) {
        return prev.filter((id) => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  }, []);

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

      console.log("Submitting payload:", payload);

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

      const result = await response.json();
      console.log("API response:", result);

      if (!response.ok) {
        // Extract error message from response if available
        const errorMessage = result.message || "Failed to create invoice";
        throw new Error(errorMessage);
      }

      Swal.fire({
        icon: "success",
        title: "Invoice created successfully",
      });

      // Reset form and additional documents
      form.reset();
      setShowTable(false);
      setAdditionalDocs([]);
      setSelectedDocs([]);
      onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to create invoice",
        text: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper className="p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="supplier_id"
              control={form.control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!form.formState.errors.supplier_id}
                >
                  <Autocomplete
                    value={
                      suppliers.find((s) => s.id.toString() === field.value) ||
                      undefined
                    }
                    onChange={(e, newValue) =>
                      handleSupplierChange(e, newValue, field)
                    }
                    options={suppliers}
                    getOptionLabel={(option) => {
                      if (!option) return "";
                      return `${option.name} (${option.sap_code})`;
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.sap_code}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    filterOptions={(options, state) => {
                      const inputValue = state.inputValue.toLowerCase().trim();
                      if (!inputValue) return options;

                      return options.filter(
                        (option) =>
                          option.name.toLowerCase().includes(inputValue) ||
                          option.sap_code.toLowerCase().includes(inputValue)
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Supplier"
                        placeholder="Search supplier..."
                        error={!!form.formState.errors.supplier_id}
                        helperText={
                          form.formState.errors.supplier_id?.message ||
                          "Select a supplier"
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingSuppliers ? (
                                <CircularProgress size={20} />
                              ) : (
                                params.InputProps.endAdornment
                              )}
                            </>
                          ),
                        }}
                      />
                    )}
                    loading={isLoadingSuppliers}
                    disabled={isLoadingSuppliers}
                    disablePortal={false}
                    openOnFocus
                    blurOnSelect
                    sx={{
                      "& .MuiAutocomplete-inputRoot": {
                        paddingLeft: "12px !important",
                        borderRadius: 1,
                      },
                    }}
                    PopperComponent={CustomPopper}
                    ListboxProps={{
                      style: { maxHeight: "200px" },
                    }}
                  />
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="type_id"
              control={form.control}
              render={({ field }) => (
                <FormControl fullWidth error={!!form.formState.errors.type_id}>
                  <Autocomplete
                    value={
                      invoiceTypes.find(
                        (t) => t.id.toString() === field.value
                      ) || undefined
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue.id.toString() : "");
                    }}
                    options={invoiceTypes}
                    getOptionLabel={(option) => {
                      if (!option) return "";
                      return option.type_name;
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Typography variant="body1">
                          {option.type_name}
                        </Typography>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Invoice Type"
                        placeholder="Search invoice type..."
                        error={!!form.formState.errors.type_id}
                        helperText={
                          form.formState.errors.type_id?.message ||
                          "Select an invoice type"
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingInvoiceTypes ? (
                                <CircularProgress size={20} />
                              ) : (
                                params.InputProps.endAdornment
                              )}
                            </>
                          ),
                        }}
                      />
                    )}
                    loading={isLoadingInvoiceTypes}
                    disabled={isLoadingInvoiceTypes}
                    disablePortal={false}
                    openOnFocus
                    blurOnSelect
                    sx={{
                      "& .MuiAutocomplete-inputRoot": {
                        paddingLeft: "12px !important",
                        borderRadius: 1,
                      },
                    }}
                    PopperComponent={CustomPopper}
                    ListboxProps={{
                      style: { maxHeight: "200px" },
                    }}
                  />
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="invoice_number"
              control={form.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Invoice Number"
                  error={!!form.formState.errors.invoice_number}
                  helperText={form.formState.errors.invoice_number?.message}
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
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="invoice_date"
              control={form.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Invoice Date"
                  type="date"
                  error={!!form.formState.errors.invoice_date}
                  helperText={form.formState.errors.invoice_date?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="receive_date"
              control={form.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Receive Date"
                  type="date"
                  error={!!form.formState.errors.receive_date}
                  helperText={form.formState.errors.receive_date?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="receive_project"
              control={form.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Receive Project"
                  error={!!form.formState.errors.receive_project}
                  helperText={form.formState.errors.receive_project?.message}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="invoice_project"
              control={form.control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!form.formState.errors.invoice_project}
                >
                  <Autocomplete
                    value={
                      sortedProjects.find((p) => p.code === field.value) ||
                      undefined
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue.code : "");
                    }}
                    options={sortedProjects}
                    getOptionLabel={(option) => {
                      if (!option) return "";
                      return option.code;
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body1">{option.code}</Typography>
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Invoice Project"
                        placeholder="Search project..."
                        error={!!form.formState.errors.invoice_project}
                        helperText={
                          form.formState.errors.invoice_project?.message ||
                          "Select a project"
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingProjects ? (
                                <CircularProgress size={20} />
                              ) : (
                                params.InputProps.endAdornment
                              )}
                            </>
                          ),
                        }}
                      />
                    )}
                    loading={isLoadingProjects}
                    disabled={isLoadingProjects}
                    disablePortal={false}
                    openOnFocus
                    blurOnSelect
                    sx={{
                      "& .MuiAutocomplete-inputRoot": {
                        paddingLeft: "12px !important",
                        borderRadius: 1,
                      },
                    }}
                    PopperComponent={CustomPopper}
                    ListboxProps={{
                      style: { maxHeight: "200px" },
                    }}
                  />
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="payment_project"
              control={form.control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!form.formState.errors.payment_project}
                >
                  <Autocomplete
                    value={
                      sortedProjects.find((p) => p.code === field.value) ||
                      undefined
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue.code : "");
                    }}
                    options={sortedProjects}
                    getOptionLabel={(option) => {
                      if (!option) return "";
                      return option.code;
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body1">{option.code}</Typography>
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Payment Project"
                        placeholder="Search project..."
                        error={!!form.formState.errors.payment_project}
                        helperText={
                          form.formState.errors.payment_project?.message ||
                          "Select a payment project"
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingProjects ? (
                                <CircularProgress size={20} />
                              ) : (
                                params.InputProps.endAdornment
                              )}
                            </>
                          ),
                        }}
                      />
                    )}
                    loading={isLoadingProjects}
                    disabled={isLoadingProjects}
                    disablePortal={false}
                    openOnFocus
                    blurOnSelect
                    sx={{
                      "& .MuiAutocomplete-inputRoot": {
                        paddingLeft: "12px !important",
                        borderRadius: 1,
                      },
                    }}
                    PopperComponent={CustomPopper}
                    ListboxProps={{
                      style: { maxHeight: "200px" },
                    }}
                  />
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="currency"
              control={form.control}
              render={({ field }) => (
                <FormControl fullWidth error={!!form.formState.errors.currency}>
                  <InputLabel>Currency</InputLabel>
                  <Select {...field} label="Currency">
                    <MenuItem value="IDR">IDR</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                  </Select>
                  <FormHelperText>
                    {form.formState.errors.currency?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="amount"
              control={form.control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  label="Amount"
                  value={formatNumber(field.value || "")}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[\d,]*\.?\d*$/.test(value)) {
                      const unformatted = unformatNumber(value);
                      field.onChange(unformatted);
                    }
                  }}
                  onBlur={(e) => {
                    field.onBlur();
                    const value = unformatNumber(e.target.value);
                    if (value && !isNaN(Number(value))) {
                      field.onChange(value);
                    }
                  }}
                  error={!!form.formState.errors.amount}
                  helperText={form.formState.errors.amount?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {form.getValues("currency")}
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="po_no"
              control={form.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="PO Number"
                  error={!!form.formState.errors.po_no}
                  helperText={form.formState.errors.po_no?.message}
                  onBlur={(e) => {
                    field.onBlur();
                    if (e.target.value) {
                      setShowTable(true);
                      fetchAdditionalDocs(e.target.value);
                    } else {
                      setShowTable(false);
                      setAdditionalDocs([]);
                      setSelectedDocs([]);
                    }
                  }}
                />
              )}
            />
          </Grid>

          {showTable && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Additional Documents for PO: {form.getValues("po_no")}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Checkbox
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
                      </TableCell>
                      <TableCell>Document No</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Document Date</TableCell>
                      <TableCell>Receive Date</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoadingDocs ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : additionalDocs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No additional documents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      additionalDocs.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedDocs.includes(doc.id)}
                              onChange={() => handleDocumentSelect(doc.id)}
                            />
                          </TableCell>
                          <TableCell>{doc.document_number}</TableCell>
                          <TableCell>
                            {doc.type_id === 26 ? "ITO" : "Other"}
                          </TableCell>
                          <TableCell>
                            {new Date(doc.document_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {doc.receive_date
                              ? new Date(doc.receive_date).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>{doc.cur_loc}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          <Grid item xs={12}>
            <Controller
              name="remarks"
              control={form.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Remarks"
                  multiline
                  rows={4}
                  error={!!form.formState.errors.remarks}
                  helperText={form.formState.errors.remarks?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              Create Invoice
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
