import { AdditionalDocument } from "@/types/additional-document";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface AddocAttachmentsProps {
  document: AdditionalDocument;
}

export const AddocAttachments = ({ document }: AddocAttachmentsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Attachments</h3>
      <div className="relative overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted">
              <th className="text-left py-3 px-4">File Name</th>
              <th className="text-left py-3 px-4">Upload Date</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {document.attachment ? (
              <tr className="border-b">
                <td className="py-3 px-4">
                  {document.document_number}-attachment
                </td>
                <td className="py-3 px-4">
                  {format(new Date(document.created_at), "dd MMM yyyy HH:mm")}
                </td>
                <td className="py-3 px-4">
                  <a
                    href={document.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </a>
                </td>
              </tr>
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-4 text-muted-foreground"
                >
                  No attachments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
