"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

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

  const renderDropdownMenu = (
    id: string,
    trigger: React.ReactNode,
    items: Array<{ href: string; label: string; onClick?: () => void }>
  ) => {
    return (
      <DropdownMenu
        open={openMenus[id]}
        onOpenChange={(open) =>
          setOpenMenus((prev) => ({ ...prev, [id]: open }))
        }
      >
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {items.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenMenus((prev) => ({ ...prev, [id]: false }));
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    router.push(item.href);
                  }
                }}
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
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

            {hasPermission("documents.index") &&
              renderDropdownMenu(
                "documents",
                <Button variant="ghost" className="text-white">
                  Documents
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>,
                [
                  { href: "/documents/invoices", label: "Invoices" },
                  {
                    href: "/documents/additional",
                    label: "Additional Documents",
                  },
                ]
              )}

            {hasPermission("deliveries.index") &&
              renderDropdownMenu(
                "deliveries",
                <Button variant="ghost" className="text-white">
                  Deliveries
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>,
                [
                  { href: "/tasks/pending", label: "Pending Tasks" },
                  { href: "/tasks/completed", label: "Completed Tasks" },
                  { href: "/tasks/all", label: "All Tasks" },
                ]
              )}

            {hasPermission("settings.index") && (
              <>
                {renderDropdownMenu(
                  "masterData",
                  <Button variant="ghost" className="text-white">
                    Master Data
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>,
                  [
                    { href: "/master/suppliers", label: "Suppliers" },
                    { href: "/master/departments", label: "Departments" },
                    { href: "/master/invoice-types", label: "Invoice Types" },
                    { href: "/master/addoc-types", label: "AddDoc Types" },
                  ]
                )}

                {renderDropdownMenu(
                  "settings",
                  <Button variant="ghost" className="text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>,
                  [
                    { href: "/settings/users", label: "Users" },
                    { href: "/settings/roles", label: "Roles" },
                    { href: "/settings/permissions", label: "Permissions" },
                  ]
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center">
              {renderDropdownMenu(
                "userMenu",
                <Button variant="ghost" className="text-white">
                  {user.name} ({user.project})
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>,
                [
                  { href: "/profile", label: "Profile" },
                  { href: "/change-password", label: "Change Password" },
                  {
                    href: "#",
                    label: "Logout",
                    onClick: handleLogout,
                  },
                ]
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
