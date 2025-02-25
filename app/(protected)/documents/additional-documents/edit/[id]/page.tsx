"use client";

import { use } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { AddocEdit } from "@/components/documents/additional-documents/addoc-edit";

interface Params {
  id: string;
}

export default function AddocEditPage({ params }: { params: any }) {
  const resolvedParams = use(params) as Params;

  return (
    <div className="space-y-4">
      <PageTitle
        title="Edit Additional Document"
        subtitle="Edit the details of the additional document"
      />
      <AddocEdit id={resolvedParams.id} />
    </div>
  );
}
