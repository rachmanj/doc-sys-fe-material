"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCookie } from "@/lib/cookies";
import { toast } from "react-toastify";
import { useAppTheme } from "@/components/theme/ThemeProvider";

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
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Autocomplete from "@mui/material/Autocomplete";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";

interface DocumentType {
  id: number;
  type_name: string;
}

const formSchema = z.object({
  type_id: z.string().min(1, "Document type is required"),
  document_number: z.string().min(1, "Document number is required"),
  document_date: z.string().min(1, "Document date is required"),
  receive_date: z.string().min(1, "Receive date is required"),
  po_no: z.string().optional(),
  remarks: z.string().optional(),
  file: z.instanceof(File, { message: "File is required" }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddocCreateProps {
  onSuccess?: () => void;
}

export const AddocCreate = ({ onSuccess }: AddocCreateProps) => {
  const { mode } = useAppTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type_id: "",
      document_number: "",
      document_date: "",
      receive_date: "",
      po_no: "",
      remarks: "",
    },
  });

  const fetchDocumentTypes = async () => {
    try {
      setIsLoadingTypes(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/document-types/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch document types");
      const result = await response.json();
      setDocumentTypes(result.data || []);
    } catch (error) {
      console.error("Error fetching document types:", error);
      toast.error("Failed to load document types");
    } finally {
      setIsLoadingTypes(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue("file", file, { shouldValidate: true });
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "file" && value instanceof File) {
          formData.append(key, value);
        } else if (value) {
          formData.append(key, value.toString());
        }
      });

      console.log("Form values:", values);
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/store`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to create document");
      const result = await response.json();
      console.log("Response from backend:", result);

      toast.success("Document created successfully");
      form.reset();
      setSelectedFile(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Document
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>
          <Grid container spacing={3}>
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
                        documentTypes.find(
                          (type) => type.id.toString() === field.value
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue ? newValue.id.toString() : "");
                      }}
                      options={documentTypes}
                      getOptionLabel={(option) => {
                        if (!option) return "";
                        return option.type_name;
                      }}
                      loading={isLoadingTypes}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Document Type"
                          error={!!form.formState.errors.type_id}
                          helperText={form.formState.errors.type_id?.message}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingTypes ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  params.InputProps.endAdornment
                                )}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="document_number"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Document Number"
                    error={!!form.formState.errors.document_number}
                    helperText={form.formState.errors.document_number?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="document_date"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Document Date"
                    type="date"
                    error={!!form.formState.errors.document_date}
                    helperText={form.formState.errors.document_date?.message}
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
                name="po_no"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="PO Number"
                    error={!!form.formState.errors.po_no}
                    helperText={form.formState.errors.po_no?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ height: "56px", width: "100%" }}
              >
                {selectedFile ? selectedFile.name : "Upload Document"}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </Button>
              {form.formState.errors.file && (
                <FormHelperText error>
                  {form.formState.errors.file.message}
                </FormHelperText>
              )}
            </Grid>

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
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                >
                  {isSubmitting ? "Saving..." : "Save Document"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
