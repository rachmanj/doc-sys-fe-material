export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  nik: string;
  project: string;
  department_id: string | number;
  department?:
    | string
    | {
        id: string | number;
        name: string;
      };
  location_code?: string;
  roles: string[];
  permissions: string[];
  created_at: string;
  updated_at: string;
}
