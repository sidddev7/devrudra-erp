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
  EyeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { AgentType, AgentFormType, QueryParamType } from "@/typescript/types";
import AgentForm from "@/client/components/forms/AgentForm";
import { useDispatch, useSelector } from "react-redux";
import { setAgents, setAgentCount, removeAgent } from "@/lib/redux/slices/agentSlice";
import { RootState } from "@/lib/redux/store";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toaster";
import { AgentService } from "@/client/services/agent.service";
import dayjs from "dayjs";
import { CommonSearchInput } from "@/client/components/common/CommonSearchInput";

export default function AgentsPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const router = useRouter();
  const agents = useSelector((state: RootState) => state.agent.agents);
  const totalCount = useSelector((state: RootState) => state.agent.count);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCount, setActiveCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderBy, setOrderBy] = useState<string>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [drawerState, setDrawerState] = useState<AgentFormType>({
    open: false,
    mode: "Add",
  });

  useEffect(() => {
    loadAgents();
    loadActiveCount();
  }, [currentPage, pageSize, orderBy, order, searchTerm]);

  const loadAgents = async (search?: string) => {
    setLoading(true);
    try {
      const queryParams: QueryParamType & { lastDoc?: any } = {
        search: search || searchTerm,
        limit: pageSize,
        orderBy,
        order,
      };

      const result = await AgentService.getAllAgents(queryParams);
      
      if (result.success) {
        dispatch(setAgents(result.data as AgentType[]));
        dispatch(setAgentCount(result.count || 0));
      } else {
        toast.error("Failed to load agents", result.error || "Unknown error");
      }
    } catch (error: any) {
      toast.error("Error loading agents", error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveCount = async () => {
    const result = await AgentService.getActiveAgentsCount();
    if (result.success) {
      setActiveCount(result.count || 0);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // loadAgents will be triggered by useEffect when searchTerm changes
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const result = await AgentService.deleteAgent(id);
      if (result.success) {
        toast.success(result.message || "Agent deleted successfully");
        dispatch(removeAgent(id));
        loadActiveCount();
        // Reload if current page becomes empty
        if (agents && agents.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          loadAgents();
        }
      } else {
        toast.error("Delete Failed", result.error || "Failed to delete agent");
      }
    } catch (error: any) {
      toast.error("Error", error.message);
    }
  };

  const handleEdit = (agent: AgentType) => {
    setDrawerState({
      open: true,
      mode: "Edit",
      agent,
    });
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
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text: string) => (
        <span className="text-gray-600">{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => (
        <span className="text-gray-600">{text || "-"}</span>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, record: AgentType) => {
        const parts = [
          record.location?.city,
          record.location?.state,
        ].filter(Boolean);
        return (
          <Tooltip title={record.location?.address}>
            <span className="text-gray-600">
              {parts.length > 0 ? parts.join(", ") : record.location?.address || "-"}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? "success" : "error"}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date: string) => (
        <span className="text-gray-600">
          {date ? dayjs(date).format("DD MMM YYYY") : "-"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 280,
      render: (_: any, record: AgentType) => (
        <Space size="small">
          <Tooltip title="View Commissions">
            <Button
              icon={<EyeOutlined />}
              onClick={() => router.push(`/agents/${record.id}/commissions`)}
              size="small"
            >
              Commissions
            </Button>
          </Tooltip>
          <Tooltip title="Edit Agent">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              ghost
              size="small"
            >
              Edit
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete Agent"
            description={`Are you sure you want to delete "${record.name}"?`}
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Agent">
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
              >
                Delete
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Agents Management</h1>
          <p className="text-gray-600 mt-1">Manage your insurance agents and track their performance</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setDrawerState({ open: true, mode: "Add" })}
        >
          Add New Agent
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Agents"
              value={totalCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Agents"
              value={activeCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Inactive Agents"
              value={totalCount - activeCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <CommonSearchInput
            placeholder="Search by name, phone, email, or location..."
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
            ]}
          />
        </div>
      </Card>

      {/* Table Section */}
      <Card>
        <Table
          columns={columns}
          dataSource={agents as AgentType[]}
          loading={loading}
          rowKey="id"
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} agents`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1200 }}
          bordered
        />
      </Card>

      {/* Drawer for Add/Edit Agent */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <UserOutlined />
            <span>{drawerState.mode} Agent</span>
          </div>
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
              icon={drawerState.mode === "Add" ? <PlusOutlined /> : <EditOutlined />}
            >
              {drawerState.mode === "Add" ? "Create Agent" : "Update Agent"}
            </Button>
          </div>
        }
      >
        <AgentForm
          data={drawerState}
          setData={setDrawerState}
          form={form}
          onClose={() => {
            setDrawerState({ open: false, mode: "Add" });
            loadAgents();
            loadActiveCount();
          }}
        />
      </Drawer>
    </div>
  );
}

