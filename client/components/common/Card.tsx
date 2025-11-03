"use client";

import { Card as AntCard } from "antd";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  extra?: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({
  children,
  title,
  extra,
  className,
  hoverable = false,
}: CardProps) => {
  return (
    <AntCard
      title={title}
      extra={extra}
      hoverable={hoverable}
      className={`shadow-sm ${className || ""}`}
    >
      {children}
    </AntCard>
  );
};


