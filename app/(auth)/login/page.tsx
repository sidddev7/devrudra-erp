"use client";

import { Button, Card, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { EmailIcon } from "@/client/icons/icons";
import { FaLock } from "react-icons/fa";
import { toast } from "@/lib/toaster";
import { signInWithEmail, createSession } from "@/client/utils/firebase/firebase-auth-helpers";

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      // Sign in with Firebase
      const { idToken } = await signInWithEmail(values.email, values.password);
      
      // Create session cookie
      await createSession(idToken);

      toast.success("Login successful!", "Welcome back to Dev Rudra Consultancy");
      router.push("/dashboard");
      router.refresh(); // Force a refresh to update middleware
    } catch (error: any) {
      toast.error("Login failed", error.message || "Please check your credentials and try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl xl:text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-1 text-sm">Sign in to your account to continue</p>
      </div>

      <Card className="shadow-lg border-0">
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Email Address</span>}
            name="email"
            className="mb-4"
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

          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Password</span>}
            name="password"
            className="mb-3"
            rules={[
              { required: true, message: "Please enter your password!" },
            ]}
          >
            <Input.Password
              prefix={<FaLock className="text-gray-400" />}
              placeholder="Enter your password"
              className="h-11"
            />
          </Form.Item>

          <div className="flex items-center justify-end mb-5">
            <Link
              href="/forgot-password"
              className="text-primary-600 hover:text-primary-700 text-xs font-medium"
            >
              Forgot Password?
            </Link>
          </div>

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
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div className="mt-4 text-center text-xs text-gray-600">
        Need help?{" "}
        <a href="mailto:support@devrudra.com" className="text-primary-600 hover:text-primary-700 font-medium">
          Contact Support
        </a>
      </div>
    </div>
  );
}

