"use client";

import { Layout, Menu, Avatar, Dropdown, Button } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  CarOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/client/utils/firebase/firebase-auth-helpers";
import ThemeSelector from "@/client/components/common/ThemeSelector";

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Clear session cookie
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
      
      // Sign out from Firebase
      await signOut();
      
      router.push("/login");
      router.refresh(); // Force a refresh to update middleware
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      key: "/dashboard",
      icon: <HomeOutlined />,
      label: "Dashboard",
    },
    {
      key: "/policies",
      icon: <FileTextOutlined />,
      label: "Policies",
    },
    {
      key: "/agents",
      icon: <TeamOutlined />,
      label: "Agents",
    },
    {
      key: "/insurance-providers",
      icon: <BankOutlined />,
      label: "Insurance Providers",
    },
    {
      key: "/vehicle-classes",
      icon: <CarOutlined />,
      label: "Vehicle Classes",
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Users",
    },
    {
      key: "/expiring-policies",
      icon: <BellOutlined />,
      label: "Expiring Policies",
    },
  ];

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen" style={{ background: "#fafafa" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
        className="shadow-sm"
        style={{
          background: "#ffffff",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <div className="text-center py-5 font-bold text-base border-b border-gray-100" style={{ color: "#93674d" }}>
          {collapsed ? "DRC" : "Dev Rudra Consultancy"}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{
            background: "transparent",
            border: "none",
            paddingTop: "8px",
          }}
          className="custom-sidebar-menu-light"
        />
      </Sider>
      <Layout style={{ background: "#fafafa" }}>
        <Header 
          className="px-6 flex justify-between items-center"
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #f0f0f0",
            height: "64px",
            lineHeight: "64px",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-base"
            style={{ color: "#93674d" }}
          />
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                className="cursor-pointer"
                style={{ 
                  backgroundColor: "#93674d",
                  cursor: "pointer",
                }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-lg" style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}


