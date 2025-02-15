import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account",
};

export default function RegisterPage() {
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
              <h1 className="text-2xl font-bold text-white">
                Create an account
              </h1>
              <p className="text-gray-400 mt-1">
                Enter your details to get started
              </p>
            </div>
          </div>
          <RegisterForm />
          <p className="mt-6 px-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-500 hover:text-blue-400 underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
