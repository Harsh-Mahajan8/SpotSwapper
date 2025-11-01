import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useLogin, useSignup } from "@/hooks/useAuth";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import {
  ArrowLeftRight,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export default function Login() {
  const login = useLogin();
  const signup = useSignup();
  const [activeTab, setActiveTab] = useState("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [signupError, setSignupError] = useState("");

  // Redirect if already authenticated
  if (auth.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await login.mutateAsync({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setLoginError(err.response?.data?.error || "Login failed");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");
    setPasswordError("");

    // Validate passwords match
    if (signupPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await signup.mutateAsync({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
    } catch (err) {
      if (err.response?.data?.error) {
        setSignupError(err.response.data.error);
      } else if (err.response?.data?.errors) {
        setSignupError(
          err.response.data.errors
            .map((er) => er.msg || JSON.stringify(er))
            .join(", ")
        );
      } else {
        setSignupError("Signup failed");
      }
    }
  };

  return (
    <div className="flex bg-[#FAFAFA]">
      {/* Left Panel - Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-teal-50 to-cyan-50">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-600 text-white">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-gray-900">SlotSwapper</span>
        </div>

        {/* Tagline */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Swap Your Schedule, Simplify Your Life.
          </h2>
        </div>

        {/* Illustration Card */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="w-full max-w-md h-[350px] rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Clock Illustration */}
            <div className="relative z-10 mb-8">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center">
                <Clock className="h-16 w-16 text-white" />
              </div>
              {/* Calendar Icons around clock */}
              <div className="absolute -top-4 -right-4">
                <Calendar className="h-8 w-8 text-white/80" />
              </div>
              <div className="absolute -bottom-4 -left-4">
                <Calendar className="h-8 w-8 text-white/80" />
              </div>
              <div className="absolute top-1/2 -left-6">
                <Calendar className="h-8 w-8 text-white/80" />
              </div>
              <div className="absolute top-1/2 -right-6">
                <Calendar className="h-8 w-8 text-white/80" />
              </div>
            </div>

            {/* Platform Illustration */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gray-200/30 rounded-t-3xl">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-24 bg-amber-100 rounded-t-full border-t-4 border-amber-300"></div>
            </div>
          </div>
        </div>

        
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === "login" ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="text-gray-600">
              {activeTab === "login"
                ? "Sign in to continue to SlotSwapper"
                : "Join our community and start swapping."}
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 h-12">
              <TabsTrigger
                value="login"
                className={`rounded-lg transition-all ${
                  activeTab === "login"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Log In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className={`rounded-lg transition-all ${
                  activeTab === "signup"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {loginError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-12 rounded-lg border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-12 rounded-lg border-gray-300 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium"
                  disabled={login.isPending}
                >
                  {login.isPending ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignup} className="space-y-5">
                {signupError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {signupError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="h-12 rounded-lg border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="h-12 rounded-lg border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Enter a strong password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="h-12 rounded-lg border-gray-300 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (
                          e.target.value &&
                          e.target.value !== signupPassword
                        ) {
                          setPasswordError("Passwords do not match");
                        } else {
                          setPasswordError("");
                        }
                      }}
                      className={`h-12 rounded-lg pr-10 ${
                        passwordError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {passwordError && (
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                          <AlertCircle className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {passwordError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium"
                  disabled={signup.isPending || !!passwordError}
                >
                  {signup.isPending ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Terms & Privacy */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By {activeTab === "login" ? "signing in" : "signing up"}, you agree
            to our{" "}
            <a href="#" className="text-teal-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-teal-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
