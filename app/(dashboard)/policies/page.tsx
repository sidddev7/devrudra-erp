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
  PolicyHoldersType,
  PolicyFormDrawerType,
} from "@/typescript/types";
import PolicyHolderForm from "@/client/components/forms/PolicyHolderForm";
import { useDispatch, useSelector } from "react-redux";
import { setPolicies, removePolicy } from "@/lib/redux/slices/policySlice";
import { RootState } from "@/lib/redux/store";
import dayjs from "dayjs";

export default function PoliciesPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const policies = useSelector(
    (state: RootState) => state.policyHolder.policyHolderList
  );
  const [loading, setLoading] = useState(false);
  const [drawerState, setDrawerState] = useState<PolicyFormDrawerType>({
    open: false,
    mode: "Add",
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    const result = await FirestoreService.getAll(COLLECTIONS.POLICY_HOLDERS, {
      orderByField: "createdAt",
      orderDirection: "desc",
    });
    if (result.success) {
      dispatch(setPolicies(result.data as PolicyHoldersType[]));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await FirestoreService.delete(
        COLLECTIONS.POLICY_HOLDERS,
        id
      );
      if (result.success) {
        toast.success("Policy deleted successfully");
        dispatch(removePolicy(id));
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
    },
    {
      title: "Premium Amount",
      dataIndex: "premiumAmount",
      key: "premiumAmount",
      render: (amount: number) => `₹${amount?.toLocaleString()}`,
    },
    {
      title: "Agent Commission",
      dataIndex: "agentCommission",
      key: "agentCommission",
      render: (amount: number) => `₹${amount?.toLocaleString()}`,
    },
    {
      title: "Our Profit",
      dataIndex: "ourProfit",
      key: "ourProfit",
      render: (amount: number) => `₹${amount?.toLocaleString()}`,
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
      title: "Actions",
      key: "actions",
      render: (_: any, record: PolicyHoldersType) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this policy?"
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
          <h1 className="text-3xl font-bold text-gray-800">Policies</h1>
          <p className="text-gray-600">Manage insurance policies</p>
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

      <Table
        columns={columns}
        dataSource={policies as PolicyHoldersType[]}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1500 }}
      />

      <Drawer
        title={`${drawerState.mode} Policy`}
        open={drawerState.open}
        onClose={() => {
          setDrawerState({ open: false, mode: "Add" });
          form.resetFields();
        }}
        width={900}
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
        <PolicyHolderForm
          data={drawerState}
          setData={setDrawerState}
          form={form}
          onClose={() => {
            setDrawerState({ open: false, mode: "Add" });
            loadPolicies();
          }}
        />
      </Drawer>
    </div>
  );
}


