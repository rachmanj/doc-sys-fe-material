import * as z from "zod";

export const createInvoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  supplier_id: z.string().min(1, "Supplier is required"),
  invoice_date: z.string().min(1, "Invoice date is required"),
  receive_date: z.string().min(1, "Receive date is required"),
  po_no: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  amount: z.string().min(1, "Amount is required"),
  type_id: z.string().min(1, "Invoice type is required"),
  remarks: z.string().optional(),
  receive_project: z.string().optional(),
  invoice_project: z.string().optional(),
  payment_project: z.string().optional(),
});

export type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;
