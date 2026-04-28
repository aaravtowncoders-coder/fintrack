import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { TrendingUp, Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { AnimatedRobot } from "../components/AnimatedRobot";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPwForReset, setNewPwForReset] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "token" | "done">("email");
  const [forgotMsg, setForgotMsg] = useState("");

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Backend returned an error (wrong email/password)
        setErrors({ general: data.message || "Invalid email or password." });
        setIsLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ email, name: data.name || email.split("@")[0] }));
      navigate("/app");
    } catch (err: any) {
      // Network error: backend is truly unavailable
      setErrors({ general: "Service unavailable. Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  const highlights = [
    "Track all your expenses in one place",
    "AI-powered savings recommendations",
    "Gamified habit builder with rewards",
    "Beautiful analytics dashboard",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0f1f3d] to-[#0f172a] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        <div className="relative z-10 text-center max-w-lg">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">FinTrack</span>
          </div>

          <div className="flex justify-center mb-8">
            <AnimatedRobot size="xl" animate={true} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Welcome back!</h2>
          <p className="text-gray-400 mb-8">Your AI financial assistant has been keeping an eye on things while you were away.</p>

          <div className="space-y-3 text-left">
            {highlights.map((h) => (
              <div key={h} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FinTrack</span>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl">

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
                <p className="text-gray-400">Enter your credentials to access your dashboard</p>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                  <span className="text-red-400 text-sm">{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
                      className={`pl-10 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors" onClick={() => { setShowForgotPw(true); setForgotStep("email"); setForgotMsg(""); setResetToken(""); setNewPwForReset(""); setForgotEmail(""); }}>
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }); }}
                      className={`pl-10 pr-10 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500 ${errors.password ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 accent-blue-500"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">Remember me for 30 days</label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-6 shadow-lg shadow-blue-500/20 group disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-gray-900 text-gray-500">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Google", icon: "G", color: "from-red-500 to-orange-500" },
                  { name: "GitHub", icon: "GH", color: "from-gray-600 to-gray-700" },
                ].map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => setErrors({ general: `${provider.name} login coming soon!` })}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all text-sm"
                  >
                    <div className={`w-5 h-5 rounded bg-gradient-to-br ${provider.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {provider.icon.charAt(0)}
                    </div>
                    {provider.name}
                  </button>
                ))}
              </div>

              <p className="text-center text-gray-400 text-sm mt-6">
                New to FinTrack?{" "}
                <button onClick={() => navigate("/signup")} className="text-blue-400 hover:text-blue-300 font-medium">
                  Create a free account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Reset Password</h2>
            
            {forgotMsg && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${forgotMsg.includes("success") || forgotMsg.includes("reset") ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-blue-500/10 border border-blue-500/30 text-blue-400"}`}>
                {forgotMsg}
              </div>
            )}

            {forgotStep === "email" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Email address</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="you@example.com"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowForgotPw(false)} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">Cancel</button>
                  <button
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/auth/forgot-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: forgotEmail }),
                        });
                        const data = await res.json();
                        if (data.resetToken) {
                          setResetToken(data.resetToken);
                          setForgotMsg(`Your reset code is: ${data.resetToken}`);
                          setForgotStep("token");
                        } else {
                          setForgotMsg(data.message || "If the email exists, a reset link has been generated.");
                          setForgotStep("token");
                        }
                      } catch { setForgotMsg("Service unavailable."); }
                    }}
                  >Send Reset Code</button>
                </div>
              </div>
            )}

            {forgotStep === "token" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Reset Code</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none tracking-widest font-mono text-center text-lg"
                    placeholder="XXXXXXXX"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">New Password (min 6 chars)</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
                    type="password"
                    placeholder="••••••••"
                    value={newPwForReset}
                    onChange={(e) => setNewPwForReset(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowForgotPw(false)} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">Cancel</button>
                  <button
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/auth/reset-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ token: resetToken, newPassword: newPwForReset }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setForgotMsg("Password reset successfully! You can now log in.");
                          setForgotStep("done");
                        } else {
                          setForgotMsg(data.message || "Invalid or expired token.");
                        }
                      } catch { setForgotMsg("Service unavailable."); }
                    }}
                  >Reset Password</button>
                </div>
              </div>
            )}

            {forgotStep === "done" && (
              <div className="space-y-4">
                <p className="text-green-400 text-sm">✓ Your password has been reset. Log in with your new password.</p>
                <button
                  onClick={() => setShowForgotPw(false)}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium"
                >Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
