"use client";

import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { AddocType } from "@/types/addoc-type";
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

interface AddocTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addocType?: AddocType;
  onSave: (addocType: AddocType) => void;
  refreshData: () => void;
}

const addocTypeFormSchema = z.object({
  type_name: z.string().min(1, "Type name is required"),
});

type AddocTypeFormValues = z.infer<typeof addocTypeFormSchema>;

export default function AddocTypeDialog({
  open,
  onOpenChange,
  addocType,
  onSave,
  refreshData,
}: AddocTypeDialogProps) {
  const { mode } = useAppTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddocTypeFormValues>({
    resolver: zodResolver(addocTypeFormSchema),
    defaultValues: {
      type_name: "",
    },
  });

  // Update form when addocType changes
  useEffect(() => {
    if (addocType) {
      reset({
        type_name: addocType.type_name,
      });
    } else {
      reset({
        type_name: "",
      });
    }
  }, [addocType, reset]);

  const onSubmit = async (data: AddocTypeFormValues) => {
    setIsSubmitting(true);
    try {
      const token = getCookie("token");
      const url = addocType
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/document-types/${addocType.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/document-types`;
      const method = addocType ? "PUT" : "POST";

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
        throw new Error(
          result.message || "Failed to save additional document type"
        );
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: addocType
          ? "Additional document type updated successfully"
          : "Additional document type created successfully",
        timer: 1500,
      });

      onSave(result.data);
      onOpenChange(false);
      refreshData();
    } catch (error) {
      console.error("Error saving additional document type:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save additional document type",
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
        {addocType
          ? "Edit Additional Document Type"
          : "Add New Additional Document Type"}
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
