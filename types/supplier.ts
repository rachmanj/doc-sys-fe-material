export interface Supplier {
  id: number;
  sap_code?: string;
  name: string;
  type: "vendor" | "customer";
  city?: string;
  payment_project: string;
  is_active: boolean;
  address?: string;
  npwp?: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
}
