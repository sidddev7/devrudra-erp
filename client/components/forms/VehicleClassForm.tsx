"use client";

import {
  VehicleFormType,
  VehicleType,
  GenericFormJSXType,
} from "@/typescript/types";
import { Form } from "antd";
import React, { useEffect } from "react";
import { TextInputStyled, NumberInputStyled } from "../common/commonInputs";
import { CarIcon, PercentIcon } from "@/client/icons/icons";
import { FirestoreService } from "@/client/services/firestore.service";
import { COLLECTIONS } from "@/typescript/types";
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

  const handleSaveVehicleClass = async (values: VehicleType) => {
    try {
      if (props.data.mode === "Edit" && props.data.vehicleClass?.id) {
        const result = await FirestoreService.update(
          COLLECTIONS.VEHICLE_CLASSES,
          props.data.vehicleClass.id,
          values
        );
        if (result.success) {
          toast.success("Vehicle Class updated successfully");
          dispatch(
            updateVehicleClass({ ...values, id: props.data.vehicleClass.id })
          );
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error(result.error || "Failed to update vehicle class");
        }
      } else {
        const result = await FirestoreService.create(
          COLLECTIONS.VEHICLE_CLASSES,
          {
            ...values,
            isActive: true,
          }
        );
        if (result.success) {
          toast.success("Vehicle Class created successfully");
          dispatch(addVehicleClass(result.data as VehicleType));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error(result.error || "Failed to create vehicle class");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
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
          rules={[
            {
              required: true,
              message: "Please enter vehicle class name",
            },
          ]}
          placeholder="Vehicle class name..."
          prefix={<CarIcon />}
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
          ]}
          placeholder="Commission rate..."
          prefix={<PercentIcon />}
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
      </div>
    </Form>
  );
};

export default VehicleClassForm;
