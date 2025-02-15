import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center space-y-6 mb-8">
            <Image
              src="/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
            <div className="text-center">
              <h1 className="text-2xl text-white">IRR - Next</h1>
              <p className="text-gray-400 mt-1">Document Distribution System</p>
            </div>
          </div>
          <LoginForm />
          <p className="px-8 pb-2 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
