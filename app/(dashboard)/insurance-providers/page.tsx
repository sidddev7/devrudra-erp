"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Drawer,
  Form,
  message,
  Popconfirm,
  Tag,
  Space,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { FirestoreService } from "@/client/services/firestore.service";
import {
  COLLECTIONS,
  InsuranceProviderType,
  InsuranceProviderFormType,
} from "@/typescript/types";
import InsuranceProviderForm from "@/client/components/forms/InsuranceProviderForm";
import { useDispatch, useSelector } from "react-redux";
import {
  setInsuranceProviders,
  removeInsuranceProvider,
} from "@/lib/redux/slices/insuranceProviderSlice";
import { RootState } from "@/lib/redux/store";

export default function InsuranceProvidersPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const providers = useSelector(
    (state: RootState) => state.insuranceProvider.insuranceProviders
  );
  const [loading, setLoading] = useState(false);
  const [drawerState, setDrawerState] = useState<InsuranceProviderFormType>({
    open: false,
    mode: "Add",
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    const result = await FirestoreService.getAll(
      COLLECTIONS.INSURANCE_PROVIDERS,
      {
        orderByField: "createdAt",
        orderDirection: "desc",
      }
    );
    if (result.success) {
      dispatch(setInsuranceProviders(result.data as InsuranceProviderType[]));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await FirestoreService.delete(
        COLLECTIONS.INSURANCE_PROVIDERS,
        id
      );
      if (result.success) {
        toast.success("Insurance Provider deleted successfully");
        dispatch(removeInsuranceProvider(id));
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

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Agent Rate (%)",
      dataIndex: "agentRate",
      key: "agentRate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "Our Rate (%)",
      dataIndex: "ourRate",
      key: "ourRate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "TDS (%)",
      dataIndex: "tds",
      key: "tds",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "GST (%)",
      dataIndex: "gst",
      key: "gst",
      render: (rate: number) => `${rate}%`,
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
      render: (_: any, record: InsuranceProviderType) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this provider?"
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
          <h1 className="text-3xl font-bold text-gray-800">
            Insurance Providers
          </h1>
          <p className="text-gray-600">Manage insurance providers</p>
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

      <Table
        columns={columns}
        dataSource={providers as InsuranceProviderType[]}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={`${drawerState.mode} Insurance Provider`}
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
        <InsuranceProviderForm
          data={drawerState}
          setData={setDrawerState}
          form={form}
          onClose={() => {
            setDrawerState({ open: false, mode: "Add" });
            loadProviders();
          }}
        />
      </Drawer>
    </div>
  );
}


