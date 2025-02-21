"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { showToast } from "@/lib/toast";
import { Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookies";
import { AdditionalDocument } from "@/types/additional-document";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const formSchema = z.object({
  type_id: z.string().min(1, "Document type is required"),
  document_number: z.string().min(1, "Document number is required"),
  document_date: z.string().min(1, "Document date is required"),
  receive_date: z.string().optional(),
  po_no: z.string().optional(),
  remarks: z.string().optional(),
  cur_loc: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddocEditDetailsProps {
  document: AdditionalDocument;
}

interface DocumentType {
  id: number;
  type_name: string;
}

export const AddocEditDetails = ({ document }: AddocEditDetailsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type_id: document.type.id.toString(),
      document_number: document.document_number,
      document_date: document.document_date,
      receive_date: document.receive_date || "",
      po_no: document.po_no || "",
      remarks: document.remarks || "",
      cur_loc: document.cur_loc || "",
    },
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = getCookie("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments/cur-locs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch locations");
        const result = await response.json();
        setLocations(result.data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
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

    fetchDocumentTypes();
  }, []);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const token = getCookie("token");

      console.log("Form values:", values);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/${document.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) throw new Error("Failed to update document");

      const result = await response.json();
      console.log("Response from backend:", result);

      showToast.success({
        message: "Document updated successfully",
      });
    } catch (error) {
      console.error("Error updating document:", error);
      showToast.error({
        message: "Failed to update document",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldUpdate = async (field: string, value: string) => {
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/${document.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [field]: value }),
        }
      );

      if (!response.ok) throw new Error("Failed to update field");
      const result = await response.json();

      showToast.success({
        message: `${field} updated successfully`,
      });
    } catch (error) {
      console.error("Error updating field:", error);
      showToast.error({
        message: `Failed to update ${field}`,
      });
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <div className="flex gap-2">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.type_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleFieldUpdate("type_id", field.value || "")
                      }
                      className="px-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleFieldUpdate("document_number", field.value || "")
                      }
                      className="px-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Date</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleFieldUpdate("document_date", field.value || "")
                      }
                      className="px-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receive_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receive Date</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleFieldUpdate("receive_date", field.value || "")
                      }
                      className="px-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="po_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Number</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleFieldUpdate("po_no", field.value || "")
                      }
                      className="px-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cur_loc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Location</FormLabel>
                  <div className="flex gap-2">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleFieldUpdate("cur_loc", field.value || "")
                      }
                      className="px-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1">
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleFieldUpdate("remarks", field.value || "")
                      }
                      className="px-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </Card>
  );
};
