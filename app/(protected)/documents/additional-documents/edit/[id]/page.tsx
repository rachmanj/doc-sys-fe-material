"use client";

import { AddocEdit } from "@/components/documents/additional-documents/addoc-edit";
import { use } from "react";
import { PageTitle } from "@/components/ui/page-title";

interface AddocEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AddocEditPage({ params }: AddocEditPageProps) {
  const resolvedParams = use(params);
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
