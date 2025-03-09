"use client";

import { UploadIto } from "@/components/master/upload-itos/upload-ito";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export default function UploadItoPage() {
  const { mode } = useAppTheme();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          ITO Upload
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Upload ITO data from Excel file
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <UploadIto />
      </Paper>
    </Box>
  );
}
