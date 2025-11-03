import { Spin } from "antd";

export default function HomePage() {
  // Middleware will handle the redirect to either /login or /agents
  return (
    <div className="flex items-center justify-center h-screen">
      <Spin size="large" tip="Loading..." />
    </div>
  );
}
