"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import InvoiceTypeTable from "@/components/master/invoice-types/invtype-table";
import InvoiceTypeDialog from "@/components/master/invoice-types/invtype-dialog";
import InvoiceTypeSearch from "@/components/master/invoice-types/invtype-search";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCookie } from "@/lib/cookies";
import { InvoiceType } from "@/types/invoice-type";
import { showToast } from "@/lib/toast";
import Swal from "sweetalert2";

interface SearchParams {
  page?: number;
  per_page?: number;
  type_name?: string;
}

export default function InvoiceTypesPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<InvoiceType[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<
    InvoiceType | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    lastPage: 1,
    links: [],
    from: 0,
    to: 0,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchInvoiceTypes = async (params: SearchParams = {}) => {
    try {
      setIsLoading(true);
      const token = getCookie("token");
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      if (!params.per_page) {
        queryParams.append("per_page", perPage.toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/invoice-types/search?${queryParams}`,
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
      console.error("Error fetching invoice types:", error);
      showToast.error({
        message: "Failed to fetch invoice types",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    fetchInvoiceTypes({ ...params, page: 1 });
  };

  const handleEdit = (invoiceType: InvoiceType) => {
    setSelectedInvoiceType(invoiceType);
    setDialogOpen(true);
  };

  const handleDelete = async (invoiceType: InvoiceType) => {
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/invoice-types/${invoiceType.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          showToast.success({
            message: "Invoice type deleted successfully",
          });
          fetchInvoiceTypes(searchParams);
        } else {
          throw new Error("Failed to delete invoice type");
        }
      } catch (error) {
        console.error("Error deleting invoice type:", error);
        showToast.error({
          message: "Failed to delete invoice type",
        });
      }
    }
  };

  const handleSave = (savedInvoiceType: InvoiceType) => {
    setData((currentData) =>
      currentData.map((item) =>
        item.id === savedInvoiceType.id ? savedInvoiceType : item
      )
    );
  };

  const handleCreate = (newInvoiceType: InvoiceType) => {
    setData((currentData) => [newInvoiceType, ...currentData]);
    setTotalRows((prev) => prev + 1);
  };

  useEffect(() => {
    fetchInvoiceTypes();
  }, [perPage]);

  return (
    <div className="space-y-4">
      <PageTitle title="Invoice Types" subtitle="Manage invoice types" />

      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <InvoiceTypeSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
        <Button
          onClick={() => {
            setSelectedInvoiceType(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Invoice Type
        </Button>
      </div>

      <InvoiceTypeTable
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
        fetchInvoiceTypes={fetchInvoiceTypes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchParams={searchParams}
      />

      <InvoiceTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoiceType={selectedInvoiceType}
        onSave={selectedInvoiceType ? handleSave : handleCreate}
        refreshData={fetchInvoiceTypes}
      />
    </div>
  );
}
