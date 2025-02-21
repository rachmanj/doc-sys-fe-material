"use client";

import { PageTitle } from "@/components/ui/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddocDashboard } from "@/components/documents/additional-documents/addoc-dashboard";
import { AddocTable } from "@/components/documents/additional-documents/addoc-table";
import { AddocCreate } from "@/components/documents/additional-documents/addoc-create";

export default function AdditionalDocumentsPage() {
  return (
    <div className="space-y-4">
      <PageTitle
        title="Additional Documents"
        subtitle="Manage and track all additional documents"
      />

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AddocDashboard />
        </TabsContent>

        <TabsContent value="list">
          <AddocTable />
        </TabsContent>

        <TabsContent value="create">
          <AddocCreate />
        </TabsContent>
      </Tabs>
    </div>
  );
}
