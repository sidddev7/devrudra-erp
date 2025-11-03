"use client";

import { Dropdown, Button } from "antd";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { 
  BulbOutlined, 
  BulbFilled,
  DesktopOutlined,
} from "@ant-design/icons";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="text"
        icon={<BulbOutlined />}
        className="text-base"
        style={{ color: "#93674d" }}
      />
    );
  }

  const menuItems = [
    {
      key: "light",
      label: (
        <div className="flex items-center gap-2">
          <FiSun className="text-base" />
          <span>Light</span>
        </div>
      ),
      onClick: () => setTheme("light"),
    },
    {
      key: "dark",
      label: (
        <div className="flex items-center gap-2">
          <FiMoon className="text-base" />
          <span>Dark</span>
        </div>
      ),
      onClick: () => setTheme("dark"),
    },
    {
      key: "system",
      label: (
        <div className="flex items-center gap-2">
          <FiMonitor className="text-base" />
          <span>System</span>
        </div>
      ),
      onClick: () => setTheme("system"),
    },
  ];

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <FiSun className="text-base" />;
      case "dark":
        return <FiMoon className="text-base" />;
      case "system":
        return <FiMonitor className="text-base" />;
      default:
        return <BulbOutlined />;
    }
  };

  return (
    <Dropdown
      menu={{ items: menuItems, selectable: true, selectedKeys: [theme || "system"] }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Button
        type="text"
        icon={getThemeIcon()}
        className="text-base"
        style={{ color: "#93674d" }}
      />
    </Dropdown>
  );
}

