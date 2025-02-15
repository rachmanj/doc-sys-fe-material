"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import SupplierTable from "@/components/master/suppliers/supplier-table";
import SupplierDialog from "@/components/master/suppliers/supplier-dialog";
import SupplierSearch from "@/components/master/suppliers/supplier-search";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCookie } from "@/lib/cookies";
import { Supplier } from "@/types/supplier";
import Swal from "sweetalert2";

interface SearchParams {
  page?: number;
  per_page?: number;
  sap_code?: string;
  name?: string;
  type?: string;
  payment_project?: string;
}

export default function SuppliersPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Supplier[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<
    Supplier | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    lastPage: 1,
    links: [],
    from: 0,
    to: 0,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchSuppliers = async (params: SearchParams = {}) => {
    try {
      setIsLoading(true);
      const token = getCookie("token");
      const queryParams = new URLSearchParams();

      // Add all non-empty params to query
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      // Always include per_page
      if (!params.per_page) {
        queryParams.append("per_page", perPage.toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/suppliers/search?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data.data);
      setTotalRows(result.data.total);
      setCurrentPage(result.data.current_page);
      setPaginationData({
        lastPage: result.data.last_page,
        links: result.data.links,
        from: result.data.from,
        to: result.data.to,
      });
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    fetchSuppliers({ ...params, page: 1 });
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = getCookie("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/suppliers/${supplier.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          Swal.fire("Deleted!", "Supplier has been deleted.", "success");
          fetchSuppliers();
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
        Swal.fire("Error!", "Failed to delete supplier.", "error");
      }
    }
  };

  const handleSave = (savedSupplier: Supplier) => {
    // Update data in place without refetching
    setData((currentData) =>
      currentData.map((item) =>
        item.id === savedSupplier.id ? savedSupplier : item
      )
    );
  };

  const handleCreate = (newSupplier: Supplier) => {
    // Add new supplier to first page and update total
    setData((currentData) => [newSupplier, ...currentData]);
    setTotalRows((prev) => prev + 1);
  };

  useEffect(() => {
    fetchSuppliers();
  }, [perPage]);

  return (
    <div className="space-y-4">
      <PageTitle title="Suppliers" subtitle="Manage suppliers" />

      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <SupplierSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
        <Button
          onClick={() => {
            setSelectedSupplier(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <SupplierTable
        data={data}
        loading={isLoading}
        totalRows={totalRows}
        perPage={perPage}
        currentPage={currentPage}
        lastPage={paginationData.lastPage}
        paginationLinks={paginationData.links}
        from={paginationData.from}
        to={paginationData.to}
        setPerPage={setPerPage}
        fetchSuppliers={fetchSuppliers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchParams={searchParams}
      />

      <SupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={selectedSupplier}
        onSave={selectedSupplier ? handleSave : handleCreate}
        refreshData={fetchSuppliers}
      />
    </div>
  );
}
