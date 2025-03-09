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
import { getCookie } from "@/lib/cookies";

const permissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

interface Permission {
  id: string;
  name: string;
  guard_name: string;
}

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: Permission | null;
  onSuccess: () => void;
}

export function PermissionDialog({
  open,
  onOpenChange,
  permission,
  onSuccess,
}: PermissionDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof permissionSchema>>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: permission?.name || "",
    },
  });

  useEffect(() => {
    if (permission) {
      form.reset({
        name: permission.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [permission, form]);

  async function onSubmit(values: z.infer<typeof permissionSchema>) {
    try {
      setLoading(true);
      const url = permission
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/permissions/${permission.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/permissions`;
      const method = permission ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to save permission");
      }

      onSuccess();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Permission ${permission ? "updated" : "created"} successfully`,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {permission ? "Edit Permission" : "Create Permission"}
          </DialogTitle>
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
