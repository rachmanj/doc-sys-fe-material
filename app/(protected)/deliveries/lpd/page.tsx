"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { LpdDashboard } from "@/components/deliveries/lpd/lpd-dashboard";
import { LpdTable } from "@/components/deliveries/lpd/lpd-table";
import { LpdCreate } from "@/components/deliveries/lpd/lpd-create";

export default function LpdPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">LPD Management</h2>
        <p className="text-muted-foreground">
          Manage your Local Port Delivery documents
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <LpdDashboard />
        </TabsContent>
        <TabsContent value="list">
          <LpdTable />
        </TabsContent>
        <TabsContent value="create">
          <LpdCreate />
        </TabsContent>
      </Tabs>
    </div>
  );
}
