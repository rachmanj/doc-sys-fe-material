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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Swal from "sweetalert2";
import { AddocType } from "@/types/addoc-type";

interface AddocTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addocType?: AddocType;
  onSave: (addocType: AddocType) => void;
  refreshData: () => void;
}

const addocTypeFormSchema = z.object({
  type_name: z.string().min(1, "Name is required"),
});

type AddocTypeFormValues = z.infer<typeof addocTypeFormSchema>;

export default function AddocTypeDialog({
  open,
  onOpenChange,
  addocType,
  onSave,
  refreshData,
}: AddocTypeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddocTypeFormValues>({
    resolver: zodResolver(addocTypeFormSchema),
    defaultValues: {
      type_name: "",
    },
  });

  useEffect(() => {
    if (addocType) {
      form.reset({
        type_name: addocType.type_name,
      });
    }
  }, [addocType, form]);

  const onSubmit = async (data: AddocTypeFormValues) => {
    try {
      setIsSubmitting(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/document-types${
          addocType ? `/${addocType.id}` : ""
        }`,
        {
          method: addocType ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.error) {
        setIsSubmitting(false);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message,
          timer: 1500,
        });
        return;
      }

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: addocType ? "Document Type Updated" : "Document Type Created",
          text: result.message,
          timer: 1500,
        });
        form.reset();
        onSave(result.data);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Something went wrong",
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
            {addocType ? "Edit Document Type" : "Create Document Type"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type_name">Name</Label>
            <Input
              {...form.register("type_name")}
              id="type_name"
              placeholder="Enter document type name"
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
              {isSubmitting ? "Saving..." : addocType ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
