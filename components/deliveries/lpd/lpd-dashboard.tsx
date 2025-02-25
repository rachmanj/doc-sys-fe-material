"use client";

import { Card } from "@/components/ui/card";

export const LpdDashboard = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Total LPDs
          </p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">0</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
      </Card>
    </div>
  );
};
