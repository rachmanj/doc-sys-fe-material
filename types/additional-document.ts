export interface AdditionalDocument {
  id: number;
  document_number: string;
  document_date: string;
  receive_date: string | null;
  po_no: string | null;
  project: string | null;
  status: string;
  cur_loc: string | null;
  remarks: string | null;
  type: {
    id: number;
    name: string;
  };
  created_by: {
    id: number;
    name: string;
  };
  invoice: {
    id: number | null;
    invoice_number: string | null;
  };
  attachment: string | null;
  flag: string | null;
  ito_creator: string | null;
  grpo_no: string | null;
  origin_wh: string | null;
  destination_wh: string | null;
  batch_no: string | null;
  created_at: string;
  updated_at: string;
  distributions?: {
    id: number;
    location_code: string;
    created_at: string;
  }[];
}

export interface CreateAdditionalDocument {
  title: string;
  description?: string;
  file: File;
}
