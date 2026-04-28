import { useEffect, useState } from 'react';
import { getCategoryBreakdown, getMonthlyTrends, getIncomeVsExpense } from '../api/analytics';
import { formatCurrency } from '../utils/formatters';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

interface CategoryItem { category: string; total: number; }
interface MonthlyItem { month: string; income: number; expenses: number; }

export default function Analytics() {
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategoryBreakdown(), getMonthlyTrends(), getIncomeVsExpense()])
      .then(([catRes, trendRes, ivseRes]) => {
        const catObj: Record<string, number> = catRes.data;
        setCategoryData(Object.entries(catObj).map(([category, total]) => ({ category, total: Number(total) })));
        setMonthlyData(trendRes.data.length > 0 ? trendRes.data : ivseRes.data);
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Income vs Expenses</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {categoryData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ category, percent }: { category: string; percent: number }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Expense Categories</h2>
          <div className="space-y-3">
            {[...categoryData].sort((a, b) => b.total - a.total).slice(0, 8).map((item, i) => (
              <div key={item.category} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.category}</span>
                    <span className="text-gray-500">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{
                      width: `${(item.total / categoryData[0].total) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length]
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
