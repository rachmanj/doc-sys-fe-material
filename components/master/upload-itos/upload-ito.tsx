"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import Swal from "sweetalert2";
import { showToast } from "@/lib/toast";
import { getCookie } from "@/lib/cookies";

interface CheckResponse {
  success: boolean;
  message: string;
  data: {
    importable: number;
    duplicates: number;
  };
}

export function UploadIto() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showToast.error({
        message: "Please select a file first",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to upload the ITO data",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, upload it!",
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("file", file);
      const token = getCookie("token");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/ito/import-check`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data: CheckResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to process file");
        }

        let message = "";
        let icon: "success" | "warning" | "error" = "success";

        if (data.data.importable > 0 && data.data.duplicates > 0) {
          message =
            `Successfully processed file:\n\n` +
            `• ${data.data.importable} records can be imported\n` +
            `• ${data.data.duplicates} duplicate records found`;
          icon = "warning";
        } else if (data.data.importable > 0) {
          message =
            `Successfully processed file:\n\n` +
            `• ${data.data.importable} records can be imported`;
          icon = "success";
        } else if (data.data.duplicates > 0) {
          message =
            `File processed with issues:\n\n` +
            `• ${data.data.duplicates} duplicate records found`;
          icon = "error";
        } else {
          message = "No records were processed";
          icon = "error";
        }

        await Swal.fire({
          title: "Process Complete",
          text: message,
          icon: icon,
          confirmButtonColor: "#3085d6",
        });

        resetForm();
      } catch (error) {
        await Swal.fire({
          title: "Error",
          text:
            error instanceof Error
              ? error.message
              : "Failed to process file. Please check console for details.",
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="max-w-[300px]"
        />
        <Button onClick={handleUpload} disabled={!file || isProcessing}>
          <Upload className="w-4 h-4 mr-2" />
          {isProcessing ? "Processing..." : "Upload File"}
        </Button>
      </div>
    </div>
  );
}
