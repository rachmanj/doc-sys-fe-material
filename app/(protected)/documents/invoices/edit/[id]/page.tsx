"use client";

import { useRouter, useSearchParams } from "next/navigation";
import EditInvoice from "@/components/documents/invoices/edit-invoice";
import { use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import InvoiceAttachments from "@/components/documents/invoices/invoice-attachments";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const invoiceId = parseInt(resolvedParams.id);

  const handleReturn = () => {
    router.push("/documents/invoices?tab=list");
    router.refresh();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
        <Button variant="ghost" onClick={handleReturn} type="button">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </div>

      <Tabs defaultValue="detail" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detail">Detail</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="detail">
          <EditInvoice
            invoiceId={invoiceId}
            onSuccess={handleReturn}
            onCancel={handleReturn}
          />
        </TabsContent>

        <TabsContent value="distribution">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Distribution Information
            </h2>
            {/* Distribution content will go here */}
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <InvoiceAttachments invoiceId={invoiceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
