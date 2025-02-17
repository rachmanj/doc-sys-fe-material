"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import DepartmentTable from "@/components/master/departments/department-table";
import DepartmentDialog from "@/components/master/departments/department-dialog";
import DepartmentSearch from "@/components/master/departments/department-search";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCookie } from "@/lib/cookies";
import { Department } from "@/types/department";
import { showToast } from "@/lib/toast";
import Swal from "sweetalert2";

interface SearchParams {
  page?: number;
  per_page?: number;
  code?: string;
  name?: string;
}

export default function DepartmentsPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Department[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    lastPage: 1,
    links: [],
    from: 0,
    to: 0,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchDepartments = async (params: SearchParams = {}) => {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments/search?${queryParams}`,
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
      console.error("Error fetching departments:", error);
      showToast.error({
        message: "Failed to fetch departments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    fetchDepartments({ ...params, page: 1 });
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setDialogOpen(true);
  };

  const handleDelete = async (department: Department) => {
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/master/departments/${department.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          showToast.success({
            message: "Department deleted successfully",
          });
          fetchDepartments(searchParams);
        } else {
          throw new Error("Failed to delete department");
        }
      } catch (error) {
        console.error("Error deleting department:", error);
        showToast.error({
          message: "Failed to delete department",
        });
      }
    }
  };

  const handleSave = (savedDepartment: Department) => {
    setData((currentData) =>
      currentData.map((item) =>
        item.id === savedDepartment.id ? savedDepartment : item
      )
    );
  };

  const handleCreate = (newDepartment: Department) => {
    setData((currentData) => [newDepartment, ...currentData]);
    setTotalRows((prev) => prev + 1);
  };

  useEffect(() => {
    fetchDepartments();
  }, [perPage]);

  return (
    <div className="space-y-4">
      <PageTitle title="Departments" subtitle="Manage departments" />

      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <DepartmentSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
        <Button
          onClick={() => {
            setSelectedDepartment(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      <DepartmentTable
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
        fetchDepartments={fetchDepartments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchParams={searchParams}
      />

      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={selectedDepartment}
        onSave={selectedDepartment ? handleSave : handleCreate}
        refreshData={fetchDepartments}
      />
    </div>
  );
}
