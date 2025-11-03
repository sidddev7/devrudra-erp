"use client";

import { AgentFormType, AgentType, GenericFormJSXType } from "@/typescript/types";
import { Form } from "antd";
import React, { useEffect } from "react";
import { TextInputStyled } from "../common/commonInputs";
import {
  CityIcon,
  EmailIcon,
  LocationIcon,
  PhoneIcon,
  StateIcon,
  UserIcon,
} from "@/client/icons/icons";
import { Heading } from "../common/commonViews";
import { FirestoreService } from "@/client/services/firestore.service";
import { COLLECTIONS } from "@/typescript/types";
import { useDispatch } from "react-redux";
import { addAgent, updateAgent } from "@/lib/redux/slices/agentSlice";
import { toast } from "@/lib/toaster";

const AgentForm = (props: GenericFormJSXType<AgentFormType, AgentType>) => {
  const dispatch = useDispatch();

  const handleSaveAgent = async (values: AgentType) => {
    try {
      if (props.data.mode === "Edit" && props.data.agent?.id) {
        const result = await FirestoreService.update(
          COLLECTIONS.AGENTS,
          props.data.agent.id,
          values
        );
        if (result.success) {
          toast.success("Agent updated successfully");
          dispatch(updateAgent({ ...values, id: props.data.agent.id }));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error("Failed to update agent", result.error);
        }
      } else {
        const result = await FirestoreService.create(COLLECTIONS.AGENTS, {
          ...values,
          isActive: true,
        });
        if (result.success) {
          toast.success("Agent created successfully");
          dispatch(addAgent(result.data as AgentType));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error("Failed to create agent", result.error);
        }
      }
    } catch (error: any) {
      toast.error("An error occurred", error.message);
    }
  };

  useEffect(() => {
    if (props.data.mode === "Edit" && props.data.agent) {
      props.form.setFieldsValue(props.data.agent);
    }
    if (!props.data.open) {
      props.form.resetFields();
    }
  }, [props.data, props.form]);

  return (
    <Form form={props.form} onFinish={handleSaveAgent} layout="vertical">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInputStyled
          label="Agent Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter agent name",
            },
          ]}
          placeholder="Agent name..."
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
          placeholder="Agent phone number..."
          prefix={<PhoneIcon />}
        />
        <TextInputStyled
          name="email"
          label="Agent Email"
          placeholder="Enter Agent Email"
          rules={[
            {
              type: "email",
              message: "Agent email is invalid",
            },
          ]}
          prefix={<EmailIcon />}
        />
      </div>

      <Heading>Agent Address</Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInputStyled
          name={["location", "address"]}
          label="Address"
          prefix={<LocationIcon />}
          placeholder="Enter Address"
          rules={[{ required: true, message: "Please enter agent address" }]}
        />
        <TextInputStyled
          name={["location", "city"]}
          label="City"
          prefix={<CityIcon />}
          placeholder="Enter agent city"
        />
        <TextInputStyled
          name={["location", "state"]}
          label="State"
          prefix={<StateIcon />}
          placeholder="Enter agent state"
        />
      </div>
    </Form>
  );
};

export default AgentForm;

