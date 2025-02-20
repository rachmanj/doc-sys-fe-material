"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, File, Trash2, Upload, Eye } from "lucide-react";
import { getCookie } from "@/lib/cookies";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";

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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      showToast.error({ message: "Failed to load attachments" });
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
        showToast.success({ message: result.message });
      }

      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      showToast.error({ message: "Failed to upload files" });
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
      showToast.success({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      showToast.error({ message: "Failed to delete file" });
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Invoice Attachments</h2>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            multiple
            className="hidden"
            id="file-upload"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          />
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              className={cn(
                "cursor-pointer transition-all",
                isUploading && "animate-pulse"
              )}
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Files
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No attachments found
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={cn(
                "border rounded-lg p-4 space-y-3",
                "hover:bg-muted/50 transition-all",
                isDeleting && "animate-pulse opacity-50"
              )}
            >
              {/* Preview Section */}
              <div className="aspect-video rounded-md border bg-muted flex items-center justify-center">
                {attachment.mime_type.startsWith("image/") ? (
                  <img
                    src={attachment.file_url}
                    alt={attachment.original_name}
                    className="h-full w-full object-cover rounded-md"
                  />
                ) : (
                  <File className="w-12 h-12 text-blue-500" />
                )}
              </div>

              {/* File Info */}
              <div className="space-y-1">
                <p
                  className="text-sm font-medium truncate"
                  title={attachment.original_name}
                >
                  {attachment.original_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:text-blue-700"
                  asChild
                >
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90"
                  onClick={() => handleDelete(attachment.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
