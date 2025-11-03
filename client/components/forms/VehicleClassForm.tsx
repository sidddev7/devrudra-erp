"use client";

import {
  VehicleFormType,
  VehicleType,
  GenericFormJSXType,
} from "@/typescript/types";
import { Form } from "antd";
import React, { useEffect, useState } from "react";
import { TextInputStyled, NumberInputStyled } from "../common/commonInputs";
import { CarIcon, PercentIcon } from "@/client/icons/icons";
import { VehicleClassService } from "@/client/services/vehicleClass.service";
import { validateVehicleClass } from "@/client/utils/validation.utils";
import { useDispatch } from "react-redux";
import {
  addVehicleClass,
  updateVehicleClass,
} from "@/lib/redux/slices/vehicleClassSlice";
import { toast } from "@/lib/toaster";

const VehicleClassForm = (
  props: GenericFormJSXType<VehicleFormType, VehicleType>
) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSaveVehicleClass = async (values: VehicleType) => {
    try {
      setLoading(true);

      // Include id in validation data for Edit mode
      const validationData = props.data.mode === "Edit" && props.data.vehicleClass?.id
        ? { ...values, id: props.data.vehicleClass.id }
        : values;

      // Validate data
      const validation = validateVehicleClass(validationData, props.data.mode);
      if (!validation.isValid) {
        // Display first validation error
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        setLoading(false);
        return;
      }

      if (props.data.mode === "Edit" && props.data.vehicleClass?.id) {
        // Update existing vehicle class
        const result = await VehicleClassService.updateVehicleClass(
          props.data.vehicleClass.id,
          values
        );
        
        if (result.success) {
          toast.success(result.message || "Vehicle class updated successfully");
          dispatch(
            updateVehicleClass({
              ...values,
              id: props.data.vehicleClass.id,
            })
          );
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error(result.error || "Failed to update vehicle class");
        }
      } else {
        // Create new vehicle class
        const result = await VehicleClassService.createVehicleClass(values);
        
        if (result.success) {
          toast.success(result.message || "Vehicle class created successfully");
          dispatch(addVehicleClass(result.data as VehicleType));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error(result.error || "Failed to create vehicle class");
        }
      }
    } catch (error: any) {
      console.error("Error saving vehicle class:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props.data.mode === "Edit" && props.data.vehicleClass) {
      props.form.setFieldsValue(props.data.vehicleClass);
    }
    if (!props.data.open) {
      props.form.resetFields();
    }
  }, [props.data, props.form]);

  return (
    <Form form={props.form} onFinish={handleSaveVehicleClass} layout="vertical">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInputStyled
          label="Vehicle Class Name"
          name="name"
          className="md:col-span-2"
          rules={[
            {
              required: true,
              message: "Please enter vehicle class name",
            },
            {
              pattern: /^[^${};<>`]+$/,
              message: "Vehicle class name should not contain symbols like '$', '}', '{', ';', '<', '>', '`'",
            },
          ]}
          placeholder="Enter vehicle class name..."
          prefix={<CarIcon />}
          disabled={loading}
        />
        <NumberInputStyled
          label="Commission Rate (%)"
          name="commissionRate"
          type="number"
          min={0}
          max={100}
          precision={2}
          rules={[
            {
              required: true,
              message: "Please enter commission rate",
            },
            {
              type: "number",
              min: 0,
              max: 100,
              message: "Commission rate must be between 0 and 100",
            },
          ]}
          placeholder="Enter commission rate..."
          prefix={<PercentIcon />}
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
      </div>
    </Form>
  );
};

export default VehicleClassForm;
