"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LpdEdit } from "@/components/deliveries/lpd/lpd-edit";

export default function EditLpdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const lpdId = parseInt(resolvedParams.id);

  const handleReturn = () => {
    router.push("/deliveries/lpd");
    router.refresh();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit LPD</h1>
        <Button variant="ghost" onClick={handleReturn} type="button">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to LPDs
        </Button>
      </div>

      <LpdEdit lpdId={lpdId} onSuccess={handleReturn} onCancel={handleReturn} />
    </div>
  );
}
