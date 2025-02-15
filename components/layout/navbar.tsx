"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Settings } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/hooks/use-auth";
import { deleteCookie } from "@/lib/cookies";

interface User {
  name: string;
  project: string;
  username: string;
  email: string;
}

export function Navbar() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCookie("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    });
  };

  return (
    <nav className="bg-gray-900 text-white fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between">
          {/* Logo/Typography */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold">
              IRR-NEXT
            </Link>
          </div>

          {/* Menu Items */}
          <div className="hidden md:flex items-center space-x-8">
            {hasPermission("dashboard.index") && (
              <Link href="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
            )}
            {hasPermission("documents.index") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white">
                    Documents
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link href="/documents/invoices" className="w-full">
                      Invoices
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/documents/additional" className="w-full">
                      Additional Documents
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {hasPermission("deliveries.index") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white">
                    Deliveries
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link href="/tasks/pending" className="w-full">
                      Pending Tasks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/tasks/completed" className="w-full">
                      Completed Tasks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/tasks/all" className="w-full">
                      All Tasks
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {hasPermission("settings.index") && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white">
                      Master Data
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Link href="/master/suppliers" className="w-full">
                        Suppliers
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/master/invoice-types" className="w-full">
                        Invoice Types
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/master/addoc-types" className="w-full">
                        AddDoc Types
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Link href="/settings/users" className="w-full">
                        Users
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/settings/roles" className="w-full">
                        Roles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/settings/permissions" className="w-full">
                        Permissions
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white">
                    {user.name} ({user.project})
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/change-password" className="w-full">
                      Change Password
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <button className="w-full text-left" onClick={handleLogout}>
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
