import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 text-white w-full">
          {/* Logo/Brand */}
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold mb-2">Dev Rudra Consultancy</h1>
            <div className="h-1 w-20 bg-white/80 rounded"></div>
          </div>

          {/* Main Content */}
          <div className="space-y-4 xl:space-y-6">
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              Simplify Your
              <br />
              Insurance Management
            </h2>
            <p className="text-lg xl:text-xl text-white/90 max-w-md">
              Streamline your policy tracking, agent management, and commission calculations all in one place.
            </p>
            
            {/* Features */}
            <div className="space-y-3 xl:space-y-4 mt-6 xl:mt-8">
              {[
                { icon: "📊", text: "Real-time Analytics & Reports" },
                { icon: "🔒", text: "Secure Data Management" },
                { icon: "⚡", text: "Fast & Efficient Workflow" },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <span className="text-xl xl:text-2xl">{feature.icon}</span>
                  <span className="text-base xl:text-lg">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-white/70 text-xs xl:text-sm">
            © 2024 Dev Rudra Consultancy. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-primary-50 p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Dev Rudra Consultancy
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Insurance Management System</p>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  );
}

