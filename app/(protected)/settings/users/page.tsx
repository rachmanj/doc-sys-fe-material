"use client";

import { useState, useEffect } from "react";

import UsersTable from "@/components/settings/users/users-table";
import UserSearch from "@/components/settings/users/user-search";
import UserDialog from "@/components/settings/users/user-dialog";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Plus as PlusIcon } from "lucide-react";
import { getCookie } from "@/lib/cookies";
import { PageTitle } from "@/components/ui/page-title";
import Swal from "sweetalert2";

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [data, setData] = useState<User[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        setData(result.data);
        setTotalRows(result.meta?.total || result.data.length);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?search=${query}&page=1&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        setData(result.data);
        setTotalRows(result.meta?.total || result.data.length);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = getCookie("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${user.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.status === "success") {
          Swal.fire("Deleted!", "User has been deleted.", "success");
          fetchUsers(1);
        }
      } catch (error) {
        Swal.fire("Error!", "Failed to delete user.", "error");
      }
    }
  };

  const handleSave = async (userData: Partial<User>) => {
    // Implement save functionality
    setIsDialogOpen(false);
    setSelectedUser(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <PageTitle title="Users" subtitle="Manage system users" />
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="mb-6">
        <UserSearch onSearch={handleSearch} isLoading={loading} />
      </div>

      <UsersTable
        data={data}
        loading={loading}
        totalRows={totalRows}
        perPage={perPage}
        setPerPage={setPerPage}
        fetchUsers={fetchUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <UserDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedUser(undefined);
        }}
        user={selectedUser}
        onSave={handleSave}
        refreshData={() => fetchUsers(1)}
      />
    </div>
  );
}
