"use client";

import { useState, useEffect } from "react";
import { AdditionalDocument } from "@/types/additional-document";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";

interface SearchParams {
  page?: number;
  per_page?: number;
  document_number?: string;
  type_id?: string;
  po_no?: string;
  date_from?: string;
  date_to?: string;
}

interface DocumentType {
  id: number;
  type_name: string;
}

export const AddocTable = () => {
  const { mode } = useAppTheme();
  const [data, setData] = useState<AdditionalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    lastPage: 1,
    links: [],
    from: 0,
    to: 0,
  });
  const [searchValues, setSearchValues] = useState<SearchParams>({
    document_number: "",
    type_id: "all",
    po_no: "",
    date_from: "",
    date_to: "",
  });
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();
  const [page, setPage] = useState(0);

  const fetchDocuments = async (params: SearchParams = {}) => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value && !(key === "type_id" && value === "all")) {
          queryParams.append(key, value.toString());
        }
      });

      if (!params.per_page) {
        queryParams.append("per_page", perPage.toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/search?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch documents");

      const result = await response.json();
      setData(result.data);
      setTotalRows(result.meta.total);
      setCurrentPage(result.meta.current_page);
      setPaginationData({
        lastPage: result.meta.last_page,
        links: result.meta.links,
        from: result.meta.from,
        to: result.meta.to,
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
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
    }
  };

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
    fetchDocuments({ ...searchValues, page: newPage + 1 });
  };

  const handlePerRowsChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newPerPage = parseInt(event.target.value, 10);
    setPerPage(newPerPage);
    setPage(0);
    fetchDocuments({ ...searchValues, per_page: newPerPage, page: 1 });
  };

  const handleSearch = () => {
    setPage(0);
    fetchDocuments({ ...searchValues, page: 1 });
  };

  const handleReset = () => {
    setSearchValues({
      document_number: "",
      type_id: "all",
      po_no: "",
      date_from: "",
      date_to: "",
    });
    setPage(0);
    fetchDocuments({ page: 1 });
  };

  useEffect(() => {
    fetchDocumentTypes();
    fetchDocuments();
  }, []);

  const getStatusChip = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Chip label="Open" color="success" variant="outlined" size="small" />
        );
      default:
        return (
          <Chip
            label={status}
            color="default"
            variant="outlined"
            size="small"
          />
        );
    }
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Document Number"
              placeholder="Search document number..."
              size="small"
              value={searchValues.document_number}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  document_number: e.target.value,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-select-label">Document Type</InputLabel>
              <Select
                labelId="type-select-label"
                label="Document Type"
                value={searchValues.type_id}
                onChange={(e) =>
                  setSearchValues((prev) => ({
                    ...prev,
                    type_id: e.target.value,
                  }))
                }
              >
                <MenuItem value="all">All Types</MenuItem>
                {documentTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id.toString()}>
                    {type.type_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="PO Number"
              placeholder="Search PO number..."
              size="small"
              value={searchValues.po_no}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  po_no: e.target.value,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Date From"
              type="date"
              size="small"
              value={searchValues.date_from}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  date_from: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Date To"
              type="date"
              size="small"
              value={searchValues.date_to}
              onChange={(e) =>
                setSearchValues((prev) => ({
                  ...prev,
                  date_to: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Search"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="documents table">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Document Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Document Date</TableCell>
                <TableCell>Receive Date</TableCell>
                <TableCell>PO Number</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow key="loading-row">
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">No documents found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((doc, index) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>
                      {(currentPage - 1) * perPage + index + 1}
                    </TableCell>
                    <TableCell>{doc.document_number}</TableCell>
                    <TableCell>
                      {doc.type?.name || `Type ${doc.type?.id}`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(doc.document_date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      {doc.receive_date
                        ? format(new Date(doc.receive_date), "dd MMM yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>{doc.po_no || "-"}</TableCell>
                    <TableCell>{doc.cur_loc || "-"}</TableCell>
                    <TableCell>{getStatusChip(doc.status)}</TableCell>
                    <TableCell>{doc.invoice?.invoice_number || "-"}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title="View document">
                          <IconButton
                            aria-label="view"
                            size="small"
                            color="primary"
                            onClick={() =>
                              window.open(doc.attachment || "#", "_blank")
                            }
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit document">
                          <IconButton
                            aria-label="edit"
                            size="small"
                            color="primary"
                            onClick={() =>
                              router.push(
                                `/documents/additional-documents/edit/${doc.id}`
                              )
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={perPage}
          onRowsPerPageChange={handlePerRowsChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Box>
  );
};
