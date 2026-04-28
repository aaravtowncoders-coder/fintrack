import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { TrendingUp, User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Globe } from "lucide-react";
import { AnimatedRobot } from "../components/AnimatedRobot";

type Step = 1 | 2;

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "in",
    currency: "inr",
    monthlyIncome: "",
    savingsGoal: "",
  });

    const update = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError("");
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Backend returned an error (e.g. duplicate email)
        setError(data.message || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }
      navigate("/login");
    } catch (err: any) {
      // Network error: backend is truly unavailable
      setError("Service unavailable. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Free forever — no hidden charges",
    "AI-powered expense categorization",
    "Gamified savings challenges",
    "Beautiful analytics & insights",
    "Supports INR, USD, EUR & more",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0f1f3d] to-[#0f172a] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col items-center justify-center p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
        <div className="relative z-10 max-w-sm w-full">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FinTrack</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">Start your financial journey</h2>
          <p className="text-gray-400 mb-8">Join 2.4 lakh+ Indians managing their money smarter.</p>

          <div className="flex justify-center mb-8">
            <AnimatedRobot size="lg" animate={true} />
          </div>

          <div className="space-y-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FinTrack</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s < step ? "bg-green-500 text-white" :
                  s === step ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30" :
                  "bg-gray-800 text-gray-500 border border-gray-700"
                }`}>
                  {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className={`text-sm ${s === step ? "text-white font-medium" : "text-gray-500"}`}>
                  {s === 1 ? "Account Details" : "Preferences"}
                </span>
                {s < 2 && <div className={`h-0.5 w-8 rounded ${s < step ? "bg-green-500" : "bg-gray-700"}`} />}
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl">

              {step === 1 ? (
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
                    <p className="text-gray-400">Fill in your details to get started</p>
                  </div>

                  <form onSubmit={handleNext} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="name"
                          placeholder="Rahul Sharma"
                          value={formData.name}
                          onChange={(e) => update("name", e.target.value)}
                          required
                          className="pl-10 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="rahul@example.com"
                          value={formData.email}
                          onChange={(e) => update("email", e.target.value)}
                          required
                          className="pl-10 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={formData.password}
                          onChange={(e) => update("password", e.target.value)}
                          required
                          minLength={8}
                          className="pl-10 pr-10 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.password.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                              formData.password.length > i * 2 + 2
                                ? i < 2 ? "bg-red-400" : i < 3 ? "bg-yellow-400" : "bg-green-400"
                                : "bg-gray-700"
                            }`} />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-gray-500 mb-4">
                        By creating an account, you agree to our{" "}
                        <a href="#" className="text-blue-400">Terms of Service</a> and{" "}
                        <a href="#" className="text-blue-400">Privacy Policy</a>.
                      </p>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-6 group"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Set your preferences</h1>
                    <p className="text-gray-400">Customize your FinTrack experience</p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">
                          <Globe className="w-3 h-3 inline mr-1" />Country
                        </Label>
                        <Select value={formData.country} onValueChange={(v) => update("country", v)}>
                          <SelectTrigger className="bg-gray-900/60 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "in", label: "🇮🇳 India" },
                              { value: "us", label: "🇺🇸 USA" },
                              { value: "uk", label: "🇬🇧 UK" },
                              { value: "ca", label: "🇨🇦 Canada" },
                              { value: "au", label: "🇦🇺 Australia" },
                              { value: "sg", label: "🇸🇬 Singapore" },
                              { value: "ae", label: "🇦🇪 UAE" },
                            ].map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Currency</Label>
                        <Select value={formData.currency} onValueChange={(v) => update("currency", v)}>
                          <SelectTrigger className="bg-gray-900/60 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "inr", label: "INR (₹)" },
                              { value: "usd", label: "USD ($)" },
                              { value: "eur", label: "EUR (€)" },
                              { value: "gbp", label: "GBP (£)" },
                              { value: "aud", label: "AUD ($)" },
                              { value: "sgd", label: "SGD ($)" },
                              { value: "aed", label: "AED (د.إ)" },
                            ].map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="income" className="text-gray-300">Monthly Income (optional)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="income"
                          type="number"
                          placeholder="e.g. 80000"
                          value={formData.monthlyIncome}
                          onChange={(e) => update("monthlyIncome", e.target.value)}
                          className="pl-8 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="savings" className="text-gray-300">Monthly Savings Goal (optional)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="savings"
                          type="number"
                          placeholder="e.g. 20000"
                          value={formData.savingsGoal}
                          onChange={(e) => update("savingsGoal", e.target.value)}
                          className="pl-8 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-600"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                        onClick={() => setStep(1)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-6 group"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Create Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}

              <p className="text-center text-gray-400 text-sm mt-6">
                Already have an account?{" "}
                <button onClick={() => navigate("/login")} className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
