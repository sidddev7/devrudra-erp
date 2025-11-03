"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Drawer,
  Form,
  Popconfirm,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  PolicyHoldersType,
  PolicyFormDrawerType,
  QueryParamType,
} from "@/typescript/types";
import PolicyHolderForm from "@/client/components/forms/PolicyHolderForm";
import { useDispatch, useSelector } from "react-redux";
import {
  setPolicies,
  setPolicyCount,
  removePolicy,
} from "@/lib/redux/slices/policySlice";
import { RootState } from "@/lib/redux/store";
import { toast } from "@/lib/toaster";
import { PolicyHolderService } from "@/client/services/policyHolder.service";
import { CommonSearchInput } from "@/client/components/common/CommonSearchInput";
import dayjs from "dayjs";

export default function PoliciesPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const policies = useSelector(
    (state: RootState) => state.policyHolder.policyHolderList
  );
  const totalCount = useSelector((state: RootState) => state.policyHolder.count);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    expired: 0,
    expiringSoon: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderBy, setOrderBy] = useState<string>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [drawerState, setDrawerState] = useState<PolicyFormDrawerType>({
    open: false,
    mode: "Add",
  });

  useEffect(() => {
    loadPolicies();
    loadStatistics();
  }, [currentPage, pageSize, orderBy, order, searchTerm]);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const queryParams: QueryParamType = {
        search: searchTerm,
        page: currentPage,
        limit: pageSize,
        orderBy,
        order,
      };

      const result = await PolicyHolderService.getAll(queryParams);

      if (result.success) {
        dispatch(setPolicies(result.data as PolicyHoldersType[]));
        dispatch(setPolicyCount(result.count || 0));
      } else {
        toast.error(result.error || "Failed to load policies");
      }
    } catch (error: any) {
      toast.error(error.message || "Error loading policies");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    const result = await PolicyHolderService.getStatistics();
    if (result.success) {
      setStatistics(result.data);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await PolicyHolderService.delete(id);
      if (result.success) {
        toast.success(result.message || "Policy deleted successfully");
        dispatch(removePolicy(id));
        loadPolicies();
        loadStatistics();
      } else {
        toast.error(result.error || "Failed to delete policy");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (policy: PolicyHoldersType) => {
    setDrawerState({
      open: true,
      mode: "Edit",
      policy,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerState({ open: false, mode: "Add" });
    form.resetFields();
    loadPolicies();
    loadStatistics();
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (pagination.current !== currentPage) {
      setCurrentPage(pagination.current);
    }
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
      setCurrentPage(1);
    }
    if (sorter.field) {
      setOrderBy(sorter.field);
      setOrder(sorter.order === "ascend" ? "asc" : "desc");
    }
  };

  const columns = [
    {
      title: "Policy Number",
      dataIndex: "policyNumber",
      key: "policyNumber",
      width: 120,
      fixed: "left" as const,
      render: (text: string) => (
        <span className="font-mono text-xs font-semibold">{text}</span>
      ),
    },
    {
      title: "Policy Holder",
      dataIndex: "name",
      key: "name",
      width: 150,
      ellipsis: true,
      render: (text: string) => (
        <span className="font-medium capitalize">{text}</span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 110,
      render: (text: string) => (
        <span className="text-xs">{text || "N/A"}</span>
      ),
    },
    {
      title: "Premium",
      dataIndex: "premiumAmount",
      key: "premiumAmount",
      width: 110,
      align: "right" as const,
      sorter: true,
      render: (amount: number) => (
        <span className="font-semibold text-xs">
          ₹{amount ? (amount / 1000).toFixed(0) + "K" : "0"}
        </span>
      ),
    },
    {
      title: "Agent",
      key: "agentName",
      width: 120,
      ellipsis: true,
      render: (_: any, record: PolicyHoldersType) => {
        const agent = record.agent as any;
        return (
          <span className="text-xs">
            {agent?.name ? agent.name : typeof agent === "string" ? agent : "N/A"}
          </span>
        );
      },
    },
    {
      title: "Provider",
      key: "providerName",
      width: 120,
      ellipsis: true,
      render: (_: any, record: PolicyHoldersType) => {
        const provider = record.insuranceProvider as any;
        return (
          <span className="text-xs">
            {provider?.name ? provider.name : typeof provider === "string" ? provider : "N/A"}
          </span>
        );
      },
    },
    {
      title: "Vehicle Class",
      key: "vehicleClassName",
      width: 120,
      ellipsis: true,
      render: (_: any, record: PolicyHoldersType) => {
        const vehicle = record.vehicleType as any;
        return (
          <span className="text-xs">
            {vehicle?.name ? vehicle.name : typeof vehicle === "string" ? vehicle : "N/A"}
          </span>
        );
      },
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 100,
      sorter: true,
      render: (date: string) => (
        <span className="text-gray-600 text-xs">
          {dayjs(date).format("DD/MM/YY")}
        </span>
      ),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      width: 100,
      sorter: true,
      render: (date: string) => (
        <span className="text-gray-600 text-xs">
          {dayjs(date).format("DD/MM/YY")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: "green",
          expired: "red",
          "expiring-soon": "orange",
        };
        const iconMap: Record<string, any> = {
          active: <CheckCircleOutlined />,
          expired: <CloseCircleOutlined />,
          "expiring-soon": <ExclamationCircleOutlined />,
        };
        return (
          <Tag color={colorMap[status] || "default"} icon={iconMap[status]}>
            {status?.toUpperCase() || "N/A"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 150,
      render: (_: any, record: PolicyHoldersType) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Policy"
            description={
              <div>
                Are you sure you want to delete policy{" "}
                <strong>{record.policyNumber}</strong>?
                <br />
                This action cannot be undone.
              </div>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} type="link" danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 w-full max-w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FileTextOutlined />
              Policies
            </h1>
            <p className="text-gray-600 mt-1">
              Manage insurance policies and policy holders
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setDrawerState({ open: true, mode: "Add" })}
          >
            Add Policy
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[12, 12]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Policies"
              value={statistics.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Active Policies"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Expired Policies"
              value={statistics.expired}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Expiring Soon"
              value={statistics.expiringSoon}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#fa8c16", fontSize: "20px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <CommonSearchInput
            placeholder="Search by policy number, name, phone, or email..."
            onSearch={handleSearch}
            autoSearch={true}
            className="w-full md:w-auto md:flex-1"
          />
          <Select
            placeholder="Sort by"
            size="large"
            style={{ width: 200 }}
            value={`${orderBy}-${order}`}
            onChange={(value) => {
              const [field, direction] = value.split("-");
              setOrderBy(field);
              setOrder(direction as "asc" | "desc");
            }}
            options={[
              { label: "Newest First", value: "createdAt-desc" },
              { label: "Oldest First", value: "createdAt-asc" },
              { label: "Name (A-Z)", value: "name-asc" },
              { label: "Name (Z-A)", value: "name-desc" },
              { label: "Premium (Low-High)", value: "premiumAmount-asc" },
              { label: "Premium (High-Low)", value: "premiumAmount-desc" },
              { label: "Start Date (Recent)", value: "startDate-desc" },
              { label: "Start Date (Oldest)", value: "startDate-asc" },
            ]}
          />
        </div>
      </Card>

      {/* Table Section */}
      <Card>
        <Table
          columns={columns}
          dataSource={policies as PolicyHoldersType[]}
          loading={loading}
          rowKey="id"
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} policies`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1500 }}
          size="small"
        />
      </Card>

      {/* Drawer for Add/Edit */}
      <Drawer
        title={`${drawerState.mode} Policy`}
        open={drawerState.open}
        onClose={handleCloseDrawer}
        width={900}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {drawerState.mode === "Add" ? "Create" : "Update"}
            </Button>
          </div>
        }
      >
        <PolicyHolderForm
          data={drawerState}
          setData={setDrawerState}
          form={form}
          onClose={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}
