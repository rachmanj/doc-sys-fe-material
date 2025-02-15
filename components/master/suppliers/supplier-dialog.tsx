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
import Swal from "sweetalert2";
import { Supplier } from "@/types/supplier";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier;
  onSave: (supplier: Supplier) => void;
  refreshData: () => void;
}

const supplierFormSchema = z.object({
  sap_code: z.string().nullable(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["vendor", "customer"]).default("vendor"),
  city: z.string().nullable(),
  payment_project: z.string().default("001H"),
  is_active: z.boolean().default(true),
  address: z.string().nullable(),
  npwp: z.string().nullable(),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export default function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSave,
  refreshData,
}: SupplierDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      sap_code: "",
      name: "",
      type: "vendor",
      city: "",
      payment_project: "001H",
      is_active: true,
      address: "",
      npwp: "",
    },
  });

  useEffect(() => {
    if (supplier) {
      form.reset({
        sap_code: supplier.sap_code || "",
        name: supplier.name,
        type: supplier.type,
        city: supplier.city || "",
        payment_project: supplier.payment_project,
        is_active: supplier.is_active,
        address: supplier.address || "",
        npwp: supplier.npwp || "",
      });
    }
  }, [supplier, form]);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      setIsSubmitting(true);
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/suppliers${
          supplier ? `/${supplier.id}` : ""
        }`,
        {
          method: supplier ? "PUT" : "POST",
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
          title: supplier ? "Supplier Updated" : "Supplier Created",
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
            {supplier ? "Edit Supplier" : "Create Supplier"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sap_code">SAP Code</Label>
            <Input
              {...form.register("sap_code")}
              id="sap_code"
              placeholder="Enter SAP code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              {...form.register("name")}
              id="name"
              placeholder="Enter supplier name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              {...form.register("type")}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="vendor">Vendor</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              {...form.register("city")}
              id="city"
              placeholder="Enter city"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_project">Payment Project</Label>
            <Input
              {...form.register("payment_project")}
              id="payment_project"
              placeholder="Enter payment project code"
              defaultValue="001H"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...form.register("is_active")}
              id="is_active"
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              {...form.register("address")}
              id="address"
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="npwp">NPWP</Label>
            <Input
              {...form.register("npwp")}
              id="npwp"
              placeholder="Enter NPWP number"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : supplier ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
