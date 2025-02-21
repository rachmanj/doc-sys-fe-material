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
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCookie } from "@/lib/cookies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DocumentType {
  id: number;
  type_name: string;
}

const formSchema = z.object({
  type_id: z.string().min(1, "Document type is required"),
  document_number: z.string().min(1, "Document number is required"),
  document_date: z.string().min(1, "Document date is required"),
  receive_date: z.string().min(1, "Receive date is required"),
  po_no: z.string().optional(),
  remarks: z.string().optional(),
  file: z.instanceof(File, { message: "File is required" }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddocCreateProps {
  onSuccess?: () => void;
}

export const AddocCreate = ({ onSuccess }: AddocCreateProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [openDocType, setOpenDocType] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type_id: "",
      document_number: "",
      document_date: "",
      receive_date: "",
      po_no: "",
      remarks: "",
    },
  });

  const fetchDocumentTypes = async () => {
    try {
      setIsLoadingTypes(true);
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
      showToast.error({
        message: "Failed to load document types",
      });
    } finally {
      setIsLoadingTypes(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "file") {
          formData.append(key, value);
        } else if (value) {
          formData.append(key, value.toString());
        }
      });

      console.log("Form values:", values);
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/store`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to create document");
      const result = await response.json();
      console.log("Response from backend:", result);

      showToast.success({
        message: "Document created successfully",
      });
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating document:", error);
      showToast.error({
        message: "Failed to create document",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Document Type</FormLabel>
                  <Popover open={openDocType} onOpenChange={setOpenDocType}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoadingTypes}
                        >
                          {field.value
                            ? documentTypes.find(
                                (type) => type.id.toString() === field.value
                              )?.type_name || "Select type"
                            : "Select type"}
                          {isLoadingTypes ? (
                            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                          ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search document type..." />
                        <CommandEmpty>No document type found.</CommandEmpty>
                        <CommandGroup heading="Document Types">
                          <div className="max-h-[300px] overflow-auto">
                            {documentTypes.map((type) => (
                              <CommandItem
                                key={type.id}
                                value={type.type_name}
                                onSelect={() => {
                                  form.setValue("type_id", type.id.toString(), {
                                    shouldValidate: true,
                                  });
                                  setOpenDocType(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    type.id.toString() === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {type.type_name}
                              </CommandItem>
                            ))}
                          </div>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="document_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="po_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Document
          </Button>
        </form>
      </Form>
    </Card>
  );
};
