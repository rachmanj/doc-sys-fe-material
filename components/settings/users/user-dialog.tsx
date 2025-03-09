"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { getCookie } from "@/lib/cookies";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";

interface Role {
  id: string;
  name: string;
}

interface Department {
  id: number;
  name: string;
  akronim: string;
}

interface Project {
  code: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSave: (userData: Partial<User>) => void;
  refreshData: () => void;
}

// Add form schema
const userFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    nik: z.string().min(1, "NIK is required"),
    project: z.string().min(1, "Project is required"),
    department_id: z.string().min(1, "Department is required"),
    roles: z.array(z.string()).min(1, "At least one role is required"),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.password && !data.password_confirmation) return true;
      return data.password === data.password_confirmation;
    },
    {
      message: "Passwords don't match",
      path: ["password_confirmation"],
    }
  );

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserDialog({
  open,
  onOpenChange,
  user,
  onSave,
  refreshData,
}: UserDialogProps) {
  const { mode } = useAppTheme();
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<
    Department[]
  >([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      nik: user?.nik || "",
      project: user?.project || "",
      department_id: user?.department_id?.toString() || "",
      roles: user?.roles || [],
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchRoles();
      fetchDepartments();
      fetchProjects();
    }
  }, [open]);

  useEffect(() => {
    if (user) {
      console.log("User data in dialog:", user);
      console.log("Department ID:", user.department_id);
      console.log("Department:", user.department);
      console.log("Username:", user.username);

      // Manually set each field to ensure they're properly updated
      form.setValue("name", user.name || "");
      form.setValue("username", user.username || "");
      form.setValue("email", user.email || "");
      form.setValue("nik", user.nik || "");
      form.setValue("project", user.project || "");

      // Handle department_id which can be a number or string
      const deptId =
        user.department_id !== undefined && user.department_id !== null
          ? user.department_id.toString()
          : "";
      console.log("Setting department_id to:", deptId);
      form.setValue("department_id", deptId);

      form.setValue("roles", user.roles || []);

      // Clear password fields
      form.setValue("password", "");
      form.setValue("password_confirmation", "");
    } else {
      // Reset to empty values for new user
      form.reset({
        name: "",
        username: "",
        email: "",
        nik: "",
        project: "",
        department_id: "",
        roles: [],
        password: "",
        password_confirmation: "",
      });
    }
  }, [user, form]);

  const fetchRoles = async () => {
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      setAvailableRoles(data.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        console.log("Departments fetched:", result.data);
        setAvailableDepartments(result.data);

        // If user has a department_id, log if it exists in the fetched departments
        if (user && user.department_id) {
          const deptId = user.department_id.toString();
          const deptExists = result.data.some(
            (dept: Department) => dept.id.toString() === deptId
          );
          console.log(
            `Department ID ${deptId} exists in fetched departments: ${deptExists}`
          );
        }
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/projects/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const result = await response.json();
      console.log("Projects fetched:", result);
      setAvailableProjects(result);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleRoleChange = (roleName: string) => {
    const currentRoles = form.getValues("roles") || [];
    const newRoles = currentRoles.includes(roleName)
      ? currentRoles.filter((r) => r !== roleName)
      : [...currentRoles, roleName];
    form.setValue("roles", newRoles, { shouldValidate: true });
  };

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true);

      // Log the form data being submitted
      console.log("Submitting form data:", data);

      // Ensure department_id is sent as a number if it's a valid ID
      const formData = {
        ...data,
        department_id: data.department_id
          ? parseInt(data.department_id, 10)
          : null,
      };

      console.log("Processed form data:", formData);

      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users${
          user ? `/${user.id}` : ""
        }`,
        {
          method: user ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      console.log("API response:", result);

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: user ? "User Updated" : "User Created",
          text: user
            ? "User has been updated successfully"
            : "New user has been created successfully",
          timer: 1500,
        });
        onSave(result.data);
        refreshData();
        onOpenChange(false);
      } else {
        throw new Error(result.message || "Failed to save user");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !isSubmitting && onOpenChange(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Name"
                    error={!!form.formState.errors.name}
                    helperText={form.formState.errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="username"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Username"
                    error={!!form.formState.errors.username}
                    helperText={form.formState.errors.username?.message}
                    disabled={!!user}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="email"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!form.formState.errors.email}
                    helperText={form.formState.errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="nik"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="NIK"
                    error={!!form.formState.errors.nik}
                    helperText={form.formState.errors.nik?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="project"
                control={form.control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!form.formState.errors.project}
                  >
                    <InputLabel id="project-label" shrink>
                      Project
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="project-label"
                      value={field.value || ""}
                      label="Project"
                    >
                      <MenuItem value="">
                        <em>Select a project</em>
                      </MenuItem>
                      {availableProjects.map((project) => (
                        <MenuItem key={project.code} value={project.code}>
                          {project.code}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {form.formState.errors.project?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="department_id"
                control={form.control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!form.formState.errors.department_id}
                  >
                    <InputLabel id="department-label" shrink>
                      Department
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="department-label"
                      value={field.value || ""}
                      label="Department"
                    >
                      <MenuItem value="">
                        <em>Select a department</em>
                      </MenuItem>
                      {availableDepartments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id.toString()}>
                          {dept.name} ({dept.akronim})
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {form.formState.errors.department_id?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl
                component="fieldset"
                error={!!form.formState.errors.roles}
                fullWidth
              >
                <InputLabel sx={{ position: "static", mb: 1 }}>
                  Roles
                </InputLabel>
                <FormGroup>
                  {availableRoles.map((role) => (
                    <FormControlLabel
                      key={role.id}
                      control={
                        <Checkbox
                          checked={
                            form.watch("roles")?.includes(role.name) || false
                          }
                          onChange={() => handleRoleChange(role.name)}
                          disabled={isSubmitting}
                        />
                      }
                      label={role.name}
                    />
                  ))}
                </FormGroup>
                <FormHelperText>
                  {form.formState.errors.roles?.message}
                </FormHelperText>
              </FormControl>
            </Grid>

            {!user && (
              <>
                <Grid item xs={12}>
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Password"
                        type="password"
                        error={!!form.formState.errors.password}
                        helperText={form.formState.errors.password?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="password_confirmation"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        error={!!form.formState.errors.password_confirmation}
                        helperText={
                          form.formState.errors.password_confirmation?.message
                        }
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Saving..." : user ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
