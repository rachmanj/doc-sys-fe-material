"use client";

import { Card } from "@/components/ui/card";

export const AddocDashboard = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold">Total Documents</h3>
          <p className="text-2xl">0</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Recent Uploads</h3>
          <p className="text-2xl">0</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Storage Used</h3>
          <p className="text-2xl">0 MB</p>
        </Card>
      </div>
    </div>
  );
};
