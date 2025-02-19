"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCookie } from "@/lib/cookies";
import { Invoice } from "@/types/invoice"; // You'll need to create this type
import InvoiceList from "@/components/documents/invoices/invoice-list"; // We'll create these components
import InvoiceDashboard from "@/components/documents/invoices/invoice-dashboard";
import CreateInvoice from "@/components/documents/invoices/create-invoice";

interface SearchParams {
  page?: number;
  per_page?: number;
  invoice_number?: string;
  supplier_name?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export default function InvoicesPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Invoice[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    lastPage: 1,
    links: [],
    from: 0,
    to: 0,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchInvoices = async (params: SearchParams = {}) => {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/invoices/search?${queryParams}`,
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
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    fetchInvoices({ ...params, page: 1 });
  };

  useEffect(() => {
    fetchInvoices();
  }, [perPage]);

  return (
    <div className="space-y-4">
      <PageTitle
        title="Invoices Management"
        subtitle="Manage and track all invoices"
      />

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <InvoiceDashboard />
        </TabsContent>

        <TabsContent value="list">
          <InvoiceList
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
            fetchInvoices={fetchInvoices}
            onSearch={handleSearch}
            searchParams={searchParams}
          />
        </TabsContent>

        <TabsContent value="create">
          <CreateInvoice
            onSuccess={() => {
              fetchInvoices(searchParams);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
