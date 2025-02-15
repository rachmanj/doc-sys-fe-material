"use client";

import { useAuth } from "@/hooks/use-auth";
import { PageTitle } from "@/components/ui/page-title";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-6">
      <PageTitle title="Dashboard" subtitle="Overview of your system" />
      <div className="space-y-6">
        {user && (
          <div className="grid gap-4">
            <div className="p-6 bg-white rounded-lg shadow">
              <h4 className="font-medium mb-4">User Information</h4>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {user.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Project:</span> {user.project}
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h4 className="font-medium mb-4">Roles & Permissions</h4>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Roles:</span>{" "}
                  {user.roles?.join(", ") || "No roles assigned"}
                </p>
                <p>
                  <span className="font-medium">Permissions:</span>{" "}
                  {user.permissions?.join(", ") || "No permissions assigned"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
