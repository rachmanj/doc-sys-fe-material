"use client";

import { useRouter } from "next/navigation";
import EditInvoice from "@/components/documents/invoices/edit-invoice";
import { use } from "react";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const invoiceId = parseInt(resolvedParams.id);

  const handleReturn = () => {
    router.push("/documents/invoices");
    // router.refresh();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
      </div>

      <EditInvoice
        invoiceId={invoiceId}
        onSuccess={handleReturn}
        onCancel={handleReturn}
      />
    </div>
  );
}
