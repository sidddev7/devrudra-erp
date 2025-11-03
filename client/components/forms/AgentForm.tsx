"use client";

import { AgentFormType, AgentType, GenericFormJSXType } from "@/typescript/types";
import { Form, Spin } from "antd";
import React, { useEffect, useState } from "react";
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
import { AgentService } from "@/client/services/agent.service";
import { useDispatch, useSelector } from "react-redux";
import { addAgent, updateAgent } from "@/lib/redux/slices/agentSlice";
import { toast } from "@/lib/toaster";
import { validateAgent, hasDangerousCharacters } from "@/client/utils/validation.utils";
import { RootState } from "@/lib/redux/store";

const AgentForm = (props: GenericFormJSXType<AgentFormType, AgentType>) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state: RootState) => state.user.user);

  const handleSaveAgent = async (values: any) => {
    setLoading(true);
    
    try {
      // Normalize and trim values
      const normalizedValues = {
        ...values,
        name: values.name?.trim(),
        phoneNumber: values.phoneNumber?.trim(),
        email: values.email?.trim() || "",
        location: {
          address: values.location?.address?.trim().toLowerCase() || "",
          city: values.location?.city?.trim().toLowerCase() || "",
          state: values.location?.state?.trim().toLowerCase() || "",
        },
      };

      // Include id in validation data for Edit mode
      const validationData = props.data.mode === "Edit" && props.data.agent?.id
        ? { ...normalizedValues, id: props.data.agent.id }
        : normalizedValues;

      // Client-side validation
      const validation = validateAgent(validationData, props.data.mode);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        toast.error("Validation Error", firstError);
        setLoading(false);
        return;
      }

      if (props.data.mode === "Edit" && props.data.agent?.id) {
        // Update existing agent
        const result = await AgentService.updateAgent(
          props.data.agent.id,
          normalizedValues,
          currentUser?.id
        );
        
        if (result.success) {
          toast.success(result.message || "Agent updated successfully");
          dispatch(updateAgent({ ...normalizedValues, id: props.data.agent.id }));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error("Update Failed", result.error || "Failed to update agent");
        }
      } else {
        // Create new agent
        const result = await AgentService.createAgent(
          normalizedValues,
          currentUser?.id
        );
        
        if (result.success) {
          toast.success(result.message || "Agent created successfully");
          dispatch(addAgent(result.data as AgentType));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error("Creation Failed", result.error || "Failed to create agent");
        }
      }
    } catch (error: any) {
      console.error("Error saving agent:", error);
      toast.error("An error occurred", error.message || "Unknown error");
    } finally {
      setLoading(false);
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
    <Spin spinning={loading} tip="Saving agent...">
      <Form 
        form={props.form} 
        onFinish={handleSaveAgent} 
        layout="vertical"
        disabled={loading}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInputStyled
            label="Agent Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter agent name",
              },
              {
                min: 2,
                message: "Agent name must be at least 2 characters",
              },
              {
                max: 100,
                message: "Agent name must not exceed 100 characters",
              },
            ]}
            placeholder="Enter agent name"
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
                message: "Phone number must be exactly 10 digits",
              },
            ]}
            placeholder="Enter 10 digit phone number"
            prefix={<PhoneIcon />}
            maxLength={10}
          />
          <TextInputStyled
            name="email"
            label="Agent Email (Optional)"
            placeholder="Enter agent email"
            rules={[
              {
                type: "email",
                message: "Please enter a valid email address",
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
            placeholder="Enter complete address"
            rules={[
              { 
                required: true, 
                message: "Please enter agent address" 
              },
              {
                validator: (_, value) => {
                  if (value && hasDangerousCharacters(value)) {
                    return Promise.reject(
                      new Error("Address should not contain symbols like $, }, {, ;, <, >, `")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          />
          <TextInputStyled
            name={["location", "city"]}
            label="City"
            prefix={<CityIcon />}
            placeholder="Enter city"
            rules={[
              {
                validator: (_, value) => {
                  if (value && hasDangerousCharacters(value)) {
                    return Promise.reject(
                      new Error("City should not contain symbols like $, }, {, ;, <, >, `")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          />
          <TextInputStyled
            name={["location", "state"]}
            label="State"
            prefix={<StateIcon />}
            placeholder="Enter state"
            rules={[
              {
                validator: (_, value) => {
                  if (value && hasDangerousCharacters(value)) {
                    return Promise.reject(
                      new Error("State should not contain symbols like $, }, {, ;, <, >, `")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          />
        </div>
      </Form>
    </Spin>
  );
};

export default AgentForm;

