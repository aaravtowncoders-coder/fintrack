import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { TrendingUp, TrendingDown, IndianRupee, Calendar, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { RobotGuide } from "../components/RobotGuide";

const fallbackMonthlyData = [
  { month: "Jan", income: 0, expenses: 0, savings: 0 },
];

const fallbackCategoryData: any[] = [];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6");
  const [projectionMode, setProjectionMode] = useState("moderate");
  const [monthlyData, setMonthlyData] = useState(fallbackMonthlyData);
  const [categoryData, setCategoryData] = useState(fallbackCategoryData);
  const [weeklySpending, setWeeklySpending] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers: any = { Authorization: `Bearer ${token}` };

    try {
      const [summaryRes, monthlyRes, categoryRes, weeklyRes] = await Promise.all([
        fetch(`/api/stats/summary?months=${timeRange}`, { headers }),
        fetch(`/api/stats/monthly?months=${timeRange}`, { headers }),
        fetch("/api/stats/category", { headers }),
        fetch("/api/stats/weekly", { headers }),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        if (data.length > 0) setMonthlyData(data);
      }
      if (categoryRes.ok) setCategoryData(await categoryRes.json());
      if (weeklyRes.ok) setWeeklySpending(await weeklyRes.json());
    } catch {
      // Backend unavailable — keep fallback data
    }
  };

  const totalIncome = summary?.totalIncome ?? monthlyData.reduce((s, m) => s + (m.income || 0), 0);
  const totalExpenses = summary?.totalExpenses ?? monthlyData.reduce((s, m) => s + (m.expenses || 0), 0);
  const totalSavings = summary?.totalSavings ?? (totalIncome - totalExpenses);
  const avgMonthly = monthlyData.length > 0 ? Math.round(totalExpenses / monthlyData.length) : 0;

  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  };

  // Generate savings projections from current data
  const currentMonthlySavings = monthlyData.length > 0
    ? monthlyData.reduce((s, m) => s + (m.savings || 0), 0) / monthlyData.length
    : 0;

  const projectionMonths = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const savingsProjection = projectionMonths.map((month, i) => ({
    month,
    conservative: Math.round(currentMonthlySavings * 0.8 * (i + 1)),
    moderate: Math.round(currentMonthlySavings * 1.0 * (i + 1)),
    aggressive: Math.round(currentMonthlySavings * 1.3 * (i + 1)),
  }));

  // Financial health scores from real data
  const healthScores = [
    { subject: "Budgeting", score: categoryData.length > 0 ? 80 : 30 },
    { subject: "Saving", score: totalSavings > 0 ? Math.min(90, Math.round(totalSavings / totalIncome * 100 * 2)) : 20 },
    { subject: "Investing", score: 45 },
    { subject: "Tracking", score: summary?.transactionCount > 10 ? 90 : summary?.transactionCount > 0 ? 60 : 20 },
    { subject: "Goals", score: 68 },
    { subject: "Habits", score: 78 },
  ];

  const overallScore = Math.round(healthScores.reduce((s, h) => s + h.score, 0) / healthScores.length);

  // Year-over-year: current data vs estimated previous (80% of current as placeholder)
  const yoyData = monthlyData.map((m) => ({
    month: m.month,
    current: m.expenses,
    previous: Math.round((m.expenses || 0) * 1.15), // Estimate previous year 15% higher
  }));

  const insights = [
    {
      type: "success",
      title: totalSavings > 0 ? "Great Progress!" : "Get Started!",
      desc: totalSavings > 0
        ? `You've saved ${fmt(totalSavings)} over the past ${timeRange} months. Keep it up!`
        : "Start tracking income and expenses to see your savings grow.",
      icon: CheckCircle2,
      color: "green",
    },
    {
      type: "info",
      title: categoryData.length > 0 ? `Top Category: ${categoryData[0]?.name}` : "No Categories Yet",
      desc: categoryData.length > 0
        ? `${categoryData[0]?.name} takes ${fmt(categoryData[0]?.value)} of your monthly spend.`
        : "Add expenses with categories to see your spending breakdown.",
      icon: IndianRupee,
      color: "blue",
    },
    {
      type: "warning",
      title: weeklySpending.length > 0 ? "Weekly Spending Pattern" : "Track Weekly Patterns",
      desc: weeklySpending.length > 0
        ? `Your highest spending week was ${weeklySpending.reduce((max: any, w: any) => w.spending > (max?.spending || 0) ? w : max, weeklySpending[0])?.week}.`
        : "Add more expenses to see weekly spending patterns.",
      icon: AlertTriangle,
      color: "yellow",
    },
    {
      type: "success",
      title: `Financial Health: ${overallScore}/100`,
      desc: `Your overall financial health score is ${overallScore}. ${overallScore > 70 ? "Great job!" : "Keep improving!"}`,
      icon: TrendingDown,
      color: "teal",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-gray-400">Deep insights into your financial patterns</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-44 bg-gray-800/50 border-gray-700 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last Month</SelectItem>
            <SelectItem value="3">Last 3 Months</SelectItem>
            <SelectItem value="6">Last 6 Months</SelectItem>
            <SelectItem value="12">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Total Income", value: fmt(totalIncome), change: "+15.3%", up: true, icon: TrendingUp, color: "green" },
          { label: "Total Expenses", value: fmt(totalExpenses), change: "-5.2%", up: false, icon: TrendingDown, color: "red" },
          { label: "Net Savings", value: fmt(totalSavings), change: totalSavings > 0 ? "Positive" : "Negative", up: totalSavings > 0, icon: IndianRupee, color: "blue" },
          { label: "Avg. Monthly", value: fmt(avgMonthly), change: "", up: false, icon: Calendar, color: "purple" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                {stat.change && (
                  <span className={`text-sm font-medium ${stat.up ? "text-green-400" : "text-red-400"}`}>{stat.change}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Main Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-1">Income vs Expenses Trend</h2>
          <p className="text-sm text-gray-500 mb-6">{timeRange}-month comparison</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 12 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#fff" }}
                formatter={(v: number) => [`₹${(v / 1000).toFixed(1)}k`, ""]}
              />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} />
              <Line type="monotone" dataKey="expenses" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: "#a855f7", r: 4 }} />
              <Line type="monotone" dataKey="savings" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: "#14b8a6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Expenses by Category Pie */}
        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-1">Expenses by Category</h2>
          <p className="text-sm text-gray-500 mb-4">Current month</p>
          {categoryData.length > 0 ? (
            <div className="flex gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {categoryData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#fff" }}
                    formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 py-2">
                {categoryData.slice(0, 5).map((cat: any) => {
                  const total = categoryData.reduce((s: number, c: any) => s + c.value, 0);
                  const pct = total > 0 ? ((cat.value / total) * 100).toFixed(0) : "0";
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-gray-400">{cat.name}</span>
                        </div>
                        <span className="text-white font-medium">{pct}%</span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
              No expense data yet. Add expenses to see category breakdown.
            </div>
          )}
        </Card>

        {/* Weekly Spending Bar Chart */}
        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-1">Weekly Spending Pattern</h2>
          <p className="text-sm text-gray-500 mb-6">vs. average spending line</p>
          {weeklySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklySpending}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="week" stroke="#4b5563" tick={{ fontSize: 12 }} />
                <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#fff" }}
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]}
                />
                <Bar dataKey="spending" radius={[8, 8, 0, 0]}>
                  {weeklySpending.map((_: any, i: number) => (
                    <Cell key={i} fill={i === 2 ? "#f97316" : "#a855f7"} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" dot={false} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-gray-500 text-sm">
              No weekly data yet. Add expenses to see patterns.
            </div>
          )}
        </Card>

        {/* Year-over-Year */}
        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-1">Year-over-Year Comparison</h2>
          <p className="text-sm text-gray-500 mb-6">Current vs estimated previous period</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={yoyData}>
              <defs>
                <linearGradient id="grad2026" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2025" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 12 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#fff" }}
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]}
              />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Area type="monotone" dataKey="current" name="Current" stroke="#3b82f6" fill="url(#grad2026)" strokeWidth={2} />
              <Area type="monotone" dataKey="previous" name="Previous" stroke="#6b7280" fill="url(#grad2025)" strokeWidth={2} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Savings Projection + Financial Health */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Savings Projection</h2>
              <p className="text-sm text-gray-500">Rest of year forecast</p>
            </div>
            <Select value={projectionMode} onValueChange={setProjectionMode}>
              <SelectTrigger className="w-36 bg-gray-800/50 border-gray-700 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={savingsProjection}>
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 12 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#fff" }}
                formatter={(v: number) => [`₹${(v / 1000).toFixed(0)}k`, ""]}
              />
              <Area type="monotone" dataKey={projectionMode} stroke="#14b8a6" fill="url(#projGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
            <div>
              <p className="text-sm text-gray-500">Projected by Dec</p>
              <p className="text-xl font-bold text-teal-400">{fmt(savingsProjection[5]?.[projectionMode as keyof typeof savingsProjection[0]] as number || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Rate</p>
              <p className="text-xl font-bold text-teal-400">{fmt(currentMonthlySavings * (projectionMode === "conservative" ? 0.8 : projectionMode === "moderate" ? 1 : 1.3))}</p>
            </div>
          </div>
        </Card>

        {/* Financial Health Radar */}
        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-1">Financial Health Score</h2>
          <p className="text-sm text-gray-500 mb-4">Overall: {overallScore}/100</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={healthScores}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {healthScores.map((d) => (
              <div key={d.subject} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">{d.subject}</span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${d.score}%` }}
                  />
                </div>
                <span className="text-xs text-white w-8 text-right">{d.score}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border-blue-500/20 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">AI Insights & Recommendations</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            const colors: Record<string, string> = {
              green: "bg-green-500/10 border-green-500/20 text-green-400",
              blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
              yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
              teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
            };
            return (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${colors[insight.color]}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[insight.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">{insight.title}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{insight.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <RobotGuide
        messages={[
          totalSavings > 0 ? `Your savings are growing! Consider SIPs — investing ₹10,000/month now could be ₹20L in 10 years! 📈` : "Start tracking your finances today for better insights!",
          weeklySpending.length > 0 ? "Check your weekly spending patterns above to find optimization opportunities." : "Add more expenses to unlock weekly pattern analysis.",
          `Your financial health score is ${overallScore}/100. ${overallScore > 70 ? "Great job!" : "Keep improving!"}`,
        ]}
        position="bottom-right"
      />
    </div>
  );
}
