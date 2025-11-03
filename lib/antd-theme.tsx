"use client";

import { ConfigProvider, theme } from "antd";
import { ReactNode, useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function AntdThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { theme: currentTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the actual theme to use
  const activeTheme = mounted
    ? currentTheme === "system"
      ? systemTheme
      : currentTheme
    : "light";

  const isDark = activeTheme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#93674d", // brand-500 (logo color)
          colorSuccess: "#16a34a", // green-600
          colorWarning: "#ea580c", // orange-600
          colorError: "#dc2626", // red-600
          colorInfo: "#93674d", // brand-500
          colorLink: "#93674d", // brand-500
          colorLinkHover: "#7a5a42", // brand-600
          colorBgBase: isDark ? "#1a1f26" : "#ffffff",
          borderRadius: 6,
          fontFamily: "inherit",
        },
        components: {
          Button: {
            primaryColor: "#ffffff",
            defaultBorderColor: isDark ? "#3d444d" : "#d1d5db",
            defaultColor: isDark ? "#e5e7eb" : "#4a362b",
          },
          Input: {
            activeBorderColor: "#93674d", // brand-500
            hoverBorderColor: "#bfa491", // brand-300
          },
          Select: {
            optionSelectedBg: isDark ? "#2d333b" : "#e8ddd5",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

