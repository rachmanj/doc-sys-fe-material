"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import { useAppTheme } from "@/components/theme/ThemeProvider";

export function ToastProvider() {
  const { mode } = useAppTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={mode}
    />
  );
}
