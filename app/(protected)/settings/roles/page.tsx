"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PageTitle } from "@/components/ui/page-title";
import { RolesTable } from "@/components/settings/roles/roles-table";
import { useAuth } from "@/hooks/use-auth";

export default function RolesPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
      if (!hasPermission("roles.index")) {
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

  return (
    <div className="container mx-auto py-6">
      <PageTitle title="Roles" subtitle="Manage roles" />
      <RolesTable />
    </div>
  );
}
