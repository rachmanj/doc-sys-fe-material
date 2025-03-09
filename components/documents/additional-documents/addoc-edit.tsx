"use client";

import { useEffect, useState } from "react";
import { AdditionalDocument } from "@/types/additional-document";
import { getCookie } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/components/theme/ThemeProvider";
import { toast } from "react-toastify";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Autocomplete from "@mui/material/Autocomplete";
import SaveIcon from "@mui/icons-material/Save";

interface DocumentType {
  id: number;
  type_name: string;
  name?: string;
}

interface AddocEditProps {
  id: string;
}

export const AddocEdit = ({ id }: AddocEditProps) => {
  const { mode } = useAppTheme();
  const [document, setDocument] = useState<AdditionalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const router = useRouter();

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
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const token = getCookie("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch document");
        const result = await response.json();

        // Process distributions data to ensure it's in the correct format
        if (result.data && result.data.distributions) {
          result.data.distributions = result.data.distributions.map(
            (dist: any) => ({
              id: dist.id || `dist-${Math.random().toString(36).substr(2, 9)}`,
              location_code:
                typeof dist.location_code === "string"
                  ? dist.location_code
                  : "Unknown",
              created_at: dist.created_at || new Date().toISOString(),
            })
          );
        }

        setDocument(result.data);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
    fetchDocumentTypes();
  }, [id]);

  useEffect(() => {
    if (document && documentTypes.length > 0) {
      // Get the type ID from the document's type object
      const typeId = document.type?.id;
      if (typeId) {
        const foundType = documentTypes.find((type) => type.id === typeId);
        setSelectedType(foundType || null);
      }
    }
  }, [document, documentTypes]);

  const handleTypeChange = async (newType: DocumentType | null) => {
    if (!document || !newType) return;

    try {
      setIsSubmitting(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/update/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type_id: newType.id }),
        }
      );

      if (!response.ok) throw new Error("Failed to update document type");

      const result = await response.json();
      if (result.success) {
        setSelectedType(newType);
        // Convert the document type to the expected format
        const convertedType = convertDocumentType(newType);
        // Create a new document object with the updated type
        const updatedDocument = {
          ...document,
          type: convertedType,
        };
        setDocument(updatedDocument);
        toast.success("Document type updated successfully");
      } else {
        throw new Error(result.message || "Failed to update document type");
      }
    } catch (error) {
      console.error("Error updating document type:", error);
      toast.error("Failed to update document type");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert DocumentType to the format expected by AdditionalDocument
  const convertDocumentType = (
    docType: DocumentType
  ): { id: number; name: string } => {
    return {
      id: docType.id,
      name: docType.type_name,
    };
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!document) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Document not found
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Document Details
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Document Number"
              value={document.document_number || ""}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <Autocomplete
                value={selectedType}
                onChange={(_, newValue) => handleTypeChange(newValue)}
                options={documentTypes}
                getOptionLabel={(option) => option.type_name}
                loading={isLoadingTypes}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Document Type"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingTypes || isSubmitting ? (
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
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Document Date"
              value={
                document.document_date
                  ? new Date(document.document_date).toLocaleDateString()
                  : ""
              }
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Receive Date"
              value={
                document.receive_date
                  ? new Date(document.receive_date).toLocaleDateString()
                  : ""
              }
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="PO Number"
              value={document.po_no || ""}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Status"
              value={document.status || ""}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remarks"
              value={document.remarks || ""}
              multiline
              rows={4}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
