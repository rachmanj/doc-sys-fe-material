import { AdditionalDocument } from "@/types/additional-document";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface Distribution {
  id: number;
  location_code: string;
  created_at: string;
}

interface AddocDistributionsProps {
  document: AdditionalDocument;
}

export const AddocDistributions = ({ document }: AddocDistributionsProps) => {
  // Ensure distributions is an array we can work with
  const safeDistributions = Array.isArray(document.distributions)
    ? document.distributions
    : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Distribution History</h3>
      <div className="relative overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted">
              <th className="text-left py-3 px-4">Location</th>
              <th className="text-left py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {safeDistributions.length > 0 ? (
              safeDistributions.map((dist) => (
                <tr
                  key={`dist-${dist.id || Math.random()}`}
                  className="border-b"
                >
                  <td className="py-3 px-4">
                    {String(dist.location_code || "Unknown")}
                  </td>
                  <td className="py-3 px-4">
                    {format(
                      new Date(dist.created_at || new Date()),
                      "dd MMM yyyy HH:mm"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="text-center py-4 text-muted-foreground"
                >
                  No distribution history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
