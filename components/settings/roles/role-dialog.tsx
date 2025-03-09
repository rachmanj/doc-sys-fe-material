"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCookie } from "@/lib/cookies";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permissions: z
    .array(z.number())
    .min(1, "At least one permission is required"),
});

interface Permission {
  id: string;
  name: string;
  guard_name: string;
}

interface Role {
  id: string;
  name: string;
  guard_name: string;
  permissions: Permission[];
}

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSuccess: () => void;
}

interface PermissionResponse {
  status: string;
  data: Permission[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: RoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || "",
      permissions: role?.permissions?.map((p) => Number(p.id)) || [],
    },
  });

  useEffect(() => {
    form.reset({
      name: role?.name || "",
      permissions: role?.permissions?.map((p) => Number(p.id)) || [],
    });
  }, [role, form]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/permissions/all`,
          {
            headers: {
              Authorization: `Bearer ${getCookie("token")}`,
              Accept: "application/json",
            },
          }
        );
        if (response.ok) {
          const { data }: PermissionResponse = await response.json();
          setPermissions(data);
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    };

    if (open) {
      fetchPermissions();
    }
  }, [open]);

  async function onSubmit(values: z.infer<typeof roleSchema>) {
    try {
      setLoading(true);
      const requestBody = {
        name: values.name,
        permissions: values.permissions.map(String),
      };

      const response = await fetch(
        role
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles/${role.id}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles`,
        {
          method: role ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("token")}`,
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save role");
      }

      onSuccess();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Role ${role ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            {role
              ? "Edit role and its permissions"
              : "Create a new role and assign permissions"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions"
              render={({ field: { onChange, value = [] } }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <FormControl>
                    <ScrollArea className="h-[200px] border rounded-md p-4">
                      <div className="space-y-2">
                        {permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={value.includes(Number(permission.id))}
                              onCheckedChange={(checked) => {
                                const permId = Number(permission.id);
                                if (checked) {
                                  onChange([...value, permId]);
                                } else {
                                  onChange(value.filter((id) => id !== permId));
                                }
                              }}
                            />
                            <label
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
