"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag } from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { FirestoreService } from "@/client/services/firestore.service";
import { COLLECTIONS, PolicyHoldersType } from "@/typescript/types";
import dayjs from "dayjs";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    expiringPolicies: 0,
    totalAgents: 0,
    totalRevenue: 0,
    totalCommissions: 0,
  });
  const [recentPolicies, setRecentPolicies] = useState<PolicyHoldersType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [policiesRes, agentsRes, expiringRes] = await Promise.all([
        FirestoreService.getAll(COLLECTIONS.POLICY_HOLDERS, {
          orderByField: "createdAt",
          orderDirection: "desc",
          limitCount: 10,
        }),
        FirestoreService.getAll(COLLECTIONS.AGENTS),
        FirestoreService.getExpiringPolicies(30),
      ]);

      if (policiesRes.success) {
        const policies = policiesRes.data as PolicyHoldersType[];
        const activePolicies = policies.filter((p) => p.status === "active");
        const totalRevenue = policies.reduce(
          (sum, p) => sum + (p.ourProfit || 0),
          0
        );
        const totalCommissions = policies.reduce(
          (sum, p) => sum + (p.agentCommission || 0),
          0
        );

        setStats({
          totalPolicies: policies.length,
          activePolicies: activePolicies.length,
          expiringPolicies: expiringRes.data?.length || 0,
          totalAgents: agentsRes.data?.length || 0,
          totalRevenue,
          totalCommissions,
        });

        setRecentPolicies(policies);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "Policy Number",
      dataIndex: "policyNumber",
      key: "policyNumber",
    },
    {
      title: "Policy Holder",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Premium Amount",
      dataIndex: "premiumAmount",
      key: "premiumAmount",
      render: (amount: number) => `₹${amount?.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "active"
            ? "green"
            : status === "expired"
            ? "red"
            : "orange";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => dayjs(date).format("DD-MM-YYYY"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to Dev Rudra Consultancy</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Policies"
              value={stats.totalPolicies}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Policies"
              value={stats.activePolicies}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Expiring Soon"
              value={stats.expiringPolicies}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Agents"
              value={stats.totalAgents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <Statistic
              title="Total Commissions"
              value={stats.totalCommissions}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Policies" className="shadow-md">
        <Table
          columns={columns}
          dataSource={recentPolicies}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}

