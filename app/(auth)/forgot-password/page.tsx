"use client";

import { Button, Card, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { EmailIcon } from "@/client/icons/icons";
import { toast } from "@/lib/toaster";
import { sendPasswordReset } from "@/client/utils/firebase/firebase-auth-helpers";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (values: { email: string }) => {
    setLoading(true);
    try {
      await sendPasswordReset(values.email);
      toast.success("Password reset email sent!", "Please check your inbox for further instructions");
      form.resetFields();
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      toast.error("Failed to send reset email", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl xl:text-3xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 mt-1 text-sm">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <Card className="shadow-lg border-0">
        <Form
          form={form}
          onFinish={handleForgotPassword}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Email Address</span>}
            name="email"
            className="mb-5"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<EmailIcon className="text-gray-400" />}
              placeholder="you@example.com"
              className="h-11"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
              disabled={loading}
              className="h-11 text-base font-semibold"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div className="mt-5 text-center">
        <Link 
          href="/login" 
          className="text-primary-600 hover:text-primary-700 text-xs font-medium inline-flex items-center"
        >
          <span className="mr-2">←</span>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

