import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import {
  Wallet, TrendingDown, PiggyBank, Target,
  ArrowUpRight, ArrowDownRight, Plus, Send,
  Coffee, ShoppingCart, Zap, Home, ChevronRight,
  TrendingUp
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import { RobotGuide } from "../components/RobotGuide";
import { useNavigate } from "react-router";

const fallbackStats = [
  { label: "Total Balance", value: "₹0", change: "0%", trend: "up" as const, icon: Wallet, color: "blue", sub: "no data yet", sparkline: [0] },
  { label: "Monthly Expenses", value: "₹0", change: "0%", trend: "down" as const, icon: TrendingDown, color: "purple", sub: "no data yet", sparkline: [0] },
  { label: "Total Savings", value: "₹0", change: "0%", trend: "up" as const, icon: PiggyBank, color: "teal", sub: "no data yet", sparkline: [0] },
  { label: "Budget Remaining", value: "₹0", change: "0%", trend: "up" as const, icon: Target, color: "pink", sub: "no data yet", sparkline: [0] },
];

const fallbackChartData = [
  { month: "Jan", income: 0, expenses: 0, savings: 0 },
];

const quickActions = [
  { label: "Add Expense", icon: Plus, color: "from-blue-500 to-blue-600", action: "/app/expenses" },
  { label: "Transfer", icon: Send, color: "from-purple-500 to-purple-600", action: "/app/expenses" },
  { label: "Set Goal", icon: Target, color: "from-teal-500 to-teal-600", action: "/app/habit-builder" },
  { label: "Analytics", icon: TrendingUp, color: "from-pink-500 to-pink-600", action: "/app/analytics" },
];

const fallbackTransactions = [
  { id: 1, name: "No transactions yet", category: "—", amount: 0, date: "", type: "expense", icon: ShoppingCart },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const fmt = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [userName, setUserName] = useState("User");
  const [statsData, setStatsData] = useState(fallbackStats);
  const [chartData, setChartData] = useState(fallbackChartData);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [savingsGoalPct, setSavingsGoalPct] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const token = localStorage.getItem("token");
    const headers: any = { Authorization: `Bearer ${token}` };

    // Fetch user name
    try {
      const res = await fetch("/api/auth/me", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data?.name) setUserName(data.name.split(" ")[0]);
      }
    } catch {
      const stored = localStorage.getItem("user");
      if (stored) { try { const p = JSON.parse(stored); if (p.name) setUserName(p.name.split(" ")[0]); } catch {} }
    }

    // Fetch expenses for recent transactions
    try {
      const res = await fetch("/api/expenses", { headers });
      if (res.ok) setExpenses(await res.json());
    } catch {}

    // Fetch summary stats
    try {
      const res = await fetch("/api/stats/summary?months=6", { headers });
      if (res.ok) {
        const d = await res.json();
        const balance = d.totalIncome - d.totalExpenses;
        const savingsGoal = 1200000; // ₹12L annual goal
        setSavingsGoalPct(Math.min(100, Math.round((d.totalSavings / savingsGoal) * 100)));
        setTotalSavings(d.totalSavings);
        setStatsData([
          { label: "Total Balance", value: fmt(balance), change: `${d.expenseChangePercent > 0 ? "+" : ""}${d.expenseChangePercent}%`, trend: balance > 0 ? "up" : "down", icon: Wallet, color: "blue", sub: "vs last month", sparkline: [60, 70, 65, 80, 75, 90, 100] },
          { label: "Monthly Expenses", value: fmt(d.monthlyExpenses), change: `${d.expenseChangePercent}%`, trend: d.expenseChangePercent < 0 ? "down" : "up", icon: TrendingDown, color: "purple", sub: d.expenseChangePercent < 0 ? "below last month" : "above last month", sparkline: [100, 90, 85, 95, 80, 75, 70] },
          { label: "Total Savings", value: fmt(d.totalSavings), change: "", trend: "up", icon: PiggyBank, color: "teal", sub: `goal: ₹12L`, sparkline: [40, 50, 55, 65, 72, 80, 90] },
          { label: "Budget Remaining", value: fmt(d.budgetRemaining > 0 ? d.budgetRemaining : 0), change: d.monthlyIncome > 0 ? `${Math.round((1 - d.monthlyExpenses / d.monthlyIncome) * 100)}%` : "0%", trend: d.budgetRemaining > 0 ? "up" : "down", icon: Target, color: "pink", sub: `of ${fmt(d.monthlyIncome)} income`, sparkline: [100, 85, 80, 75, 72, 70, 68] },
        ]);
      }
    } catch {}

    // Fetch monthly chart data
    try {
      const res = await fetch("/api/stats/monthly?months=6", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setChartData(data);
      }
    } catch {}

    // Fetch category data
    try {
      const res = await fetch("/api/stats/category", { headers });
      if (res.ok) setCategoryData(await res.json());
    } catch {}
  };

  const recentTransactions = expenses.length > 0
    ? expenses.slice(0, 6).map((e: any) => ({
        id: e.id,
        name: e.description,
        category: e.category,
        amount: -e.amount,
        date: e.date,
        type: "expense",
        icon: ShoppingCart
      }))
    : fallbackTransactions;

  const budgetCategories = categoryData.length > 0
    ? categoryData.slice(0, 4).map((c: any) => ({
        name: c.name,
        spent: c.value,
        budget: c.value * 1.5, // estimate budget as 1.5x current spend
        color: c.color,
      }))
    : [
        { name: "No data", spent: 0, budget: 1, color: "#6b7280" },
      ];

  const savingsGoalData = [
    { name: "Achieved", value: savingsGoalPct, fill: "#3b82f6" },
    { name: "Remaining", value: 100 - savingsGoalPct, fill: "#1e293b" },
  ];

  const aiTips = expenses.length > 0
    ? [
        `You have ${expenses.length} expense transactions. Keep tracking for better insights! 📊`,
        totalSavings > 0 ? `Your total savings are ${fmt(totalSavings)}. Keep it up! 🎉` : "Start saving today for a better tomorrow! 💰",
        "Review your spending patterns in the Analytics page for deeper insights.",
        "Set up budget categories to better control your spending.",
      ]
    : [
        "Welcome! Start by adding your first expense to get personalized insights.",
        "Add income entries too so we can track your savings rate.",
        "Set up savings challenges in the Habit Builder to gamify your finances!",
      ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {greeting()}, {userName}! 👋
          </h1>
          <p className="text-gray-400">Here's your financial overview.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-gray-300">Live sync</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.action)}
              className="relative group rounded-2xl overflow-hidden p-4 flex flex-col items-center gap-3 border border-gray-700/50 bg-gray-800/40 hover:bg-gray-800/70 transition-all hover:scale-105 hover:border-gray-600/50"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <Card
              key={stat.label}
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6 hover:border-gray-600/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                    stat.trend === "up" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    {stat.change}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.sub}</p>

              {/* Mini Sparkline */}
              <div className="flex items-end gap-0.5 h-8 mt-3">
                {stat.sparkline.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${v}%`,
                      background: i === stat.sparkline.length - 1
                        ? `linear-gradient(to top, var(--tw-gradient-from, #3b82f6), var(--tw-gradient-to, #a855f7))`
                        : "rgba(59,130,246,0.2)",
                    }}
                  />
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Income vs Expenses</h2>
              <p className="text-sm text-gray-500">Last 6 months overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-blue-500" />Income
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-purple-500" />Expenses
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-teal-500" />Savings
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 12 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#fff" }}
                formatter={(value: number) => [`₹${(value / 1000).toFixed(1)}k`, ""]}
              />
              <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expenses" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              <Area type="monotone" dataKey="savings" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Savings Goal Radial */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border-blue-500/20 p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">Savings Goal</h2>
            <p className="text-sm text-gray-400">Annual target: ₹12,00,000</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  startAngle={90}
                  endAngle={-270}
                  data={savingsGoalData}
                >
                  <RadialBar dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{savingsGoalPct}%</span>
                <span className="text-xs text-gray-400">achieved</span>
              </div>
            </div>
            <div className="w-full space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Saved</span>
                <span className="text-white font-bold">{fmt(totalSavings)}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${savingsGoalPct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>{fmt(Math.max(0, 1200000 - totalSavings))} left</span>
                <span>₹12,00,000</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget & Transactions Row */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Budget Progress */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Budget Status</h2>
            <button className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1" onClick={() => navigate("/app/analytics")}>
              Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-5">
            {budgetCategories.map((cat) => {
              const pct = cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-300 font-medium">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">₹{cat.spent.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-gray-600">/</span>
                      <span className="text-xs text-gray-400">₹{cat.budget.toLocaleString("en-IN")}</span>
                      <span className={`text-xs font-bold ${pct > 80 ? "text-red-400" : pct > 60 ? "text-yellow-400" : "text-green-400"}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Budget summary */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Budget Health</span>
            </div>
            <p className="text-xs text-gray-400">
              {budgetCategories.length > 0 && budgetCategories[0].name !== "No data"
                ? `Tracking ${budgetCategories.length} budget categories. Keep spending in check! 🎯`
                : "Add expenses to see your budget health."}
            </p>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-3 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
            <button
              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
              onClick={() => navigate("/app/expenses")}
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx) => {
              const Icon = tx.icon;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/60 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === "income" ? "bg-green-500/10 border border-green-500/20" : "bg-gray-700/50 border border-gray-600/30"
                    }`}>
                      <Icon className={`w-5 h-5 ${tx.type === "income" ? "text-green-400" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{tx.name}</p>
                      <p className="text-xs text-gray-500">{tx.category} · {tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${tx.type === "income" ? "text-green-400" : "text-white"}`}>
                    {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Robot Guide */}
      <RobotGuide
        messages={aiTips}
        position="bottom-right"
        title="Finance Assistant"
      />
    </div>
  );
}
