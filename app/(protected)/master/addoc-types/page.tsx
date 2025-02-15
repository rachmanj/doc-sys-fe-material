"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import AddocTypeTable from "@/components/master/addoc-types/addoctype-table";
import AddocTypeDialog from "@/components/master/addoc-types/addoctype-dialog";
import AddocTypeSearch from "@/components/master/addoc-types/addoctype-search";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCookie } from "@/lib/cookies";
import { AddocType } from "@/types/addoc-type";
import Swal from "sweetalert2";

interface SearchParams {
  page?: number;
  per_page?: number;
  code?: string;
  name?: string;
}

export default function AddocTypesPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AddocType[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAddocType, setSelectedAddocType] = useState<
    AddocType | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    lastPage: 1,
    links: [],
    from: 0,
    to: 0,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchAddocTypes = async (params: SearchParams = {}) => {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/document-types/search?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      console.error("Error fetching document types:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch document types",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    fetchAddocTypes({ ...params, page: 1 });
  };

  const handleEdit = (addocType: AddocType) => {
    setSelectedAddocType(addocType);
    setDialogOpen(true);
  };

  const handleDelete = async (addocType: AddocType) => {
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/document-types/${addocType.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Document type has been deleted.",
          timer: 1500,
        });

        fetchAddocTypes(searchParams);
      } catch (error) {
        console.error("Error deleting document type:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete document type",
        });
      }
    }
  };

  const handleSave = (savedAddocType: AddocType) => {
    setData((currentData) =>
      currentData.map((item) =>
        item.id === savedAddocType.id ? savedAddocType : item
      )
    );
  };

  const handleCreate = (newAddocType: AddocType) => {
    setData((currentData) => [newAddocType, ...currentData]);
    setTotalRows((prev) => prev + 1);
  };

  useEffect(() => {
    fetchAddocTypes();
  }, [perPage]);

  return (
    <div className="space-y-4">
      <PageTitle
        title="Additional Document Types"
        subtitle="Manage additional document types"
      />

      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <AddocTypeSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
        <Button
          onClick={() => {
            setSelectedAddocType(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Document Type
        </Button>
      </div>

      <AddocTypeTable
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
        fetchAddocTypes={fetchAddocTypes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchParams={searchParams}
      />

      <AddocTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        addocType={selectedAddocType}
        onSave={selectedAddocType ? handleSave : handleCreate}
        refreshData={() => fetchAddocTypes(searchParams)}
      />
    </div>
  );
}
