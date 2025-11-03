"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Button,
  DatePicker,
  Tag,
  Descriptions,
  Drawer,
} from "antd";
import {
  FileTextOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { PolicyHoldersType, VehicleType } from "@/typescript/types";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import { VehicleClassService } from "@/client/services/vehicleClass.service";
import { toast } from "@/lib/toaster";
import { capitalize } from "lodash";

const { RangePicker } = DatePicker;

type SummaryType = {
  ourProfit: number;
  agentCommission: number;
  profitAfterTDS: number;
  tdsAmount: number;
  gstAmount: number;
  commission: number;
  grossAmount: number;
  premiumAmount: number;
  totalCommission: number;
};

export default function VehicleClassTransactionsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [vehicleClass, setVehicleClass] = useState<VehicleType | null>(null);
  const [transactions, setTransactions] = useState<PolicyHoldersType[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [summary, setSummary] = useState<SummaryType>({
    ourProfit: 0,
    agentCommission: 0,
    profitAfterTDS: 0,
    tdsAmount: 0,
    gstAmount: 0,
    commission: 0,
    grossAmount: 0,
    premiumAmount: 0,
    totalCommission: 0,
  });
  
  // Default date range: current month
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  useEffect(() => {
    loadVehicleClassDetails();
  }, [params.id]);

  useEffect(() => {
    if (dateRange) {
      loadTransactions();
    }
  }, [params.id, dateRange]);

  const loadVehicleClassDetails = async () => {
    try {
      const result = await VehicleClassService.getVehicleClassById(params.id);
      if (result.success) {
        setVehicleClass(result.data as VehicleType);
      } else {
        toast.error(result.error || "Failed to load vehicle class details");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const result = await VehicleClassService.getVehicleClassTransactions(
        params.id,
        dateRange[0].toISOString(),
        dateRange[1].toISOString()
      );

      if (result.success && result.data) {
        const transactionData = result.data as any;
        setTransactions(transactionData.filteredTransactions || []);
        setSummary(transactionData.sum || {
          ourProfit: 0,
          agentCommission: 0,
          profitAfterTDS: 0,
          tdsAmount: 0,
          gstAmount: 0,
          commission: 0,
          grossAmount: 0,
          premiumAmount: 0,
          totalCommission: 0,
        });
      } else {
        toast.error(result.error || "Failed to load transactions");
      }
    } catch (error: any) {
      console.error("Error loading vehicle class transactions:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const columns = [
    {
      title: "Policy No.",
      dataIndex: "policyNumber",
      key: "policyNumber",
      width: 100,
      fixed: "left" as const,
      render: (text: string) => <span className="font-mono text-xs">{text}</span>,
    },
    {
      title: "Holder",
      dataIndex: "name",
      key: "name",
      width: 120,
      ellipsis: true,
      render: (text: string) => <span className="font-medium text-xs">{text}</span>,
    },
    {
      title: "Premium",
      dataIndex: "premiumAmount",
      key: "premiumAmount",
      width: 90,
      align: "right" as const,
      render: (amount: number) => (
        <span className="font-semibold text-xs">₹{(amount/1000).toFixed(0)}K</span>
      ),
    },
    {
      title: "Comm%",
      dataIndex: "totalCommission",
      key: "totalCommission",
      width: 65,
      align: "center" as const,
      render: (rate: number) => <span className="text-xs font-medium text-blue-600">{rate}%</span>,
    },
    {
      title: "Commission",
      key: "commissionAmount",
      width: 90,
      align: "right" as const,
      render: (_: any, record: PolicyHoldersType) => {
        const commission = (record.premiumAmount * record.totalCommission) / 100;
        return (
          <span className="font-semibold text-blue-600 text-xs">
            ₹{(commission/1000).toFixed(1)}K
          </span>
        );
      },
    },
    {
      title: "TDS%",
      dataIndex: "tdsRate",
      key: "tdsRate",
      width: 60,
      align: "center" as const,
      render: (rate: number) => <span className="text-xs font-medium text-orange-600">{rate}%</span>,
    },
    {
      title: "TDS",
      key: "tdsAmount",
      width: 80,
      align: "right" as const,
      render: (_: any, record: PolicyHoldersType) => {
        const commission = (record.premiumAmount * record.totalCommission) / 100;
        const tds = commission * (record.tdsRate / 100);
        return (
          <span className="text-orange-600 text-xs">
            ₹{(tds/1000).toFixed(1)}K
          </span>
        );
      },
    },
    {
      title: "GST%",
      dataIndex: "gstRate",
      key: "gstRate",
      width: 60,
      align: "center" as const,
      render: (rate: number) => <span className="text-xs font-medium text-purple-600">{rate}%</span>,
    },
    {
      title: "GST",
      key: "gstAmount",
      width: 80,
      align: "right" as const,
      render: (_: any, record: PolicyHoldersType) => {
        const commission = (record.premiumAmount * record.totalCommission) / 100;
        const gst = commission * (record.gstRate / 100);
        return (
          <span className="text-purple-600 text-xs">
            ₹{(gst/1000).toFixed(1)}K
          </span>
        );
      },
    },
    {
      title: "Ag%",
      dataIndex: "agentRate",
      key: "agentRate",
      width: 60,
      align: "center" as const,
      render: (rate: number) => <span className="text-xs font-medium text-green-600">{rate}%</span>,
    },
    {
      title: "Agent",
      key: "agentCommission",
      width: 90,
      align: "right" as const,
      render: (_: any, record: PolicyHoldersType) => {
        const agentCommission = (record.premiumAmount * record.agentRate) / 100;
        return (
          <span className="font-bold text-green-600 text-xs">
            ₹{(agentCommission/1000).toFixed(1)}K
          </span>
        );
      },
    },
    {
      title: "Profit",
      key: "ourProfit",
      width: 90,
      align: "right" as const,
      render: (_: any, record: PolicyHoldersType) => {
        const commission = (record.premiumAmount * record.totalCommission) / 100;
        const tds = commission * (record.tdsRate / 100);
        const profitAfterTDS = commission - tds;
        const agentCommission = (record.premiumAmount * record.agentRate) / 100;
        const ourProfit = profitAfterTDS - agentCommission;
        return (
          <span className={`font-semibold text-xs ${ourProfit >= 0 ? "text-indigo-600" : "text-red-600"}`}>
            ₹{(ourProfit/1000).toFixed(1)}K
          </span>
        );
      },
    },
    {
      title: "Start",
      dataIndex: "startDate",
      key: "startDate",
      width: 85,
      render: (date: string) => (
        <span className="text-gray-600 text-xs">{dayjs(date).format("DD/MM/YY")}</span>
      ),
    },
    {
      title: "End",
      dataIndex: "endDate",
      key: "endDate",
      width: 85,
      render: (date: string) => (
        <span className="text-gray-600 text-xs">{dayjs(date).format("DD/MM/YY")}</span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 w-full max-w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/vehicle-classes")}
          size="large"
          className="mb-4"
        >
          Back to Vehicle Classes
        </Button>
        
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CarOutlined />
            {vehicleClass?.name ? capitalize(vehicleClass.name) : "Vehicle Class"} - Transaction Report
          </h1>
          <p className="text-gray-600 mt-1">
            Detailed transaction breakdown and policy history
          </p>
        </div>
      </div>

      {/* Vehicle Class Details Card */}
      {vehicleClass && (
        <Card title="Vehicle Class Information" className="shadow-sm mb-6">
          <Descriptions column={{ xs: 1, sm: 2, md: 4 }} size="small">
            <Descriptions.Item label="Vehicle Class Name">
              <span className="capitalize">{vehicleClass.name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Commission Rate">
              <Tag color="blue">{vehicleClass.commissionRate}%</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Agent Rate">
              <Tag color="green">{vehicleClass.agentRate}%</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Our Rate">
              <Tag color="purple">{vehicleClass.ourRate}%</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={vehicleClass.isActive ? "success" : "error"}>
                {vehicleClass.isActive ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Date Range Filter */}
      <Card title="Select Date Range" className="shadow-sm mb-6">
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="DD MMM YYYY"
          size="large"
          className="w-full max-w-md"
          presets={[
            { label: "This Month", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
            { label: "Last Month", value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
            { label: "Last 3 Months", value: [dayjs().subtract(3, "month"), dayjs()] },
            { label: "This Year", value: [dayjs().startOf("year"), dayjs().endOf("year")] },
            { label: "All Time", value: [dayjs().subtract(10, "year"), dayjs()] },
          ]}
        />
      </Card>

      {/* Statistics Cards */}
      <div className="mb-6">
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Policies"
                value={transactions.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#1890ff", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Premium"
                value={summary.premiumAmount}
                prefix="₹"
                precision={2}
                valueStyle={{ color: "#722ed1", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Commission"
                value={summary.commission}
                prefix="₹"
                precision={2}
                valueStyle={{ color: "#1890ff", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="TDS Deducted"
                value={summary.tdsAmount}
                prefix="₹"
                precision={2}
                valueStyle={{ color: "#fa8c16", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="GST Amount"
                value={summary.gstAmount}
                prefix="₹"
                precision={2}
                valueStyle={{ color: "#722ed1", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Gross Amount"
                value={summary.grossAmount}
                prefix="₹"
                precision={2}
                valueStyle={{ color: "#13c2c2", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Agent Commission"
                value={summary.agentCommission}
                prefix="₹"
                precision={2}
                valueStyle={{ color: "#52c41a", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Our Profit"
                value={summary.ourProfit}
                prefix="₹"
                precision={2}
                valueStyle={{ 
                  color: summary.ourProfit >= 0 ? "#722ed1" : "#ff4d4f",
                  fontSize: "20px" 
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* View Details Button */}
      <div className="flex flex-row justify-center items-center" >
        <Button
          type="primary"
          size="large"
          icon={<EyeOutlined />}
          onClick={() => setDrawerOpen(true)}
          className="w-full max-w-md"
        >
          View Transaction Details ({transactions.length} Policies)
        </Button>
      </div>

      {/* Transactions Drawer */}
      <Drawer
        title={<span className="text-lg font-semibold">Transaction Details</span>}
        placement="right"
        width="100%"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={transactions}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
              pageSizeOptions: ["10", "20", "50"],
              style: { padding: "0 16px 16px 16px" }
            }}
            scroll={{ x: 1200 }}
            size="small"
            bordered
            summary={() => (
              <Table.Summary.Row className="bg-gray-100 font-semibold">
                <Table.Summary.Cell index={0} colSpan={2}>
                  <span className="font-bold text-xs">TOTAL</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <span className="font-bold text-xs">
                    ₹{(summary.premiumAmount/1000).toFixed(0)}K
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">
                  <span className="text-xs">-</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <span className="font-bold text-blue-600 text-xs">
                    ₹{(summary.commission/1000).toFixed(1)}K
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="center">
                  <span className="text-xs">-</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <span className="font-bold text-orange-600 text-xs">
                    ₹{(summary.tdsAmount/1000).toFixed(1)}K
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="center">
                  <span className="text-xs">-</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="right">
                  <span className="font-bold text-purple-600 text-xs">
                    ₹{(summary.gstAmount/1000).toFixed(1)}K
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9} align="center">
                  <span className="text-xs">-</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={10} align="right">
                  <span className="font-bold text-green-600 text-xs">
                    ₹{(summary.agentCommission/1000).toFixed(1)}K
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={11} align="right">
                  <span className={`font-bold text-xs ${summary.ourProfit >= 0 ? "text-indigo-600" : "text-red-600"}`}>
                    ₹{(summary.ourProfit/1000).toFixed(1)}K
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={12} colSpan={2}>
                  <span className="text-xs">-</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>
      </Drawer>
    </div>
  );
}

