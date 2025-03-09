"use client";

import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Department } from "@/types/department";
import { Project } from "@/types/project";
import Swal from "sweetalert2";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department;
  onSave: (department: Department) => void;
  refreshData: () => void;
}

const departmentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  project: z.string().min(1, "Project is required"),
  location_code: z.string().nullable(),
  transit_code: z.string().nullable(),
  akronim: z.string().min(1, "Acronym is required"),
  sap_code: z.string().nullable(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export default function DepartmentDialog({
  open,
  onOpenChange,
  department,
  onSave,
  refreshData,
}: DepartmentDialogProps) {
  const { mode } = useAppTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      project: "",
      location_code: "",
      transit_code: "",
      akronim: "",
      sap_code: "",
    },
  });

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const result = await response.json();
      setProjects(result.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch projects",
      });
    } finally {
      setProjectsLoading(false);
    }
  };

  // Update form when department changes
  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        project: department.project,
        location_code: department.location_code || "",
        transit_code: department.transit_code || "",
        akronim: department.akronim,
        sap_code: department.sap_code || "",
      });
    } else {
      reset({
        name: "",
        project: "",
        location_code: "",
        transit_code: "",
        akronim: "",
        sap_code: "",
      });
    }
  }, [department, reset]);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const onSubmit = async (data: DepartmentFormValues) => {
    setIsSubmitting(true);
    try {
      const token = getCookie("token");
      const url = department
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments/${department.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments`;
      const method = department ? "PUT" : "POST";

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
        throw new Error(result.message || "Failed to save department");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: department
          ? "Department updated successfully"
          : "Department created successfully",
        timer: 1500,
      });

      onSave(result.data);
      onOpenChange(false);
      refreshData();
    } catch (error) {
      console.error("Error saving department:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save department",
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
        {department ? "Edit Department" : "Add New Department"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    margin="normal"
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="akronim"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Acronym"
                    fullWidth
                    margin="normal"
                    required
                    error={!!errors.akronim}
                    helperText={errors.akronim?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="project"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={!!errors.project}
                    required
                  >
                    <InputLabel>Project</InputLabel>
                    <Select
                      {...field}
                      label="Project"
                      disabled={isSubmitting || projectsLoading}
                    >
                      {projectsLoading ? (
                        <MenuItem disabled>Loading projects...</MenuItem>
                      ) : (
                        projects.map((project) => (
                          <MenuItem key={project.id} value={project.code}>
                            {project.name} ({project.code})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.project && (
                      <FormHelperText>{errors.project.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="sap_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="SAP Code"
                    fullWidth
                    margin="normal"
                    value={field.value || ""}
                    error={!!errors.sap_code}
                    helperText={errors.sap_code?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="location_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Location Code"
                    fullWidth
                    margin="normal"
                    value={field.value || ""}
                    error={!!errors.location_code}
                    helperText={errors.location_code?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="transit_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Transit Code"
                    fullWidth
                    margin="normal"
                    value={field.value || ""}
                    error={!!errors.transit_code}
                    helperText={errors.transit_code?.message}
                    disabled={isSubmitting}
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
