import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import {
  ArrowRight, TrendingUp, Shield, Target, CheckCircle2,
  BarChart3, Sparkles, Star, Users, Receipt, Zap
} from "lucide-react";
import { AnimatedRobot } from "../components/AnimatedRobot";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer, Bengaluru",
    text: "Finance Tracker helped me save ₹2 lakhs in just 6 months! The habit builder is incredible.",
    rating: 5,
    avatar: "PS",
    color: "from-blue-500 to-teal-500",
  },
  {
    name: "Rahul Mehta",
    role: "Entrepreneur, Mumbai",
    text: "The AI assistant gives me tips I actually use. Finally took control of my business expenses!",
    rating: 5,
    avatar: "RM",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Anjali Nair",
    role: "Doctor, Chennai",
    text: "The analytics are so detailed. I can see exactly where my money goes every month.",
    rating: 5,
    avatar: "AN",
    color: "from-teal-500 to-blue-500",
  },
];

const stats = [
  { value: "2.4L+", label: "Active Users", icon: Users },
  { value: "₹840Cr+", label: "Tracked Expenses", icon: Receipt },
  { value: "₹120Cr+", label: "Total Saved", icon: TrendingUp },
  { value: "4.9★", label: "User Rating", icon: Star },
];

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Get deep insights into your spending patterns with beautiful interactive charts and AI-powered recommendations.",
    color: "blue",
    gradient: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set financial goals and track your progress with gamified challenges, XP rewards, and achievement badges.",
    color: "purple",
    gradient: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/20",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Bank-level encryption keeps your data safe. We never sell or share your financial information.",
    color: "teal",
    gradient: "from-teal-500/20 to-teal-600/5",
    border: "border-teal-500/20",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up in under 2 minutes. Choose your currency and connect your preferences.",
    color: "blue",
  },
  {
    step: "02",
    title: "Log Your Expenses",
    description: "Add expenses manually or let our AI categorize them automatically for you.",
    color: "purple",
  },
  {
    step: "03",
    title: "Watch Your Savings Grow",
    description: "Get personalized tips, complete challenges, and achieve your financial goals.",
    color: "teal",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0f1f3d] to-[#0f172a] overflow-x-hidden">

      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f172a]/80 border-b border-gray-800/50">
        <div className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FinTrack</span>
            <span className="hidden md:block px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">India</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hidden md:flex"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
              onClick={() => navigate("/signup")}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">AI-Powered Finance Tracker for India</span>
            </div>

            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                Smart Money,{" "}
                <span
                  className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent"
                  style={{ WebkitBackgroundClip: "text" }}
                >
                  Better Life
                </span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Track every rupee, build saving habits, and achieve financial freedom with your personal AI assistant.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 shadow-xl shadow-blue-500/30 group"
                onClick={() => navigate("/signup")}
              >
                Start Free — No Credit Card
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white text-black hover:bg-gray-100 hover:text-black font-semibold"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              {["No credit card required", "Free forever plan", "Cancel anytime"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Hero Robot + Dashboard Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl border border-gray-700/50 overflow-hidden bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-sm p-8">
              {/* Mock dashboard preview */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Balance</p>
                  <p className="text-3xl font-bold text-white">₹19,68,400</p>
                  <p className="text-xs text-green-400 mt-1">↑ +12.5% this month</p>
                </div>
                <AnimatedRobot size="lg" animate={true} />
              </div>

              {/* Mini chart bars */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-3">Spending Overview</p>
                <div className="flex items-end gap-2 h-20">
                  {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm" style={{
                      height: `${h}%`,
                      background: i === 5
                        ? "linear-gradient(to top, #3b82f6, #a855f7)"
                        : "rgba(59,130,246,0.2)",
                    }} />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i} className="flex-1 text-center">{d}</span>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Income", value: "₹4.4L", color: "text-green-400" },
                  { label: "Expenses", value: "₹2.7L", color: "text-red-400" },
                  { label: "Savings", value: "₹1.7L", color: "text-blue-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                    <p className={`font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <section className="border-y border-gray-800/50 bg-gray-900/30 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm">Powerful Features</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Everything you need to thrive financially</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From expense tracking to gamified savings — we've built the most comprehensive finance app for India.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`relative rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} p-8 hover:scale-105 transition-all duration-300 group cursor-default`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/15 border border-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-gray-900/20 py-24 border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Get started in minutes</h2>
            <p className="text-gray-400 text-lg">Three simple steps to financial clarity</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-500/40 to-teal-500/40" />

            {steps.map((step, index) => (
              <div key={step.step} className="text-center relative">
                <div className={`w-20 h-20 rounded-3xl bg-${step.color}-500/10 border-2 border-${step.color}-500/30 flex items-center justify-center mx-auto mb-6`}>
                  <span className={`text-3xl font-black text-${step.color}-400`}>{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-10 -right-6 w-6 h-6 text-gray-700 transform translate-y-[-50%]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Loved by users across India</h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-gray-400">4.9 out of 5 from 12,400+ reviews</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm p-8 hover:border-gray-600/50 transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-medium text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 py-24 text-center">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-teal-500/20 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-blue-500/20 rounded-3xl" />
          <div className="relative p-12 md:p-20">
            <div className="flex justify-center mb-8">
              <AnimatedRobot size="xl" animate={true} />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Your financial journey starts today
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
              Join 2.4 lakh+ Indians already using FinTrack to take control of their money.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-6 shadow-2xl shadow-blue-500/30 group"
              onClick={() => navigate("/signup")}
            >
              Start Tracking Free Today
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">FinTrack</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">The #1 AI-powered finance tracker built for India.</p>
            </div>
            {[
              { title: "Product", links: ["Dashboard", "Expenses", "Analytics", "Habit Builder"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Support", links: ["Help Center", "Contact", "Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-medium text-white mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© 2026 FinTrack. Made with ❤️ in India.</p>
            <p className="text-sm text-gray-600">Built for the next generation of Indian savers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
