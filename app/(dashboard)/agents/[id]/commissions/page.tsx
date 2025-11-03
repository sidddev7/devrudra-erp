"use client";

import { useEffect, useState } from "react";
import { Card, Table, Statistic, Row, Col, Button } from "antd";
import { DollarOutlined, FileTextOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { FirestoreService } from "@/client/services/firestore.service";
import { COLLECTIONS, PolicyHoldersType, AgentType } from "@/typescript/types";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

export default function AgentCommissionsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [policies, setPolicies] = useState<PolicyHoldersType[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load agent details
      const agentResult = await FirestoreService.getById(
        COLLECTIONS.AGENTS,
        params.id
      );

      if (agentResult.success) {
        setAgent(agentResult.data as AgentType);
      }

      // Load agent's policies
      const result = await FirestoreService.getPoliciesByAgent(params.id);

      if (result.success) {
        const agentPolicies = result.data as PolicyHoldersType[];
        setPolicies(agentPolicies);

        // Calculate total commission
        const total = agentPolicies.reduce(
          (sum, policy) => sum + (policy.agentCommission || 0),
          0
        );
        setTotalCommission(total);
      }
    } catch (error) {
      console.error("Error loading agent commissions:", error);
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
      title: "Agent Rate (%)",
      dataIndex: "agentRate",
      key: "agentRate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "Agent Commission",
      dataIndex: "agentCommission",
      key: "agentCommission",
      render: (amount: number) => (
        <span className="font-bold text-green-600">
          ₹{amount?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => dayjs(date).format("DD-MM-YYYY"),
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
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/agents")}
          className="mb-4"
        >
          Back to Agents
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">
          {agent?.name || "Agent"} - Commission Details
        </h1>
        <p className="text-gray-600">
          Track all commissions earned by this agent
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Policies"
              value={policies.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Commission Earned"
              value={totalCommission}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Average Commission per Policy"
              value={policies.length > 0 ? totalCommission / policies.length : 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Commission Breakdown" className="shadow-md">
        <Table
          columns={columns}
          dataSource={policies}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          summary={(pageData) => {
            let totalPremium = 0;
            let totalCommission = 0;

            pageData.forEach(({ premiumAmount, agentCommission }) => {
              totalPremium += premiumAmount || 0;
              totalCommission += agentCommission || 0;
            });

            return (
              <Table.Summary.Row className="font-bold bg-gray-50">
                <Table.Summary.Cell index={0} colSpan={2}>
                  Total
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  ₹{totalPremium.toLocaleString()}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>-</Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <span className="text-green-600">
                    ₹{totalCommission.toLocaleString()}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} colSpan={2}>
                  -
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
}


