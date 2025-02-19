export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  receive_date: string;
  supplier_id: number;
  po_no: string;
  receive_project: string | null;
  invoice_project: string | null;
  payment_project: string | null;
  currency: string;
  amount: string;
  type_id: number;
  payment_date: string | null;
  remarks: string | null;
  cur_loc: string | null;
  status: string;
  created_by: any;
  duration1: string | null;
  duration2: string | null;
  sap_doc: string | null;
  flag: string | null;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: number;
    sap_code: string;
    name: string;
    type: string;
    city: string | null;
    payment_project: string;
    is_active: number;
    address: string | null;
    npwp: string | null;
    created_by: number;
    created_at: string;
    updated_at: string;
  };
  invoice_type?: {
    id: number;
    type_name: string;
    created_at: string | null;
    updated_at: string;
  };
}
