import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api/dashboard';
import { DashboardStats } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Target, Flame } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: 'Total Income', value: formatCurrency(stats.totalIncome), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Expenses', value: formatCurrency(stats.totalExpenses), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Net Balance', value: formatCurrency(stats.netBalance), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Challenges', value: String(stats.activeChallenges), icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`${bg} p-3 rounded-lg`}>
              <Icon className={color} size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-lg font-semibold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {stats.monthlyTrends && stats.monthlyTrends.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.recentTransactions && stats.recentTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{tx.description}</p>
                  <p className="text-sm text-gray-500">{tx.category}</p>
                </div>
                <span className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
