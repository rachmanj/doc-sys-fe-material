"use client";

import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import Swal from "sweetalert2";
import { Supplier } from "@/types/supplier";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier;
  onSave: (supplier: Supplier) => void;
  refreshData: () => void;
}

const supplierFormSchema = z.object({
  sap_code: z.string().nullable(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["vendor", "customer"]).default("vendor"),
  city: z.string().nullable(),
  payment_project: z.string().default("001H"),
  is_active: z.boolean().default(true),
  address: z.string().nullable(),
  npwp: z.string().nullable(),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export default function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSave,
  refreshData,
}: SupplierDialogProps) {
  const { mode } = useAppTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      sap_code: "",
      name: "",
      type: "vendor",
      city: "",
      payment_project: "001H",
      is_active: true,
      address: "",
      npwp: "",
    },
  });

  // Update form when supplier changes
  useEffect(() => {
    if (supplier) {
      reset({
        sap_code: supplier.sap_code || "",
        name: supplier.name,
        type: supplier.type,
        city: supplier.city || "",
        payment_project: supplier.payment_project,
        is_active: supplier.is_active,
        address: supplier.address || "",
        npwp: supplier.npwp || "",
      });
    } else {
      reset({
        sap_code: "",
        name: "",
        type: "vendor",
        city: "",
        payment_project: "001H",
        is_active: true,
        address: "",
        npwp: "",
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    setIsSubmitting(true);
    try {
      const token = getCookie("token");
      const url = supplier
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/suppliers/${supplier.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/suppliers`;
      const method = supplier ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save supplier");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: supplier
          ? "Supplier updated successfully"
          : "Supplier created successfully",
        timer: 1500,
      });

      onSave(result.data);
      onOpenChange(false);
      refreshData();
    } catch (error) {
      console.error("Error saving supplier:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save supplier",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {supplier ? "Edit Supplier" : "Add New Supplier"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="sap_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="SAP Code"
                    fullWidth
                    margin="normal"
                    value={field.value || ""}
                    error={!!errors.sap_code}
                    helperText={errors.sap_code?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal" error={!!errors.type}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type" disabled={isSubmitting}>
                      <MenuItem value="vendor">Vendor</MenuItem>
                      <MenuItem value="customer">Customer</MenuItem>
                    </Select>
                    {errors.type && (
                      <FormHelperText>{errors.type.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    margin="normal"
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    margin="normal"
                    value={field.value || ""}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="payment_project"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Payment Project"
                    fullWidth
                    margin="normal"
                    error={!!errors.payment_project}
                    helperText={errors.payment_project?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    value={field.value || ""}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="npwp"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="NPWP"
                    fullWidth
                    margin="normal"
                    value={field.value || ""}
                    error={!!errors.npwp}
                    helperText={errors.npwp?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="is_active"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={isSubmitting}
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
