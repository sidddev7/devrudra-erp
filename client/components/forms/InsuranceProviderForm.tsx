"use client";

import {
  InsuranceProviderFormType,
  InsuranceProviderType,
  GenericFormJSXType,
} from "@/typescript/types";
import { Form } from "antd";
import React, { useEffect } from "react";
import { TextInputStyled, NumberInputStyled } from "../common/commonInputs";
import { UserIcon, PercentIcon } from "@/client/icons/icons";
import { FirestoreService } from "@/client/services/firestore.service";
import { COLLECTIONS } from "@/typescript/types";
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

  const handleSaveProvider = async (values: InsuranceProviderType) => {
    try {
      if (props.data.mode === "Edit" && props.data.insuranceProvider?.id) {
        const result = await FirestoreService.update(
          COLLECTIONS.INSURANCE_PROVIDERS,
          props.data.insuranceProvider.id,
          values
        );
        if (result.success) {
          toast.success("Insurance Provider updated successfully");
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
        const result = await FirestoreService.create(
          COLLECTIONS.INSURANCE_PROVIDERS,
          {
            ...values,
            isActive: true,
          }
        );
        if (result.success) {
          toast.success("Insurance Provider created successfully");
          dispatch(addInsuranceProvider(result.data as InsuranceProviderType));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error(result.error || "Failed to create insurance provider");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
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
          rules={[
            {
              required: true,
              message: "Please enter provider name",
            },
          ]}
          placeholder="Provider name..."
          prefix={<UserIcon />}
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
          prefix={<PercentIcon />}
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
          prefix={<PercentIcon />}
        />
        <NumberInputStyled
          label="TDS (%)"
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
          ]}
          placeholder="TDS rate..."
          prefix={<PercentIcon />}
        />
        <NumberInputStyled
          label="GST (%)"
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
          ]}
          placeholder="GST rate..."
          prefix={<PercentIcon />}
        />
      </div>
    </Form>
  );
};

export default InsuranceProviderForm;
