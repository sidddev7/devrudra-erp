import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { FormInstance } from "antd";
import dayjs from "dayjs";
import {
  CSSProperties,
  Dispatch as ReactDispatch,
  ReactNode,
  SetStateAction,
} from "react";

export type UseStateFncType<T> = ReactDispatch<SetStateAction<T>>;

type TimeStamp = { createdAt: string; updatedAt: string };

type UserLogging = {
  createdBy: string;
  updatedBy: string;
};

type Document = {
  isDeleted: boolean;
} & TimeStamp &
  UserLogging;

export type LayoutProps = {
  children: ReactNode;
};

export type PageProps = {
  params?: any;
  searchParams?: any;
};

// User Types
export type UserType = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  username: string;
  firebaseUid: string;
  role: "admin" | "sub-user";
  isActive: boolean;
} & Partial<Document>;

export type LoginData = {
  email: string;
  password: string;
};

export type IconType = Partial<{
  color: string;
  className: string;
  style: CSSProperties;
}>;

export type ForgotPasswordType = {
  email: string;
};

export type Location = {
  address: string;
  city: string;
  state: string;
};

// Agent Type
export type AgentType = {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  location: Location;
  isActive: boolean;
  transactions?: PolicyHoldersType[];
} & Partial<Document>;

// Insurance Provider Type
export type InsuranceProviderType = {
  id: string;
  name: string;
  agentRate: number;
  ourRate: number;
  tds: number;
  gst: number;
  isActive: boolean;
  transactions?: PolicyHoldersType[];
} & Partial<Document>;

// Vehicle Type
export type VehicleType = {
  id: string;
  name: string;
  commissionRate: number;
  agentRate: number;
  ourRate: number;
  isActive: boolean;
  transactions?: PolicyHoldersType[];
} & Partial<Document>;

type DateType = dayjs.Dayjs | string | Date;

// Policy Holder Type
export type PolicyHoldersType = {
  id: string;
  name: string;
  startDate: DateType;
  endDate: DateType;
  policyNumber: string;
  address: string;
  premiumAmount: number;
  totalCommission: number;
  tdsRate: number;
  gstRate: number;
  agentRate: number;
  grossAmount: number;
  insuranceProvider: InsuranceProviderType | string;
  vehicleType: VehicleType | string;
  agent: AgentType | string;
  ourProfit: number;
  agentCommission: number;
  profitAfterTDS: number;
  tdsAmount: number;
  gstAmount: number;
  commission: number;
  phoneNumber?: string;
  email?: string;
  vehicleInfo?: {
    registrationNumber: string;
    make?: string;
    model?: string;
  };
  ourRate: number;
  status: "active" | "expired" | "expiring-soon";
} & Partial<Document>;

type TotalSum = {
  ourProfit: number;
  agentCommission: number;
  profitAfterTDS: number;
  tdsAmount: number;
  gstAmount: number;
  commission: number;
  grossAmount: number;
  premiumAmount: number;
  totalCommission: number;
};

export type AgentTransactions = Partial<{
  agent: AgentType;
  filteredTransactions: PolicyHoldersType[];
  sum: TotalSum;
}>;

export type InsuranceTransactions = Partial<{
  filteredTransactions: PolicyHoldersType[];
  insuranceProvider: InsuranceProviderType;
  sum: TotalSum;
}>;

// Redux State Types
export type AppState = {
  user: {
    user: Partial<UserType>;
    saveLoader: boolean;
    userList: UserType[];
    count: number;
  };
  agent: {
    agents?: Partial<AgentType>[];
    count: number;
    transactions: Partial<AgentTransactions>;
  };
  insuranceProvider: {
    insuranceProviders?: Partial<InsuranceProviderType>[];
    count: number;
    transactions: Partial<InsuranceTransactions>;
  };
  policyHolder: {
    policyHolderList: Partial<PolicyHoldersType>[];
    count: number;
    sum: Partial<TotalSum>;
    expiringPolicies: Partial<PolicyHoldersType>[];
  };
  vehicleClass: {
    vehicleClasses: Partial<VehicleType>[];
    count: number;
  };
};

export type QueryParamType = Partial<{
  search: string;
  page: number;
  limit: number;
  order: "desc" | "asc";
  orderBy: string;
  endDate: string;
  startDate: string;
  status: string;
}>;

export type DispatchType = Dispatch<UnknownAction>;

export type CardFooterProps = Partial<{
  showDelete: boolean;
  showEdit: boolean;
  showView: boolean;
  handleView: React.MouseEventHandler<HTMLElement>;
  handleEdit: React.MouseEventHandler<HTMLElement>;
  handleDelete: React.MouseEventHandler<HTMLElement>;
}>;

export type DrawerForm = { open: boolean; mode: "Add" | "Edit" };

type FormState<T, S extends string> = DrawerForm & {
  [K in S]?: Partial<T>;
};

export type PolicyFormDrawerType = FormState<PolicyHoldersType, "policy">;
export type InsuranceProviderFormType = FormState<InsuranceProviderType, "insuranceProvider">;
export type UserFormType = FormState<UserType, "user">;
export type AgentFormType = FormState<AgentType, "agent">;
export type VehicleFormType = FormState<VehicleType, "vehicleClass">;

export type GenericFormJSXType<T, S> = {
  data: T;
  setData: UseStateFncType<T>;
  form: FormInstance<S>;
  onClose?: () => void;
};

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: "users",
  AGENTS: "agents",
  INSURANCE_PROVIDERS: "insuranceProviders",
  VEHICLE_CLASSES: "vehicleClasses",
  POLICY_HOLDERS: "policyHolders",
} as const;

