export interface Supplier {
  id: number;
  name: string;
  sap_code: string;
}

export interface InvoiceType {
  id: number;
  type_name: string;
}

export interface AdditionalDocument {
  id: number;
  type_id: number;
  document_number: string;
  document_date: string;
  po_no: string;
  project: string | null;
  receive_date: string | null;
  remarks: string | null;
  status: string;
  cur_loc: string;
  ito_creator: string;
  grpo_no: string;
  origin_wh: string;
  destination_wh: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  code: string;
}

export interface CreateInvoiceProps {
  onSuccess: () => void;
}
