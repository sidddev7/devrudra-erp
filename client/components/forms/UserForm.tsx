"use client";

import { UserFormType, UserType, GenericFormJSXType } from "@/typescript/types";
import { Form, Select } from "antd";
import React, { useEffect } from "react";
import { TextInputStyled, TextPasswordStyled } from "../common/commonInputs";
import { UserIcon, PhoneIcon, EmailIcon } from "@/client/icons/icons";
import { FirestoreService } from "@/client/services/firestore.service";
import { COLLECTIONS } from "@/typescript/types";
import { useDispatch } from "react-redux";
import { addUser, updateUser } from "@/lib/redux/slices/userSlice";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/client/utils/firebase/firebase";
import { toast } from "@/lib/toaster";

const UserForm = (props: GenericFormJSXType<UserFormType, UserType>) => {
  const dispatch = useDispatch();

  const handleSaveUser = async (values: UserType & { password?: string }) => {
    try {
      if (props.data.mode === "Edit" && props.data.user?.id) {
        const { password, ...updateData } = values;
        const result = await FirestoreService.update(
          COLLECTIONS.USERS,
          props.data.user.id,
          updateData
        );
        if (result.success) {
          toast.success("User updated successfully");
          dispatch(updateUser({ ...updateData, id: props.data.user.id }));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error("Failed to update user", result.error);
        }
      } else {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password!
        );

        const userData = {
          email: values.email,
          name: values.name,
          phoneNumber: values.phoneNumber,
          username: values.username,
          role: values.role,
          firebaseUid: userCredential.user.uid,
          isActive: true,
        };

        const result = await FirestoreService.create(
          COLLECTIONS.USERS,
          userData
        );

        if (result.success) {
          toast.success("User created successfully");
          dispatch(addUser(result.data as UserType));
          props.form.resetFields();
          if (props.onClose) props.onClose();
        } else {
          toast.error("Failed to create user", result.error);
        }
      }
    } catch (error: any) {
      toast.error("An error occurred", error.message);
    }
  };

  useEffect(() => {
    if (props.data.mode === "Edit" && props.data.user) {
      props.form.setFieldsValue(props.data.user);
    }
    if (!props.data.open) {
      props.form.resetFields();
    }
  }, [props.data, props.form]);

  return (
    <Form form={props.form} onFinish={handleSaveUser} layout="vertical">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInputStyled
          label="Full Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter full name",
            },
          ]}
          placeholder="Full name..."
          prefix={<UserIcon />}
        />
        <TextInputStyled
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: "Please enter username",
            },
          ]}
          placeholder="Username..."
          prefix={<UserIcon />}
        />
        <TextInputStyled
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: "Please enter email",
            },
            {
              type: "email",
              message: "Please enter valid email",
            },
          ]}
          placeholder="Email..."
          prefix={<EmailIcon />}
          disabled={props.data.mode === "Edit"}
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
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please select role" }]}
        >
          <Select placeholder="Select role">
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="sub-user">Sub User</Select.Option>
          </Select>
        </Form.Item>
        {props.data.mode === "Add" && (
          <TextPasswordStyled
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter password",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
            placeholder="Password..."
          />
        )}
      </div>
    </Form>
  );
};

export default UserForm;


