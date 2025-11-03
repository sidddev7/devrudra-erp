"use client";

import { ReactNode } from "react";
import { Card, Space, Typography, Button, Tag } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { CardFooterProps } from "@/typescript/types";

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


