"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import Swal from "sweetalert2";
import { setCookie } from "@/lib/cookies";
import { getApiEndpoint } from "@/lib/api";
import axios from "axios";

// Material UI imports
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";

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
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      console.log("Sending to backend:", values);

      // Use fetch with credentials included
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(values),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Login failed: ${response.status} ${errorText}`);
      }

      const data: LoginResponse = await response.json();
      console.log("Response from backend:", data);

      if (data.status === "success") {
        setCookie("token", data.token, 7);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={form.handleSubmit(onSubmit)}
      sx={{ width: "100%" }}
    >
      <Controller
        control={form.control}
        name="login"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Username or Email"
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            disabled={isLoading}
            InputProps={{
              sx: { borderRadius: 1 },
            }}
          />
        )}
      />

      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            disabled={isLoading}
            InputProps={{
              sx: { borderRadius: 1 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          borderRadius: 1,
        }}
        startIcon={
          isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <LoginIcon />
          )
        }
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </Box>
  );
}
