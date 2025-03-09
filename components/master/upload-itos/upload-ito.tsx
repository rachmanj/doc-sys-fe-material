"use client";

import { useState, useRef } from "react";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import Swal from "sweetalert2";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

// Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DownloadIcon from "@mui/icons-material/Download";

interface CheckResponse {
  success: boolean;
  message: string;
  data: {
    importable: number;
    duplicates: number;
  };
}

export function UploadIto() {
  const { mode } = useAppTheme();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResponse | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setCheckResult(null);
      setUploadSuccess(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setCheckResult(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select a file first",
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
      try {
        setIsProcessing(true);
        const token = getCookie("token");
        const formData = new FormData();
        formData.append("file", file);

        // First check the file
        const checkResponse = await fetch(
          getApiEndpoint("/api/master/ito/check"),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const checkData = await checkResponse.json();
        setCheckResult(checkData);

        if (!checkData.success) {
          throw new Error(checkData.message);
        }

        // If check is successful, proceed with upload
        if (checkData.data.importable > 0) {
          const uploadResponse = await fetch(
            getApiEndpoint("/api/master/ito/import"),
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          const uploadData = await uploadResponse.json();

          if (!uploadData.success) {
            throw new Error(uploadData.message);
          }

          setUploadSuccess(true);
          Swal.fire({
            icon: "success",
            title: "Success",
            text: uploadData.message,
          });
        } else {
          Swal.fire({
            icon: "info",
            title: "No Data to Import",
            text: "There are no new records to import.",
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error instanceof Error ? error.message : "Failed to upload file",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = getCookie("token");
      const response = await fetch(getApiEndpoint("/api/master/ito/template"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ito_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading template:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to download template",
      });
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload ITO Excel File
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select an Excel file containing ITO data to upload. The system
              will validate the data before importing.
            </Typography>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              sx={{ mb: 2 }}
            >
              Download Template
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadFileIcon />}
                disabled={isProcessing}
                fullWidth
                sx={{ mb: 2, py: 1.5 }}
              >
                Select Excel File
              </Button>
            </label>

            {file && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Selected File</AlertTitle>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FileUploadIcon />
                  )
                }
                onClick={handleUpload}
                disabled={!file || isProcessing}
                fullWidth
              >
                {isProcessing ? "Processing..." : "Upload & Process"}
              </Button>

              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={resetForm}
                disabled={isProcessing || !file}
              >
                Reset
              </Button>
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              height: "100%",
              bgcolor: mode === "dark" ? "background.paper" : "#f9f9f9",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Upload Results
            </Typography>

            {!checkResult && !isProcessing && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Upload a file to see the results here.
              </Typography>
            )}

            {isProcessing && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 4,
                }}
              >
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Processing file...
                </Typography>
              </Box>
            )}

            {checkResult && (
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity={checkResult.success ? "success" : "error"}
                  sx={{ mb: 2 }}
                >
                  <AlertTitle>
                    {checkResult.success
                      ? "File Validated"
                      : "Validation Error"}
                  </AlertTitle>
                  {checkResult.message}
                </Alert>

                {checkResult.success && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Summary:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">
                        Records to import:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {checkResult.data.importable}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2">
                        Duplicate records:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {checkResult.data.duplicates}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {uploadSuccess ? (
                      <Alert severity="success">
                        <AlertTitle>Upload Complete</AlertTitle>
                        The data has been successfully imported.
                      </Alert>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Click "Upload & Process" to import the data.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
