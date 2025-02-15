"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
}

export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const { hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission(permission)) {
      router.push("/dashboard");
    }
  }, [permission, hasPermission, router]);

  if (!hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
}
