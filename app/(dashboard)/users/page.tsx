"use client";

import { useEffect, useState } from "react";
import { Table, Button, Drawer, Form, Popconfirm, Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { FirestoreService } from "@/client/services/firestore.service";
import { COLLECTIONS, UserType, UserFormType } from "@/typescript/types";
import UserForm from "@/client/components/forms/UserForm";
import { useDispatch, useSelector } from "react-redux";
import { setUserList, removeUser } from "@/lib/redux/slices/userSlice";
import { RootState } from "@/lib/redux/store";
import { toast } from "@/lib/toaster";

export default function UsersPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.user.userList);
  const [loading, setLoading] = useState(false);
  const [drawerState, setDrawerState] = useState<UserFormType>({
    open: false,
    mode: "Add",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await FirestoreService.getAll(COLLECTIONS.USERS, {
      orderByField: "createdAt",
      orderDirection: "desc",
    });
    if (result.success) {
      dispatch(setUserList(result.data as UserType[]));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await FirestoreService.delete(COLLECTIONS.USERS, id);
      if (result.success) {
        toast.success("User deleted successfully");
        dispatch(removeUser(id));
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (user: UserType) => {
    setDrawerState({
      open: true,
      mode: "Edit",
      user,
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "blue" : "green"}>
          {role?.toUpperCase()}
        </Tag>
      ),
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
      render: (_: any, record: UserType) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
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
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-600">Manage admin and sub-users</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setDrawerState({ open: true, mode: "Add" })}
        >
          Add User
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={`${drawerState.mode} User`}
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
        <UserForm
          data={drawerState}
          setData={setDrawerState}
          form={form}
          onClose={() => {
            setDrawerState({ open: false, mode: "Add" });
            loadUsers();
          }}
        />
      </Drawer>
    </div>
  );
}
