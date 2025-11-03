import { notification } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  message: string;
  description?: string;
  duration?: number;
  placement?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "top" | "bottom";
}

const iconMap = {
  success: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
  error: <CloseCircleOutlined style={{ color: "#dc2626" }} />,
  info: <InfoCircleOutlined style={{ color: "#2563eb" }} />,
  warning: <ExclamationCircleOutlined style={{ color: "#ea580c" }} />,
};

const showToast = (type: ToastType, options: ToastOptions) => {
  notification[type]({
    message: options.message,
    description: options.description,
    placement: options.placement || "topRight",
    duration: options.duration || 3,
    icon: iconMap[type],
    style: {
      borderRadius: "8px",
    },
  });
};

export const toast = {
  success: (message: string, description?: string) => {
    showToast("success", { message, description });
  },
  error: (message: string, description?: string) => {
    showToast("error", { message, description });
  },
  info: (message: string, description?: string) => {
    showToast("info", { message, description });
  },
  warning: (message: string, description?: string) => {
    showToast("warning", { message, description });
  },
};

