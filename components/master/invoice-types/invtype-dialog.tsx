"use client";

import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { InvoiceType } from "@/types/invoice-type";
import Swal from "sweetalert2";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

interface InvoiceTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceType?: InvoiceType;
  onSave: (invoiceType: InvoiceType) => void;
  refreshData: () => void;
}

const invoiceTypeFormSchema = z.object({
  type_name: z.string().min(1, "Type name is required"),
});

type InvoiceTypeFormValues = z.infer<typeof invoiceTypeFormSchema>;

export default function InvoiceTypeDialog({
  open,
  onOpenChange,
  invoiceType,
  onSave,
  refreshData,
}: InvoiceTypeDialogProps) {
  const { mode } = useAppTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceTypeFormValues>({
    resolver: zodResolver(invoiceTypeFormSchema),
    defaultValues: {
      type_name: "",
    },
  });

  // Update form when invoiceType changes
  useEffect(() => {
    if (invoiceType) {
      reset({
        type_name: invoiceType.type_name,
      });
    } else {
      reset({
        type_name: "",
      });
    }
  }, [invoiceType, reset]);

  const onSubmit = async (data: InvoiceTypeFormValues) => {
    setIsSubmitting(true);
    try {
      const token = getCookie("token");
      const url = invoiceType
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/invoice-types/${invoiceType.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/invoice-types`;
      const method = invoiceType ? "PUT" : "POST";

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
        throw new Error(result.message || "Failed to save invoice type");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: invoiceType
          ? "Invoice type updated successfully"
          : "Invoice type created successfully",
        timer: 1500,
      });

      onSave(result.data);
      onOpenChange(false);
      refreshData();
    } catch (error) {
      console.error("Error saving invoice type:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save invoice type",
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
        {invoiceType ? "Edit Invoice Type" : "Add New Invoice Type"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="type_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Type Name"
                    fullWidth
                    margin="normal"
                    required
                    error={!!errors.type_name}
                    helperText={errors.type_name?.message}
                    disabled={isSubmitting}
                    autoFocus
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
