"use client";

import { useState, useEffect, useRef } from "react";
import { getCookie } from "@/lib/cookies";
import Swal from "sweetalert2";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";

// Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";

interface Attachment {
  id: number;
  original_name: string;
  mime_type: string;
  size: number;
  file_url: string;
  created_at: string;
}

interface InvoiceAttachmentsProps {
  invoiceId: number;
}

export default function InvoiceAttachments({
  invoiceId,
}: InvoiceAttachmentsProps) {
  const { mode } = useAppTheme();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = async () => {
    try {
      setIsLoading(true);
      const token = getCookie("token");
      console.log("Fetching attachments for invoice:", invoiceId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/${invoiceId}/attachments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch attachments");

      const result = await response.json();
      console.log("Attachments response:", result);
      setAttachments(result.data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load attachments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [invoiceId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      setIsUploading(true);
      const formData = new FormData();

      console.log("Files to upload:", e.target.files);
      Array.from(e.target.files).forEach((file) => {
        formData.append("attachments[]", file);
        console.log("Appending file:", file.name);
      });

      console.log("Invoice ID:", invoiceId);

      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/${invoiceId}/upload-attachments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      console.log("Upload response:", result);

      if (result.success) {
        // Fetch updated attachments list
        await fetchAttachments();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: result.message,
          timer: 1500,
        });
      }

      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to upload files",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone. This will permanently delete the attachment.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      setIsDeleting(true);
      console.log("Deleting attachment:", id);

      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/attachments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Delete failed");

      const deleteResult = await response.json();
      console.log("Delete response:", deleteResult);

      setAttachments((prev) => prev.filter((att) => att.id !== id));
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "File deleted successfully",
        timer: 1500,
      });
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete file",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon fontSize="large" color="primary" />;
    } else if (mimeType === "application/pdf") {
      return <PictureAsPdfIcon fontSize="large" color="error" />;
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      return <DescriptionIcon fontSize="large" color="primary" />;
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    ) {
      return <InsertDriveFileIcon fontSize="large" color="success" />;
    } else {
      return <InsertDriveFileIcon fontSize="large" />;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Invoice Attachments</Typography>
        <Box>
          <input
            type="file"
            multiple
            style={{ display: "none" }}
            id="file-upload"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          />
          <Button
            variant="contained"
            component="label"
            htmlFor="file-upload"
            startIcon={
              isUploading ? <CircularProgress size={20} /> : <UploadFileIcon />
            }
            disabled={isUploading}
          >
            Upload Files
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : attachments.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No attachments found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {attachments.map((attachment) => (
            <Grid item xs={12} sm={6} md={4} key={attachment.id}>
              <Card
                elevation={1}
                sx={{
                  height: "100%",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardMedia
                  sx={{
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.03)",
                  }}
                >
                  {attachment.mime_type.startsWith("image/") ? (
                    <img
                      src={attachment.file_url}
                      alt={attachment.original_name}
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    getFileIcon(attachment.mime_type)
                  )}
                </CardMedia>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    title={attachment.original_name}
                    gutterBottom
                  >
                    {attachment.original_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(attachment.size)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => window.open(attachment.file_url, "_blank")}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(attachment.id)}
                      disabled={isDeleting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}
