export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  nik: string;
  project: string;
  department_id: string;
  department?: {
    id: string;
    name: string;
  };
  roles: string[];
  permissions: string[];
  created_at: string;
  updated_at: string;
}
