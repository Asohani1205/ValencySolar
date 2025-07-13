import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Zap } from "lucide-react";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { login } = useAuth();

  const handleAuthSuccess = (user: any, token: string) => {
    login(user, token);
    // Redirect to home page or dashboard
    window.location.href = "/";
  };

  const handleSwitchMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <Sun className="h-16 w-16 text-yellow-500" />
                  <Zap className="h-8 w-8 text-blue-500 absolute -top-2 -right-2" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold text-gray-800 mb-4">
                ValencySolar
              </CardTitle>
              <p className="text-xl text-gray-600 mb-6">
                Your Gateway to Solar Energy Solutions
              </p>
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Accurate solar calculations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Government subsidy tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">AI-powered recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Vendor comparison tools</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">EMI calculator & financing</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Join thousands of users saving on electricity bills
                </h3>
                <p className="text-sm text-gray-600">
                  Get personalized solar recommendations, track subsidies, and connect with verified vendors.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Auth Forms */}
        <div className="flex items-center justify-center">
          {mode === "login" ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={handleSwitchMode}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={handleSwitchMode}
            />
          )}
        </div>

        {/* Mobile branding */}
        <div className="md:hidden text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Sun className="h-12 w-12 text-yellow-500" />
              <Zap className="h-6 w-6 text-blue-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ValencySolar</h1>
          <p className="text-gray-600">Your Gateway to Solar Energy Solutions</p>
        </div>
      </div>
    </div>
  );
} 