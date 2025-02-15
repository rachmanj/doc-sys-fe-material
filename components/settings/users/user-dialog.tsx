import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { getCookie } from "@/lib/cookies";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Swal from "sweetalert2";

interface Role {
  id: string;
  name: string;
}

interface Department {
  id: number;
  name: string;
  akronim: string;
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
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<
    Department[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      nik: "",
      project: "",
      department_id: "",
      roles: [],
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        username: user.username,
        email: user.email,
        nik: user.nik,
        project: user.project,
        department_id: user.department_id,
        roles: user.roles,
      });
    } else {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        setAvailableDepartments(result.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true);
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
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: user ? "User Updated" : "User Created",
          text: user
            ? "User has been updated successfully"
            : "New user has been created successfully",
        });
        form.reset();
        onSave(result.data);
        refreshData();
        onOpenChange(false);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (value: string) => {
    const currentRoles = form.getValues("roles");
    form.setValue(
      "roles",
      currentRoles.includes(value)
        ? currentRoles.filter((r) => r !== value)
        : [...currentRoles, value]
    );
  };

  const handleDepartmentChange = (value: string) => {
    form.setValue("department_id", value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              {...form.register("name")}
              id="name"
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              {...form.register("username")}
              id="username"
              aria-invalid={!!form.formState.errors.username}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...form.register("email")}
              id="email"
              type="email"
              aria-invalid={!!form.formState.errors.email}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nik">NIK</Label>
            <Input
              {...form.register("nik")}
              id="nik"
              aria-invalid={!!form.formState.errors.nik}
            />
            {form.formState.errors.nik && (
              <p className="text-sm text-red-500">
                {form.formState.errors.nik.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Input
              {...form.register("project")}
              id="project"
              aria-invalid={!!form.formState.errors.project}
            />
            {form.formState.errors.project && (
              <p className="text-sm text-red-500">
                {form.formState.errors.project.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              {...form.register("department_id")}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>
                  Select a department
                </SelectItem>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name} ({dept.akronim})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="grid gap-2 pt-2">
              {availableRoles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={form.watch("roles").includes(role.name)}
                    onCheckedChange={(checked) => {
                      handleRoleChange(role.name);
                    }}
                  />
                  <Label
                    htmlFor={`role-${role.id}`}
                    className="text-sm font-normal capitalize"
                  >
                    {role.name}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.roles && (
              <p className="text-sm text-red-500">
                {form.formState.errors.roles.message}
              </p>
            )}
          </div>
          {!user && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...form.register("password")}
                  id="password"
                  type="password"
                  aria-invalid={!!form.formState.errors.password}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  {...form.register("password_confirmation")}
                  id="password_confirmation"
                  type="password"
                  aria-invalid={!!form.formState.errors.password_confirmation}
                />
              </div>
            </>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : user ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
