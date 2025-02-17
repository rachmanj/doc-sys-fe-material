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
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { InvoiceType } from "@/types/invoice-type";
import { showToast } from "@/lib/toast";

interface InvoiceTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceType?: InvoiceType;
  onSave: (invoiceType: InvoiceType) => void;
  refreshData: () => void;
}

const invoiceTypeFormSchema = z.object({
  type_name: z.string().min(1, "Type name is required"),
});

type InvoiceTypeFormValues = z.infer<typeof invoiceTypeFormSchema>;

export default function InvoiceTypeDialog({
  open,
  onOpenChange,
  invoiceType,
  onSave,
  refreshData,
}: InvoiceTypeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceTypeFormValues>({
    resolver: zodResolver(invoiceTypeFormSchema),
    defaultValues: {
      type_name: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (invoiceType) {
        form.reset({
          type_name: invoiceType.type_name,
        });
      } else {
        form.reset({
          type_name: "",
        });
      }
    }
  }, [invoiceType, form, open]);

  const onSubmit = async (data: InvoiceTypeFormValues) => {
    try {
      setIsSubmitting(true);
      const token = getCookie("token");
      const url = `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }/api/master/invoice-types${invoiceType ? `/${invoiceType.id}` : ""}`;

      const response = await fetch(url, {
        method: invoiceType ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save invoice type");
      }

      if (result.success) {
        showToast.success({
          message: invoiceType
            ? "Invoice type updated successfully"
            : "Invoice type created successfully",
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
            {invoiceType ? "Edit Invoice Type" : "Create Invoice Type"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type_name">Type Name</Label>
            <Input
              {...form.register("type_name")}
              id="type_name"
              placeholder="Enter type name"
            />
            {form.formState.errors.type_name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.type_name.message}
              </p>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : invoiceType ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
