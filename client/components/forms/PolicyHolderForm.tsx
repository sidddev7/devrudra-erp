"use client";

import {
  CarIcon,
  EmailIcon,
  LocationIcon,
  MoneyIcon,
  PhoneIcon,
  PolicyIcon,
  UserIcon,
} from "@/client/icons/icons";
import { PolicyHolderService } from "@/client/services/policyHolder.service";
import { addPolicy, updatePolicy } from "@/lib/redux/slices/policySlice";
import {
  AgentType,
  GenericFormJSXType,
  InsuranceProviderType,
  PolicyFormDrawerType,
  PolicyHoldersType,
  VehicleType,
} from "@/typescript/types";
import { Form } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  CommonDatePicker,
  CommonSelection,
  NumberInputStyled,
  TextInputStyled,
} from "../common/commonInputs";
import { Heading } from "../common/commonViews";
import { toast } from "@/lib/toaster";
import { AgentService } from "@/client/services/agent.service";
import { InsuranceProviderService } from "@/client/services/insuranceProvider.service";
import { VehicleClassService } from "@/client/services/vehicleClass.service";
import { validatePolicyHolder } from "@/client/utils/validation.utils";

const PolicyHolderForm = (
  props: GenericFormJSXType<PolicyFormDrawerType, PolicyHoldersType>
) => {
  const dispatch = useDispatch();
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [providers, setProviders] = useState<InsuranceProviderType[]>([]);
  const [vehicleClasses, setVehicleClasses] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agentsRes, providersRes, vehiclesRes] = await Promise.all([
        AgentService.getAllAgents({ limit: 1000 }),
        InsuranceProviderService.getAll({ limit: 1000 }),
        VehicleClassService.getAllVehicleClasses({ limit: 1000 }),
      ]);

      if (agentsRes.success) setAgents(agentsRes.data as AgentType[]);
      if (providersRes.success)
        setProviders(providersRes.data as InsuranceProviderType[]);
      if (vehiclesRes.success)
        setVehicleClasses(vehiclesRes.data as VehicleType[]);
    } catch (error) {
      console.error("Error loading form data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const calculateCommissions = (values: any) => {
    const premiumAmount = values.premiumAmount || 0;
    const agentRate = values.agentRate || 0;
    const ourRate = values.ourRate || 0;
    const tdsRate = values.tdsRate || 0;
    const gstRate = values.gstRate || 0;

    // totalCommission should be stored as a PERCENTAGE (rate), not as an amount
    // It's the sum of agentRate + ourRate
    const totalCommission = agentRate + ourRate;
    
    // Calculate commission amount using the totalCommission rate
    const commission = (premiumAmount * totalCommission) / 100;
    const agentCommission = (premiumAmount * agentRate) / 100;
    const ourProfit = (premiumAmount * ourRate) / 100;
    const tdsAmount = (commission * tdsRate) / 100;
    const gstAmount = (premiumAmount * gstRate) / 100;
    const profitAfterTDS = commission - tdsAmount;
    const grossAmount = premiumAmount + gstAmount;

    return {
      totalCommission, // Stored as percentage rate (e.g., 3.5 for 3.5%)
      agentCommission,
      ourProfit,
      tdsAmount,
      gstAmount,
      profitAfterTDS,
      grossAmount,
    };
  };

  const handleSavePolicy = async (values: any) => {
    try {
      // Include id in validation data for Edit mode
      const validationData = props.data.mode === "Edit" && props.data.policy?.id
        ? { ...values, id: props.data.policy.id }
        : values;

      // Validate data
      const validation = validatePolicyHolder(validationData, props.data.mode);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        return;
      }

      // Calculate commissions
      const calculations = calculateCommissions(values);

      const policyData = {
        ...values,
        ...calculations,
        startDate: values.startDate
          ? dayjs(values.startDate).toISOString()
          : new Date().toISOString(),
        endDate: values.endDate
          ? dayjs(values.endDate).toISOString()
          : new Date().toISOString(),
      };

      if (props.data.mode === "Edit" && props.data.policy?.id) {
        const result = await PolicyHolderService.update(
          props.data.policy.id,
          policyData
        );
        if (result.success) {
          toast.success(result.message || "Policy updated successfully");
          dispatch(updatePolicy({ ...policyData, id: props.data.policy.id }));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error(result.error || "Failed to update policy");
        }
      } else {
        const result = await PolicyHolderService.create(policyData);
        if (result.success) {
          toast.success(result.message || "Policy created successfully");
          dispatch(addPolicy(result.data as PolicyHoldersType));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error(result.error || "Failed to create policy");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const onProviderChange = (value: string) => {
    const provider = providers.find((p) => p.id === value);
    if (provider) {
      props.form.setFieldsValue({
        tdsRate: provider.tds,
        gstRate: provider.gst,
      });
    }
  };

  const onVehicleChange = (value: string) => {
    const vehicle = vehicleClasses.find((v) => v.id === value);
    if (vehicle) {
      props.form.setFieldsValue({
        agentRate: vehicle.agentRate,
        ourRate: vehicle.ourRate,
      });
    }
  };

  useEffect(() => {
    if (props.data.mode === "Edit" && props.data.policy) {
      const policyData = { ...props.data.policy };
      if (policyData.startDate) {
        policyData.startDate = dayjs(policyData.startDate);
      }
      if (policyData.endDate) {
        policyData.endDate = dayjs(policyData.endDate);
      }
      props.form.setFieldsValue(policyData);
    }
    if (!props.data.open) {
      props.form.resetFields();
    }
  }, [props.data, props.form]);

  return (
    <Form form={props.form} onFinish={handleSavePolicy} layout="vertical">
      <Heading>Policy Holder Details</Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInputStyled
          label="Policy Holder Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter policy holder name",
            },
          ]}
          placeholder="Policy holder name..."
          prefix={<UserIcon />}
        />
        <TextInputStyled
          label="Phone Number"
          name="phoneNumber"
          rules={[
            {
              required: true,
              message: "Please enter phone number",
            },
            {
              pattern: /^[0-9]{10}$/,
              message: "Please enter valid 10 digit phone number",
            },
          ]}
          placeholder="Phone number..."
          prefix={<PhoneIcon />}
        />
        <TextInputStyled
          name="email"
          label="Email"
          placeholder="Email..."
          rules={[
            {
              type: "email",
              message: "Email is invalid",
            },
          ]}
          prefix={<EmailIcon />}
        />
        <TextInputStyled
          name="address"
          label="Address"
          placeholder="Address..."
          prefix={<LocationIcon />}
        />
      </div>

      <Heading>Policy Details</Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInputStyled
          label="Policy Number"
          name="policyNumber"
          rules={[
            {
              required: true,
              message: "Please enter policy number",
            },
          ]}
          placeholder="Policy number..."
          prefix={<PolicyIcon />}
        />
        <CommonSelection
          label="Insurance Provider"
          name="insuranceProvider"
          rules={[
            {
              required: true,
              message: "Please select insurance provider",
            },
          ]}
          placeholder="Select provider..."
          options={providers}
          optionTitle="name"
          optionValue="id"
          showSearch
          filterOption
          loading={loading}
          onChange={(value: string | number) =>
            onProviderChange(value as string)
          }
        />
        <CommonSelection
          label="Agent"
          name="agent"
          rules={[
            {
              required: true,
              message: "Please select agent",
            },
          ]}
          placeholder="Select agent..."
          options={agents}
          optionTitle="name"
          optionValue="id"
          showSearch
          filterOption
          loading={loading}
        />
        <CommonSelection
          label="Vehicle Class"
          name="vehicleType"
          rules={[
            {
              required: true,
              message: "Please select vehicle class",
            },
          ]}
          placeholder="Select vehicle class..."
          options={vehicleClasses}
          optionTitle="name"
          optionValue="id"
          showSearch
          filterOption
          loading={loading}
          onChange={(value: string | number) =>
            onVehicleChange(value as string)
          }
        />
        <CommonDatePicker
          label="Start Date"
          name="startDate"
          rules={[
            {
              required: true,
              message: "Please select start date",
            },
          ]}
          placeholder="Select start date..."
        />
        <CommonDatePicker
          label="End Date"
          name="endDate"
          rules={[
            {
              required: true,
              message: "Please select end date",
            },
          ]}
          placeholder="Select end date..."
        />
      </div>

      <Heading>Vehicle Information</Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInputStyled
          name={["vehicleInfo", "registrationNumber"]}
          label="Registration Number"
          placeholder="Registration number..."
          prefix={<CarIcon />}
        />
        <TextInputStyled
          name={["vehicleInfo", "make"]}
          label="Vehicle Make"
          placeholder="Vehicle make..."
        />
        <TextInputStyled
          name={["vehicleInfo", "model"]}
          label="Vehicle Model"
          placeholder="Vehicle model..."
        />
      </div>

      <Heading>Financial Details</Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberInputStyled
          label="Premium Amount"
          name="premiumAmount"
          type="number"
          min={0}
          precision={2}
          rules={[
            {
              required: true,
              message: "Please enter premium amount",
            },
          ]}
          placeholder="Premium amount..."
          prefix={<MoneyIcon />}
        />
        <NumberInputStyled
          label="Agent Rate (%)"
          name="agentRate"
          type="number"
          min={0}
          max={100}
          precision={2}
          rules={[
            {
              required: true,
              message: "Please enter agent rate",
            },
          ]}
          placeholder="Agent rate..."
        />
        <NumberInputStyled
          label="Our Rate (%)"
          name="ourRate"
          type="number"
          min={0}
          max={100}
          precision={2}
          rules={[
            {
              required: true,
              message: "Please enter our rate",
            },
          ]}
          placeholder="Our rate..."
        />
        <NumberInputStyled
          label="TDS Rate (%)"
          name="tdsRate"
          type="number"
          min={0}
          max={100}
          precision={2}
          rules={[
            {
              required: true,
              message: "Please enter TDS rate",
            },
          ]}
          placeholder="TDS rate..."
        />
        <NumberInputStyled
          label="GST Rate (%)"
          name="gstRate"
          type="number"
          min={0}
          max={100}
          precision={2}
          rules={[
            {
              required: true,
              message: "Please enter GST rate",
            },
          ]}
          placeholder="GST rate..."
        />
      </div>
    </Form>
  );
};

export default PolicyHolderForm;
