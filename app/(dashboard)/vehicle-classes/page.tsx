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
  VehicleType,
  VehicleFormType,
} from "@/typescript/types";
import VehicleClassForm from "@/client/components/forms/VehicleClassForm";
import { useDispatch, useSelector } from "react-redux";
import {
  setVehicleClasses,
  removeVehicleClass,
} from "@/lib/redux/slices/vehicleClassSlice";
import { RootState } from "@/lib/redux/store";

export default function VehicleClassesPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const vehicleClasses = useSelector(
    (state: RootState) => state.vehicleClass.vehicleClasses
  );
  const [loading, setLoading] = useState(false);
  const [drawerState, setDrawerState] = useState<VehicleFormType>({
    open: false,
    mode: "Add",
  });

  useEffect(() => {
    loadVehicleClasses();
  }, []);

  const loadVehicleClasses = async () => {
    setLoading(true);
    const result = await FirestoreService.getAll(COLLECTIONS.VEHICLE_CLASSES, {
      orderByField: "createdAt",
      orderDirection: "desc",
    });
    if (result.success) {
      dispatch(setVehicleClasses(result.data as VehicleType[]));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await FirestoreService.delete(
        COLLECTIONS.VEHICLE_CLASSES,
        id
      );
      if (result.success) {
        toast.success("Vehicle Class deleted successfully");
        dispatch(removeVehicleClass(id));
      } else {
        toast.error(result.error || "Failed to delete vehicle class");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (vehicleClass: VehicleType) => {
    setDrawerState({
      open: true,
      mode: "Edit",
      vehicleClass,
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Commission Rate (%)",
      dataIndex: "commissionRate",
      key: "commissionRate",
      render: (rate: number) => `${rate}%`,
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
      render: (_: any, record: VehicleType) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this vehicle class?"
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
          <h1 className="text-3xl font-bold text-gray-800">Vehicle Classes</h1>
          <p className="text-gray-600">Manage vehicle classes</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setDrawerState({ open: true, mode: "Add" })}
        >
          Add Vehicle Class
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={vehicleClasses as VehicleType[]}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={`${drawerState.mode} Vehicle Class`}
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
        <VehicleClassForm
          data={drawerState}
          setData={setDrawerState}
          form={form}
          onClose={() => {
            setDrawerState({ open: false, mode: "Add" });
            loadVehicleClasses();
          }}
        />
      </Drawer>
    </div>
  );
}


