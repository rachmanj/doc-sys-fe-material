import { UploadIto } from "@/components/master/upload-itos/upload-ito";

export default function UploadItoPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ITO Upload</h1>
        <p className="text-gray-600">Upload ITO data from Excel file</p>
      </div>
      <UploadIto />
    </div>
  );
}
