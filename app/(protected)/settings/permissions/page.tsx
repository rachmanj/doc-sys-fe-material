"use client";

import { PermissionsTable } from "@/components/settings/permissions/permissions-table";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PermissionsPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Only check permission after user is loaded
      setIsLoading(false);
      if (!hasPermission("permissions.index")) {
        router.push("/dashboard");
      }
    }
  }, [user, hasPermission, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <PermissionsTable />;
}
