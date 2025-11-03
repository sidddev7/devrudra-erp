"use client";

import { ReactNode, useState } from "react";
import { Card, Space, Typography, Button, Tag, Modal, Drawer } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { CardFooterProps, InsuranceProviderFormType, InsuranceProviderType, UseStateFncType } from "@/typescript/types";

const { Title, Text } = Typography;

export const Heading = ({ children }: { children: ReactNode }) => {
  return (
    <Title level={4} className="mb-4">
      {children}
    </Title>
  );
};

export const SubHeading = ({ children }: { children: ReactNode }) => {
  return (
    <Title level={5} className="mb-2">
      {children}
    </Title>
  );
};

export const CardFooter = (props: CardFooterProps) => {
  return (
    <Space>
      {props.showView && (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={props.handleView}
        >
          View
        </Button>
      )}
      {props.showEdit && (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={props.handleEdit}
        >
          Edit
        </Button>
      )}
      {props.showDelete && (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={props.handleDelete}
        >
          Delete
        </Button>
      )}
    </Space>
  );
};

export const StyledCard = ({
  children,
  title,
  extra,
  className,
}: {
  children: ReactNode;
  title?: ReactNode;
  extra?: ReactNode;
  className?: string;
}) => {
  return (
    <Card
      title={title}
      extra={extra}
      className={`shadow-md rounded-lg ${className || ""}`}
    >
      {children}
    </Card>
  );
};

export const StatusTag = ({
  status,
}: {
  status: "active" | "expired" | "expiring-soon" | "inactive";
}) => {
  const colorMap = {
    active: "green",
    expired: "red",
    "expiring-soon": "orange",
    inactive: "gray",
  };

  return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
};

export const CardField = ({
  label,
  value,
  icon,
  isPhone,
  isEmail,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  isPhone?: boolean;
  isEmail?: boolean;
}) => {
  let displayValue = value;
  
  if (isPhone && typeof value === "string") {
    displayValue = (
      <a href={`tel:${value}`} className="text-blue-600 hover:underline">
        {value}
      </a>
    );
  } else if (isEmail && typeof value === "string") {
    displayValue = (
      <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
        {value}
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-1 py-2">
      <Text type="secondary" className="text-xs">
        {label}
      </Text>
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <Text strong className="text-sm">
          {displayValue || "N/A"}
        </Text>
      </div>
    </div>
  );
};

export const HorizontalLine = () => {
  return <div className="border-t border-gray-200 my-2" />;
};

export const BasicInsuranceProviderInfo = ({
  insuranceProvider,
}: {
  insuranceProvider: Partial<InsuranceProviderType>;
}) => {
  return (
    <>
      <CardField
        label="Agent Rate"
        value={`${insuranceProvider.agentRate || 0}%`}
      />
      <CardField label="Our Rate" value={`${insuranceProvider.ourRate || 0}%`} />
      <CardField label="TDS Rate" value={`${insuranceProvider.tds || 0}%`} />
      <CardField label="GST Rate" value={`${insuranceProvider.gst || 0}%`} />
      <CardField
        label="Status"
        value={
          <Tag color={insuranceProvider.isActive ? "green" : "red"}>
            {insuranceProvider.isActive ? "Active" : "Inactive"}
          </Tag>
        }
      />
    </>
  );
};

export const InsuranceProviderCard = ({
  insuranceProvider,
  setForm,
  onDelete,
}: {
  insuranceProvider: Partial<InsuranceProviderType>;
  setForm: UseStateFncType<InsuranceProviderFormType>;
  onDelete?: (id: string) => void;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    if (onDelete && insuranceProvider.id) {
      onDelete(insuranceProvider.id);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <Card
        className="shadow-md rounded-lg hover:shadow-lg transition-shadow w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.5rem)]"
        hoverable
      >
        <div className="cursor-pointer">
          <Title level={5} className="mb-3 capitalize">
            {insuranceProvider.name}
          </Title>
          <HorizontalLine />
          <BasicInsuranceProviderInfo insuranceProvider={insuranceProvider} />
          <HorizontalLine />
          <CardFooter
            showEdit
            showDelete
            handleEdit={() => {
              setForm({
                open: true,
                mode: "Edit",
                insuranceProvider: insuranceProvider,
              });
            }}
            handleDelete={() => setShowDeleteModal(true)}
          />
        </div>
      </Card>

      <Modal
        title="Delete Insurance Provider"
        open={showDeleteModal}
        onOk={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        okText="Yes, delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete{" "}
          <strong className="capitalize">{insuranceProvider.name}</strong>? This
          action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export const CommonDrawer = ({
  open,
  onClose,
  title,
  children,
  width = 720,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}) => {
  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      width={width}
      footer={footer}
    >
      {children}
    </Drawer>
  );
};


