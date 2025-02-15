"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";

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

const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    username: z.string().min(1, { message: "Username is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

interface RegisterResponse {
  status: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: Object.values(data.errors).flat().join("\n"),
          });
          return;
        }
        throw new Error("Registration failed");
      }

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "Please login to continue",
          timer: 1500,
        }).then(() => {
          router.push("/login");
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Registration failed. Please try again.",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your username"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
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
        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Confirm Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Confirm your password"
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
