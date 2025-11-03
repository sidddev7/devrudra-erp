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
  BankOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  InsuranceProviderType,
  InsuranceProviderFormType,
  QueryParamType,
} from "@/typescript/types";
import InsuranceProviderForm from "@/client/components/forms/InsuranceProviderForm";
import { useDispatch, useSelector } from "react-redux";
import {
  setInsuranceProviders,
  setInsuranceProviderCount,
  removeInsuranceProvider,
} from "@/lib/redux/slices/insuranceProviderSlice";
import { RootState } from "@/lib/redux/store";
import { toast } from "@/lib/toaster";
import { InsuranceProviderService } from "@/client/services/insuranceProvider.service";
import { useRouter } from "next/navigation";
import { CommonSearchInput } from "@/client/components/common/CommonSearchInput";

export default function InsuranceProvidersPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const router = useRouter();
  const insuranceProviders = useSelector(
    (state: RootState) => state.insuranceProvider.insuranceProviders
  );
  const totalCount = useSelector((state: RootState) => state.insuranceProvider.count);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCount, setActiveCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderBy, setOrderBy] = useState<string>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [drawerState, setDrawerState] = useState<InsuranceProviderFormType>({
    open: false,
    mode: "Add",
  });

  useEffect(() => {
    loadProviders();
    loadActiveCount();
  }, [currentPage, pageSize, orderBy, order, searchTerm]);

  const loadProviders = async (search?: string) => {
    setLoading(true);
    try {
      const queryParams: QueryParamType = {
        search: search || searchTerm,
        page: currentPage,
        limit: pageSize,
        orderBy,
        order,
      };

      const result = await InsuranceProviderService.getAll(queryParams);

      if (result.success) {
        dispatch(setInsuranceProviders(result.data as InsuranceProviderType[]));
        dispatch(setInsuranceProviderCount(result.count || 0));
      } else {
        toast.error(result.error || "Failed to load insurance providers");
      }
    } catch (error: any) {
      toast.error(error.message || "Error loading insurance providers");
    } finally {
      setLoading(false);
    }
  };

  const loadActiveCount = async () => {
    const result = await InsuranceProviderService.getAllActive();
    if (result.success) {
      setActiveCount(result.data?.length || 0);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // loadProviders will be triggered by useEffect when searchTerm changes
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await InsuranceProviderService.delete(id);
      if (result.success) {
        toast.success(result.message || "Insurance provider deleted successfully");
        dispatch(removeInsuranceProvider(id));
        loadProviders();
        loadActiveCount();
      } else {
        toast.error(result.error || "Failed to delete insurance provider");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (provider: InsuranceProviderType) => {
    setDrawerState({
      open: true,
      mode: "Edit",
      insuranceProvider: provider,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerState({ open: false, mode: "Add" });
    form.resetFields();
    loadProviders();
    loadActiveCount();
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await InsuranceProviderService.toggleActive(id, !currentStatus);
      if (result.success) {
        toast.success(result.message || "Status updated successfully");
        loadProviders();
        loadActiveCount();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (name: string) => (
        <span className="font-medium capitalize">{name}</span>
      ),
    },
    {
      title: "Agent Rate (%)",
      dataIndex: "agentRate",
      key: "agentRate",
      sorter: true,
      render: (rate: number) => <Tag color="blue">{rate}%</Tag>,
    },
    {
      title: "Our Rate (%)",
      dataIndex: "ourRate",
      key: "ourRate",
      sorter: true,
      render: (rate: number) => <Tag color="green">{rate}%</Tag>,
    },
    {
      title: "TDS (%)",
      dataIndex: "tds",
      key: "tds",
      render: (rate: number) => <Tag color="orange">{rate}%</Tag>,
    },
    {
      title: "GST (%)",
      dataIndex: "gst",
      key: "gst",
      render: (rate: number) => <Tag color="purple">{rate}%</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value: any, record: InsuranceProviderType) =>
        record.isActive === value,
      render: (isActive: boolean, record: InsuranceProviderType) => (
        <Tooltip title={`Click to ${isActive ? "deactivate" : "activate"}`}>
          <Tag
            color={isActive ? "green" : "red"}
            className="cursor-pointer"
            onClick={() => handleToggleStatus(record.id, isActive)}
            icon={
              isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 250,
      render: (_: any, record: InsuranceProviderType) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => router.push(`/insurance-providers/${record.id}`)}
            type="link"
            size="small"
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Insurance Provider"
            description={
              <div>
                Are you sure you want to delete{" "}
                <strong className="capitalize">{record.name}</strong>?
                <br />
                This action cannot be undone.
              </div>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              icon={<DeleteOutlined />}
              type="link"
              danger
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (pagination) {
      setCurrentPage(pagination.current);
      setPageSize(pagination.pageSize);
    }

    if (sorter.field) {
      setOrderBy(sorter.field);
      setOrder(sorter.order === "ascend" ? "asc" : "desc");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BankOutlined />
            Insurance Providers
          </h1>
          <p className="text-gray-600 mt-1">
            Manage insurance providers and their commission rates
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setDrawerState({ open: true, mode: "Add" })}
        >
          Add Provider
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Providers"
              value={totalCount}
              prefix={<BankOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Providers"
              value={activeCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Inactive Providers"
              value={totalCount - activeCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <CommonSearchInput
            placeholder="Search by provider name..."
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
          >
            <Select.Option value="name-asc">Name (A-Z)</Select.Option>
            <Select.Option value="name-desc">Name (Z-A)</Select.Option>
            <Select.Option value="agentRate-asc">
              Agent Rate (Low-High)
            </Select.Option>
            <Select.Option value="agentRate-desc">
              Agent Rate (High-Low)
            </Select.Option>
            <Select.Option value="ourRate-asc">
              Our Rate (Low-High)
            </Select.Option>
            <Select.Option value="ourRate-desc">
              Our Rate (High-Low)
            </Select.Option>
            <Select.Option value="createdAt-desc">
              Recently Added
            </Select.Option>
            <Select.Option value="createdAt-asc">Oldest First</Select.Option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={insuranceProviders as InsuranceProviderType[]}
          loading={loading}
          rowKey="id"
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} providers`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Drawer for Add/Edit */}
      <Drawer
        title={
          <span className="text-xl font-semibold">
            {drawerState.mode === "Add"
              ? "Add Insurance Provider"
              : `Edit ${drawerState.insuranceProvider?.name || "Provider"}`}
          </span>
        }
        open={drawerState.open}
        onClose={() => {
          setDrawerState({ open: false, mode: "Add" });
          form.resetFields();
        }}
        width={720}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setDrawerState({ open: false, mode: "Add" });
                form.resetFields();
              }}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              size="large"
            >
              {drawerState.mode === "Add" ? "Create Provider" : "Update Provider"}
            </Button>
          </div>
        }
      >
        <InsuranceProviderForm
          data={drawerState}
          setData={setDrawerState}
          form={form}
          onClose={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}


