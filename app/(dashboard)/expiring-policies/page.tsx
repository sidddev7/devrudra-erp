"use client";

import { useEffect, useState } from "react";
import { Table, Card, Tag, Button, message, Select } from "antd";
import { BellOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { FirestoreService } from "@/client/services/firestore.service";
import { PolicyHoldersType } from "@/typescript/types";
import dayjs from "dayjs";
import { toast } from "@/lib/toaster";

export default function ExpiringPoliciesPage() {
  const [policies, setPolicies] = useState<PolicyHoldersType[]>([]);
  const [loading, setLoading] = useState(false);
  const [daysFilter, setDaysFilter] = useState(30);

  useEffect(() => {
    loadExpiringPolicies();
  }, [daysFilter]);

  const loadExpiringPolicies = async () => {
    setLoading(true);
    const result = await FirestoreService.getExpiringPolicies(daysFilter);
    if (result.success) {
      setPolicies(result.data as PolicyHoldersType[]);
    }
    setLoading(false);
  };

  const handleSendReminder = (policy: PolicyHoldersType) => {
    // In a real application, this would send an email or SMS
    toast.success(`Reminder sent to ${policy.name} successfully!`);
  };

  const getDaysUntilExpiry = (endDate: string | Date) => {
    const today = dayjs();
    const expiry = dayjs(endDate);
    return expiry.diff(today, "days");
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
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (phone: string) => (
        <span>
          <PhoneOutlined /> {phone}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <span>
          <MailOutlined /> {email || "N/A"}
        </span>
      ),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => dayjs(date).format("DD-MM-YYYY"),
      sorter: (a: PolicyHoldersType, b: PolicyHoldersType) =>
        dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
    },
    {
      title: "Days Until Expiry",
      key: "daysUntilExpiry",
      render: (_: any, record: PolicyHoldersType) => {
        const days = getDaysUntilExpiry(record.endDate);
        const color = days <= 7 ? "red" : days <= 15 ? "orange" : "yellow";
        return <Tag color={color}>{days} days</Tag>;
      },
      sorter: (a: PolicyHoldersType, b: PolicyHoldersType) =>
        getDaysUntilExpiry(a.endDate) - getDaysUntilExpiry(b.endDate),
    },
    {
      title: "Premium Amount",
      dataIndex: "premiumAmount",
      key: "premiumAmount",
      render: (amount: number) => `₹${amount?.toLocaleString()}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PolicyHoldersType) => (
        <Button
          type="primary"
          size="small"
          icon={<BellOutlined />}
          onClick={() => handleSendReminder(record)}
        >
          Send Reminder
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Expiring Policies
          </h1>
          <p className="text-gray-600">
            Policies expiring in the next {daysFilter} days
          </p>
        </div>
        <Select
          value={daysFilter}
          onChange={setDaysFilter}
          style={{ width: 200 }}
          options={[
            { value: 7, label: "Next 7 days" },
            { value: 15, label: "Next 15 days" },
            { value: 30, label: "Next 30 days" },
            { value: 60, label: "Next 60 days" },
            { value: 90, label: "Next 90 days" },
          ]}
        />
      </div>

      {policies.length === 0 && !loading ? (
        <Card>
          <div className="text-center py-12">
            <BellOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
            <p className="text-gray-500 mt-4">
              No policies expiring in the next {daysFilter} days
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={policies}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </div>
  );
}

