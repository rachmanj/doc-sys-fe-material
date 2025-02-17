import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Department } from "@/types/department";
import { Project } from "@/types/project";
import { showToast } from "@/lib/toast";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      project: "",
      location_code: null,
      transit_code: null,
      akronim: "",
      sap_code: null,
    },
  });

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/projects/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const result = await response.json();
      setProjects(result.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToast.error({
        message: "Failed to fetch projects",
      });
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProjects();
      if (department) {
        form.reset({
          name: department.name,
          project: department.project,
          location_code: department.location_code,
          transit_code: department.transit_code,
          akronim: department.akronim,
          sap_code: department.sap_code,
        });
      } else {
        form.reset({
          name: "",
          project: "",
          location_code: null,
          transit_code: null,
          akronim: "",
          sap_code: null,
        });
      }
    }
  }, [department, form, open]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      setIsSubmitting(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments${
          department ? `/${department.id}` : ""
        }`,
        {
          method: department ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save department");
      }

      if (result.success) {
        showToast.success({
          message: department
            ? "Department updated successfully"
            : "Department created successfully",
        });
        form.reset();
        onSave(result.data);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error:", error);
      showToast.error({
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Department" : "Create Department"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              {...form.register("name")}
              id="name"
              placeholder="Enter department name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select
              onValueChange={(value) => form.setValue("project", value)}
              value={form.watch("project")}
              disabled={isLoadingProjects}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.code} value={project.code}>
                    {project.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.project && (
              <p className="text-sm text-red-500">
                {form.formState.errors.project.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="akronim">Acronym</Label>
            <Input
              {...form.register("akronim")}
              id="akronim"
              placeholder="Enter department acronym"
            />
            {form.formState.errors.akronim && (
              <p className="text-sm text-red-500">
                {form.formState.errors.akronim.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sap_code">SAP Code</Label>
            <Input
              {...form.register("sap_code")}
              id="sap_code"
              placeholder="Enter SAP code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_code">Location Code</Label>
            <Input
              {...form.register("location_code")}
              id="location_code"
              placeholder="Enter location code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transit_code">Transit Code</Label>
            <Input
              {...form.register("transit_code")}
              id="transit_code"
              placeholder="Enter transit code"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingProjects}>
              {isSubmitting ? "Saving..." : department ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
