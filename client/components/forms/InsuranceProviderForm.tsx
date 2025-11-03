"use client";

import {
  InsuranceProviderFormType,
  InsuranceProviderType,
  GenericFormJSXType,
} from "@/typescript/types";
import { Form } from "antd";
import React, { useEffect, useState } from "react";
import { TextInputStyled, NumberInputStyled } from "../common/commonInputs";
import { UserIcon, PercentIcon } from "@/client/icons/icons";
import { InsuranceProviderService } from "@/client/services/insuranceProvider.service";
import { validateInsuranceProvider } from "@/client/utils/validation.utils";
import { useDispatch } from "react-redux";
import {
  addInsuranceProvider,
  updateInsuranceProvider,
} from "@/lib/redux/slices/insuranceProviderSlice";
import { toast } from "@/lib/toaster";

const InsuranceProviderForm = (
  props: GenericFormJSXType<InsuranceProviderFormType, InsuranceProviderType>
) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSaveProvider = async (values: InsuranceProviderType) => {
    try {
      setLoading(true);

      // Include id in validation data for Edit mode
      const validationData = props.data.mode === "Edit" && props.data.insuranceProvider?.id
        ? { ...values, id: props.data.insuranceProvider.id }
        : values;

      // Validate data
      const validation = validateInsuranceProvider(validationData, props.data.mode);
      if (!validation.isValid) {
        // Display first validation error
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        setLoading(false);
        return;
      }

      if (props.data.mode === "Edit" && props.data.insuranceProvider?.id) {
        // Update existing provider
        const result = await InsuranceProviderService.update(
          props.data.insuranceProvider.id,
          values
        );
        
        if (result.success) {
          toast.success(result.message || "Insurance provider updated successfully");
          dispatch(
            updateInsuranceProvider({
              ...values,
              id: props.data.insuranceProvider.id,
            })
          );
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error(result.error || "Failed to update insurance provider");
        }
      } else {
        // Create new provider
        const result = await InsuranceProviderService.create(values);
        
        if (result.success) {
          toast.success(result.message || "Insurance provider created successfully");
          dispatch(addInsuranceProvider(result.data as InsuranceProviderType));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error(result.error || "Failed to create insurance provider");
        }
      }
    } catch (error: any) {
      console.error("Error saving insurance provider:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props.data.mode === "Edit" && props.data.insuranceProvider) {
      props.form.setFieldsValue(props.data.insuranceProvider);
    }
    if (!props.data.open) {
      props.form.resetFields();
    }
  }, [props.data, props.form]);

  return (
    <Form form={props.form} onFinish={handleSaveProvider} layout="vertical">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInputStyled
          label="Provider Name"
          name="name"
          className="md:col-span-2"
          rules={[
            {
              required: true,
              message: "Please enter provider name",
            },
            {
              pattern: /^[^${};<>`]+$/,
              message: "Provider name should not contain symbols like '$', '}', '{', ';', '<', '>', '`'",
            },
          ]}
          placeholder="Enter provider name..."
          prefix={<UserIcon />}
          disabled={loading}
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
            {
              type: "number",
              min: 0,
              max: 100,
              message: "Agent rate must be between 0 and 100",
            },
          ]}
          placeholder="Enter agent rate..."
          prefix={<PercentIcon />}
          disabled={loading}
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
            {
              type: "number",
              min: 0,
              max: 100,
              message: "Our rate must be between 0 and 100",
            },
          ]}
          placeholder="Enter our rate..."
          prefix={<PercentIcon />}
          disabled={loading}
        />
        <NumberInputStyled
          label="TDS Rate (%)"
          name="tds"
          type="number"
          min={0}
          max={100}
          precision={2}
          rules={[
            {
              required: true,
              message: "Please enter TDS rate",
            },
            {
              type: "number",
              min: 0,
              max: 100,
              message: "TDS rate must be between 0 and 100",
            },
          ]}
          placeholder="Enter TDS rate..."
          prefix={<PercentIcon />}
          disabled={loading}
        />
        <NumberInputStyled
          label="GST Rate (%)"
          name="gst"
          type="number"
          min={0}
          max={100}
          precision={2}
          rules={[
            {
              required: true,
              message: "Please enter GST rate",
            },
            {
              type: "number",
              min: 0,
              max: 100,
              message: "GST rate must be between 0 and 100",
            },
          ]}
          placeholder="Enter GST rate..."
          prefix={<PercentIcon />}
          disabled={loading}
        />
      </div>
    </Form>
  );
};

export default InsuranceProviderForm;
