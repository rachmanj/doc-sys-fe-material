import { toast } from "react-toastify";

interface ToastOptions {
  message: string;
  position?:
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left";
  autoClose?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
}

export const showToast = {
  success: (options: ToastOptions) => {
    toast.success(options.message, {
      position: options.position || "top-right",
      autoClose: options.autoClose || 3000,
      hideProgressBar: options.hideProgressBar || false,
      closeOnClick: options.closeOnClick || true,
      pauseOnHover: options.pauseOnHover || true,
      draggable: options.draggable || true,
    });
  },
  error: (options: ToastOptions) => {
    toast.error(options.message, {
      position: options.position || "top-right",
      autoClose: options.autoClose || 3000,
      hideProgressBar: options.hideProgressBar || false,
      closeOnClick: options.closeOnClick || true,
      pauseOnHover: options.pauseOnHover || true,
      draggable: options.draggable || true,
    });
  },
  warning: (options: ToastOptions) => {
    toast.warning(options.message, {
      position: options.position || "top-right",
      autoClose: options.autoClose || 3000,
      hideProgressBar: options.hideProgressBar || false,
      closeOnClick: options.closeOnClick || true,
      pauseOnHover: options.pauseOnHover || true,
      draggable: options.draggable || true,
    });
  },
  info: (options: ToastOptions) => {
    toast.info(options.message, {
      position: options.position || "top-right",
      autoClose: options.autoClose || 3000,
      hideProgressBar: options.hideProgressBar || false,
      closeOnClick: options.closeOnClick || true,
      pauseOnHover: options.pauseOnHover || true,
      draggable: options.draggable || true,
    });
  },
};
