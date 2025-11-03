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
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { FirestoreService } from "@/client/services/firestore.service";
import { COLLECTIONS, AgentType, AgentFormType } from "@/typescript/types";
import AgentForm from "@/client/components/forms/AgentForm";
import { useDispatch, useSelector } from "react-redux";
import { setAgents, removeAgent } from "@/lib/redux/slices/agentSlice";
import { RootState } from "@/lib/redux/store";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toaster";

export default function AgentsPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const router = useRouter();
  const agents = useSelector((state: RootState) => state.agent.agents);
  const [loading, setLoading] = useState(false);
  const [drawerState, setDrawerState] = useState<AgentFormType>({
    open: false,
    mode: "Add",
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    const result = await FirestoreService.getAll(COLLECTIONS.AGENTS, {
      orderByField: "createdAt",
      orderDirection: "desc",
    });
    if (result.success) {
      dispatch(setAgents(result.data as AgentType[]));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await FirestoreService.delete(COLLECTIONS.AGENTS, id);
      if (result.success) {
        toast.success("Agent deleted successfully");
        dispatch(removeAgent(id));
      } else {
        toast.error(result.error || "Failed to delete agent");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (agent: AgentType) => {
    setDrawerState({
      open: true,
      mode: "Edit",
      agent,
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "City",
      dataIndex: ["location", "city"],
      key: "city",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: AgentType) => (
        <Space>
          <Button
            type="link"
            onClick={() => router.push(`/agents/${record.id}/commissions`)}
          >
            View Commissions
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this agent?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Agents</h1>
          <p className="text-gray-600">Manage your insurance agents</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setDrawerState({ open: true, mode: "Add" })}
        >
          Add Agent
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={agents as AgentType[]}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={`${drawerState.mode} Agent`}
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
            >
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              {drawerState.mode === "Add" ? "Create" : "Update"}
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
          }}
        />
      </Drawer>
    </div>
  );
}

