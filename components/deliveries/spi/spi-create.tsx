"use client";

import { useState, useEffect } from "react";
import { useAppTheme } from "@/components/theme/ThemeProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { getCookie } from "@/lib/cookies";
import { showToast } from "@/lib/toast";

// Material UI imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

interface Department {
  id: number;
  name: string;
  code: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  supplier_id: number;
  supplier_name: string;
  po_no: string | null;
  amount: number;
  currency: string;
  status: string;
}

// Form validation schema based on backend requirements
const formSchema = z.object({
  nomor: z
    .string()
    .max(50, "SPI number must be less than 50 characters")
    .optional()
    .nullable(),
  date: z.string().min(1, "Date is required"),
  origin_department: z.string().min(1, "Origin department is required"),
  destination_department: z
    .string()
    .min(1, "Destination department is required"),
  attention_person: z
    .string()
    .max(50, "Attention person must be less than 50 characters")
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
  status: z
    .string()
    .max(20, "Status must be less than 20 characters")
    .optional()
    .nullable(),
});

export const SpiCreate = () => {
  const { mode } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomor: "",
      date: format(new Date(), "yyyy-MM-dd"),
      origin_department: "",
      destination_department: "",
      attention_person: "",
      notes: "",
      status: "DRAFT",
    },
  });

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
    fetchInvoices();
  }, []);

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDepartments(result.data);
      } else {
        showToast.error({
          message: result.message || "Failed to fetch departments",
        });
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      showToast.error({
        message: "An error occurred while fetching departments",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/all?status=ACTIVE`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setInvoices(result.data);
        setFilteredInvoices(result.data);
      } else {
        showToast.error({
          message: result.message || "Failed to fetch invoices",
        });
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      showToast.error({ message: "An error occurred while fetching invoices" });
    } finally {
      setLoading(false);
    }
  };

  // Generate SPI number
  const generateSpiNumber = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const originDept = form.getValues("origin_department");

      if (!originDept) {
        showToast.warning({ message: "Please select origin department first" });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/spis/generate-number?department_id=${originDept}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate SPI number: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        form.setValue("nomor", result.data);
      } else {
        showToast.error({
          message: result.message || "Failed to generate SPI number",
        });
      }
    } catch (error) {
      console.error("Error generating SPI number:", error);
      showToast.error({
        message: "An error occurred while generating SPI number",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedInvoices.length === 0) {
      showToast.warning({ message: "Please select at least one invoice" });
      return;
    }

    try {
      setSubmitting(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deliveries/spis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...values,
            invoice_ids: selectedInvoices,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create SPI: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        showToast.success({ message: "SPI created successfully" });
        // Reset form
        form.reset({
          nomor: "",
          date: format(new Date(), "yyyy-MM-dd"),
          origin_department: "",
          destination_department: "",
          attention_person: "",
          notes: "",
          status: "DRAFT",
        });
        setSelectedInvoices([]);
      } else {
        showToast.error({ message: result.message || "Failed to create SPI" });
      }
    } catch (error) {
      console.error("Error creating SPI:", error);
      showToast.error({ message: "An error occurred while creating SPI" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle invoice search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      const filtered = invoices.filter(
        (invoice) =>
          invoice.invoice_number.toLowerCase().includes(value.toLowerCase()) ||
          (invoice.po_no &&
            invoice.po_no.toLowerCase().includes(value.toLowerCase())) ||
          invoice.supplier_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredInvoices(filtered);
    } else {
      setFilteredInvoices(invoices);
    }
  };

  // Handle invoice selection
  const handleInvoiceSelection = (id: number) => {
    setSelectedInvoices((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Create New SPI
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Fill in the details to create a new Surat Pengiriman Invoice
        </Typography>

        <Divider sx={{ my: 2 }} />

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* SPI Number */}
            <Grid item xs={12} md={6}>
              <TextField
                label="SPI Number"
                fullWidth
                {...form.register("nomor")}
                error={!!form.formState.errors.nomor}
                helperText={form.formState.errors.nomor?.message}
                disabled={true}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={generateSpiNumber}
                      disabled={!form.getValues("origin_department")}
                    >
                      Generate
                    </Button>
                  ),
                }}
              />
            </Grid>

            {/* SPI Date */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                {...form.register("date")}
                error={!!form.formState.errors.date}
                helperText={form.formState.errors.date?.message}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Origin Department */}
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                margin="normal"
                error={!!form.formState.errors.origin_department}
              >
                <InputLabel>Origin Department</InputLabel>
                <Select
                  label="Origin Department"
                  {...form.register("origin_department")}
                  onChange={(e) => {
                    form.setValue("origin_department", e.target.value);
                    // Clear SPI number when origin department changes
                    form.setValue("nomor", "");
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
                {form.formState.errors.origin_department && (
                  <Typography variant="caption" color="error">
                    {form.formState.errors.origin_department.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Destination Department */}
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                margin="normal"
                error={!!form.formState.errors.destination_department}
              >
                <InputLabel>Destination Department</InputLabel>
                <Select
                  label="Destination Department"
                  {...form.register("destination_department")}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
                {form.formState.errors.destination_department && (
                  <Typography variant="caption" color="error">
                    {form.formState.errors.destination_department.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Attention Person */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Attention Person"
                fullWidth
                {...form.register("attention_person")}
                error={!!form.formState.errors.attention_person}
                helperText={form.formState.errors.attention_person?.message}
                margin="normal"
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  {...form.register("status")}
                  defaultValue="DRAFT"
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SENT">Sent</MenuItem>
                  <MenuItem value="RECEIVED">Received</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                {...form.register("notes")}
                error={!!form.formState.errors.notes}
                helperText={form.formState.errors.notes?.message}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Invoice Selection Section */}
          <Typography variant="h6" gutterBottom>
            Select Invoices
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select the invoices to include in this SPI
          </Typography>

          <TextField
            label="Search Invoices"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer sx={{ mt: 2, maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedInvoices.length > 0 &&
                        selectedInvoices.length < filteredInvoices.length
                      }
                      checked={
                        filteredInvoices.length > 0 &&
                        selectedInvoices.length === filteredInvoices.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices(
                            filteredInvoices.map((i) => i.id)
                          );
                        } else {
                          setSelectedInvoices([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>PO Number</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleInvoiceSelection(invoice.id)}
                        />
                      </TableCell>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{invoice.supplier_name}</TableCell>
                      <TableCell>{invoice.po_no || "-"}</TableCell>
                      <TableCell>
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => {
                form.reset();
                setSelectedInvoices([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              Create SPI
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
