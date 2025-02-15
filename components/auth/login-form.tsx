"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import { setCookie } from "@/lib/cookies";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  login: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

interface LoginResponse {
  status: string;
  user: {
    name: string;
    username: string;
    email: string;
    nik: string;
    project: string;
    department: string;
    is_active: boolean;
  };
  token: string;
  errors?: Record<string, string[]>;
}

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: Object.values(data.errors).flat().join("\n"),
          });
          return;
        }
        throw new Error("Login failed");
      }

      if (data.status === "success") {
        setCookie("token", data.token, 7);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="login"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Username or Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your username or email"
                  {...field}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  {...field}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <div className="pt-2">
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
