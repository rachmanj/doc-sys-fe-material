"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import Swal from "sweetalert2";
import { getApiEndpoint } from "@/lib/api";

// Material UI imports
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Grid from "@mui/material/Grid";

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
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch(getApiEndpoint("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      });

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
    <Box
      component="form"
      onSubmit={form.handleSubmit(onSubmit)}
      sx={{ width: "100%" }}
    >
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Full Name"
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
        name="username"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Username"
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
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
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

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
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
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            control={form.control}
            name="password_confirmation"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
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
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>

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
            <PersonAddIcon />
          )
        }
      >
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </Box>
  );
}
