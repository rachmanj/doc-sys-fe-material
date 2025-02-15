export interface User {
  name: string;
  username: string;
  email: string;
  nik: string | null;
  project: string | null;
  department: string | null;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

interface Role {
  name: string;
  permissions: string[];
}
