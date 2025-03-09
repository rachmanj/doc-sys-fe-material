"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCookie } from "@/lib/cookies";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/components/theme/ThemeProvider";
import { toast } from "react-toastify";
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
import InvoiceAttachments from "@/components/documents/invoices/invoice-attachments";

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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";

// Icons
import RefreshIcon from "@mui/icons-material/Refresh";

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
  <Tooltip title={`Update ${fieldName.replace("_", " ")}`}>
    <IconButton
      size="small"
      onClick={onClick}
      disabled={isSubmitting}
      color="primary"
    >
      {isSubmitting ? (
        <CircularProgress size={16} />
      ) : (
        <RefreshIcon fontSize="small" />
      )}
    </IconButton>
  </Tooltip>
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invoice-tabpanel-${index}`}
      aria-labelledby={`invoice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `invoice-tab-${index}`,
    "aria-controls": `invoice-tabpanel-${index}`,
  };
}

export default function EditInvoice({
  invoiceId,
  onSuccess,
  onCancel,
}: EditInvoiceProps) {
  const router = useRouter();
  const { mode } = useAppTheme();
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
      Swal.fire({
        icon: "error",
        title: "Failed to load projects",
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
      Swal.fire({
        icon: "error",
        title: "Failed to load additional documents",
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Invoice data:", result);

      if (result.success) {
        const invoiceData = result.data;

        // Set form values
        form.reset({
          supplier_id: invoiceData.supplier_id.toString(),
          type_id: invoiceData.type_id.toString(),
          invoice_number: invoiceData.invoice_number,
          invoice_date: invoiceData.invoice_date,
          receive_date: invoiceData.receive_date,
          receive_project: invoiceData.receive_project,
          invoice_project: invoiceData.invoice_project,
          payment_project: invoiceData.payment_project,
          currency: invoiceData.currency,
          amount: invoiceData.amount.toString(),
          po_no: invoiceData.po_no,
          remarks: invoiceData.remarks,
        });

        // If there's a PO number, fetch additional documents
        if (invoiceData.po_no) {
          setShowTable(true);
          fetchAdditionalDocs(invoiceData.po_no);
        }

        // Set selected documents
        if (
          invoiceData.additional_documents &&
          invoiceData.additional_documents.length > 0
        ) {
          setSelectedDocs(
            invoiceData.additional_documents.map((doc: any) => doc.id)
          );
          setAdditionalDocs(invoiceData.additional_documents);
        }
      } else {
        throw new Error(result.message || "Failed to fetch invoice data");
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      toast.error("Failed to load invoice data. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onCancel(); // Go back if we can't load the invoice
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

      // Check for invoice number and supplier combination duplication
      const invoiceNumber = values.invoice_number;
      const supplierId = values.supplier_id;

      if (invoiceNumber && supplierId) {
        const exists = await checkInvoiceNumberDuplication(
          invoiceNumber,
          supplierId
        );

        if (exists) {
          // Keep using Swal for confirmations
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Invoice number already exists for this supplier",
          });
          return;
        }
      }

      const token = getCookie("token");
      const user = getUserFromLocalStorage();

      // Prepare payload with selected documents
      const payload = {
        ...values,
        selected_documents: selectedDocs,
        user_id: user?.id,
      };

      console.log("Submitting update with payload:", payload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/update/${invoiceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log("Update response:", result);

      if (response.ok && result.success) {
        // Use react-toastify for success notifications
        toast.success("Invoice updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        onSuccess();
      } else {
        const errorMessage = result.message || "Failed to update invoice";
        console.error(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      // Use react-toastify for error notifications
      toast.error("Failed to update invoice. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  // Add function for individual field update
  const handleFieldUpdate = async (
    fieldName: keyof CreateInvoiceFormValues | "selected_documents"
  ) => {
    try {
      // Set the specific field as submitting
      setFieldUpdates((prev) => ({
        ...prev,
        [fieldName]: { isSubmitting: true },
      }));

      const token = getCookie("token");
      const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/update/${invoiceId}`;
      let data: any = {};

      if (fieldName === "selected_documents") {
        data = { additional_document_ids: selectedDocs };
      } else {
        data = { [fieldName]: form.getValues(fieldName as any) || "" };
      }

      console.log(`Updating ${fieldName} with endpoint:`, endpoint);
      console.log("Data being sent:", data);

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Update response:", result);

      if (response.ok && result.success) {
        toast.success(`${fieldName.replace("_", " ")} updated successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        const errorMessage =
          result.message || `Failed to update ${fieldName.replace("_", " ")}`;
        console.error(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      toast.error(
        `Failed to update ${fieldName.replace("_", " ")}. Please try again.`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      // Reset the submitting state for this field
      setFieldUpdates((prev) => ({
        ...prev,
        [fieldName]: { isSubmitting: false },
      }));
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Basic Invoice Information */}
        <Grid item xs={12}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
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
                            suppliers.find(
                              (s) => s.id.toString() === field.value
                            ) || null
                          }
                          onChange={(_, newValue) => {
                            field.onChange(
                              newValue ? newValue.id.toString() : ""
                            );
                          }}
                          options={suppliers}
                          getOptionLabel={(option) => {
                            if (!option) return "";
                            return `${option.name} (${option.sap_code})`;
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Supplier"
                              error={!!form.formState.errors.supplier_id}
                              helperText={
                                form.formState.errors.supplier_id?.message
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
                                    <InputAdornment position="end">
                                      <UpdateButton
                                        fieldName="supplier"
                                        isSubmitting={
                                          fieldUpdates.supplier_id?.isSubmitting
                                        }
                                        onClick={() =>
                                          handleFieldUpdate("supplier_id")
                                        }
                                      />
                                    </InputAdornment>
                                  </>
                                ),
                              }}
                            />
                          )}
                          loading={isLoadingSuppliers}
                          disabled={isLoadingSuppliers}
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
                      <FormControl
                        fullWidth
                        error={!!form.formState.errors.type_id}
                      >
                        <Autocomplete
                          value={
                            invoiceTypes.find(
                              (t) => t.id.toString() === field.value
                            ) || null
                          }
                          onChange={(_, newValue) => {
                            field.onChange(
                              newValue ? newValue.id.toString() : ""
                            );
                          }}
                          options={invoiceTypes}
                          getOptionLabel={(option) => {
                            if (!option) return "";
                            return option.type_name;
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Invoice Type"
                              error={!!form.formState.errors.type_id}
                              helperText={
                                form.formState.errors.type_id?.message
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
                                    <InputAdornment position="end">
                                      <UpdateButton
                                        fieldName="invoice type"
                                        isSubmitting={
                                          fieldUpdates.type_id?.isSubmitting
                                        }
                                        onClick={() =>
                                          handleFieldUpdate("type_id")
                                        }
                                      />
                                    </InputAdornment>
                                  </>
                                ),
                              }}
                            />
                          )}
                          loading={isLoadingInvoiceTypes}
                          disabled={isLoadingInvoiceTypes}
                        />
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Details */}
        <Grid item xs={12}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Invoice Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="invoice_number"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Invoice Number"
                        error={!!form.formState.errors.invoice_number}
                        helperText={
                          form.formState.errors.invoice_number?.message
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <UpdateButton
                                fieldName="invoice number"
                                isSubmitting={
                                  fieldUpdates.invoice_number?.isSubmitting
                                }
                                onClick={() =>
                                  handleFieldUpdate("invoice_number")
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
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
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <UpdateButton
                                fieldName="invoice date"
                                isSubmitting={
                                  fieldUpdates.invoice_date?.isSubmitting
                                }
                                onClick={() =>
                                  handleFieldUpdate("invoice_date")
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
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
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <UpdateButton
                                fieldName="receive date"
                                isSubmitting={
                                  fieldUpdates.receive_date?.isSubmitting
                                }
                                onClick={() =>
                                  handleFieldUpdate("receive_date")
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Information */}
        <Grid item xs={12}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="receive_project"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Receive Project"
                        disabled
                        error={!!form.formState.errors.receive_project}
                        helperText={
                          form.formState.errors.receive_project?.message
                        }
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
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
                            projects.find((p) => p.code === field.value) || null
                          }
                          onChange={(_, newValue) => {
                            field.onChange(newValue ? newValue.code : "");
                          }}
                          options={projects}
                          getOptionLabel={(option) => {
                            if (!option) return "";
                            return option.code;
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Invoice Project"
                              error={!!form.formState.errors.invoice_project}
                              helperText={
                                form.formState.errors.invoice_project?.message
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
                                    <InputAdornment position="end">
                                      <UpdateButton
                                        fieldName="invoice project"
                                        isSubmitting={
                                          fieldUpdates.invoice_project
                                            ?.isSubmitting
                                        }
                                        onClick={() =>
                                          handleFieldUpdate("invoice_project")
                                        }
                                      />
                                    </InputAdornment>
                                  </>
                                ),
                              }}
                            />
                          )}
                          loading={isLoadingProjects}
                          disabled={isLoadingProjects}
                        />
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name="payment_project"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Payment Project"
                        error={!!form.formState.errors.payment_project}
                        helperText={
                          form.formState.errors.payment_project?.message
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <UpdateButton
                                fieldName="payment project"
                                isSubmitting={
                                  fieldUpdates.payment_project?.isSubmitting
                                }
                                onClick={() =>
                                  handleFieldUpdate("payment_project")
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Information */}
        <Grid item xs={12}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="currency"
                    control={form.control}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        error={!!form.formState.errors.currency}
                      >
                        <InputLabel>Currency</InputLabel>
                        <Select
                          {...field}
                          label="Currency"
                          endAdornment={
                            <InputAdornment position="end">
                              <UpdateButton
                                fieldName="currency"
                                isSubmitting={
                                  fieldUpdates.currency?.isSubmitting
                                }
                                onClick={() => handleFieldUpdate("currency")}
                              />
                            </InputAdornment>
                          }
                        >
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

                <Grid item xs={12} md={4}>
                  <Controller
                    name="amount"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label="Amount"
                        value={formatNumber(field.value)}
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
                              <UpdateButton
                                fieldName="amount"
                                isSubmitting={fieldUpdates.amount?.isSubmitting}
                                onClick={() => handleFieldUpdate("amount")}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
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
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <UpdateButton
                                fieldName="po number"
                                isSubmitting={fieldUpdates.po_no?.isSubmitting}
                                onClick={() => handleFieldUpdate("po_no")}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Documents */}
        {showTable && (
          <Grid item xs={12}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Additional Documents
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Additional Documents for PO: {form.getValues("po_no")}
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              indeterminate={
                                selectedDocs.length > 0 &&
                                selectedDocs.length < additionalDocs.length
                              }
                              checked={
                                selectedDocs.length === additionalDocs.length &&
                                additionalDocs.length > 0
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
                              <CircularProgress size={20} />
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
                            <TableRow key={doc.id} hover>
                              <TableCell padding="checkbox">
                                <Checkbox
                                  color="primary"
                                  checked={selectedDocs.includes(doc.id)}
                                  onChange={() => handleDocumentSelect(doc.id)}
                                />
                              </TableCell>
                              <TableCell>{doc.document_number}</TableCell>
                              <TableCell>
                                {doc.type_id === 26 ? "ITO" : "Other"}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  doc.document_date
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {doc.receive_date
                                  ? new Date(
                                      doc.receive_date
                                    ).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell>{doc.cur_loc}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleFieldUpdate("selected_documents")}
                      disabled={fieldUpdates.selected_documents?.isSubmitting}
                      startIcon={
                        fieldUpdates.selected_documents?.isSubmitting ? (
                          <CircularProgress size={16} />
                        ) : null
                      }
                    >
                      Update Selected Documents
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Remarks */}
        <Grid item xs={12}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Remarks
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
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
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <UpdateButton
                                fieldName="remarks"
                                isSubmitting={
                                  fieldUpdates.remarks?.isSubmitting
                                }
                                onClick={() => handleFieldUpdate("remarks")}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Attachments */}
        <Grid item xs={12}>
          <InvoiceAttachments invoiceId={invoiceId} />
        </Grid>

        {/* Back Button */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Back
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
