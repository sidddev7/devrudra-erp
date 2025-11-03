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
          colorBgBase: isDark ? "#1a1a1a" : "#ffffff",
          borderRadius: 6,
          fontFamily: "inherit",
        },
        components: {
          Button: {
            primaryColor: "#ffffff",
            defaultBorderColor: isDark ? "#333333" : "#d1d5db",
            defaultColor: isDark ? "#f5f5f5" : "#4a362b",
          },
          Input: {
            activeBorderColor: "#93674d", // brand-500
            hoverBorderColor: "#a98670", // brand-400
          },
          Select: {
            optionSelectedBg: isDark ? "#1f1f1f" : "#e8ddd5",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

