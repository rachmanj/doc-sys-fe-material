"use client";

export const AddocDashboard = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add dashboard cards/stats here */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Total Documents</h3>
          <p className="text-2xl">0</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Recent Uploads</h3>
          <p className="text-2xl">0</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Storage Used</h3>
          <p className="text-2xl">0 MB</p>
        </div>
      </div>
    </div>
  );
};
