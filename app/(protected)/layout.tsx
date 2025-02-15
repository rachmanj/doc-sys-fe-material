"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by verifying token exists
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
