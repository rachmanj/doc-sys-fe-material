import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";

interface User {
  id: number;
  name: string;
  email: string;
  project: string;
  department: string;
  roles: string[];
  permissions: string[];
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getCookie("token");
      if (!token) {
        router.push("/login");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUser(userData); // Remove .data since the response is direct
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("user");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const hasPermission = (permission: string) => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  };

  return { user, loading, hasPermission, hasRole };
}
