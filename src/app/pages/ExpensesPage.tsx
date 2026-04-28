import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import {
  Plus, Search, Filter, ShoppingBag, Car, Home, Utensils,
  Film, Heart, MoreHorizontal, Trash2, Edit3, TrendingDown,
  Calendar, Download, ArrowUpRight, IndianRupee, ChevronLeft, ChevronRight
} from "lucide-react";
import { RobotGuide } from "../components/RobotGuide";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const categories = [
  { value: "food", label: "Food & Dining", icon: Utensils, color: "orange", hex: "#f97316" },
  { value: "transport", label: "Transport", icon: Car, color: "blue", hex: "#3b82f6" },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: "purple", hex: "#a855f7" },
  { value: "housing", label: "Housing", icon: Home, color: "teal", hex: "#14b8a6" },
  { value: "entertainment", label: "Entertainment", icon: Film, color: "pink", hex: "#ec4899" },
  { value: "health", label: "Health", icon: Heart, color: "red", hex: "#ef4444" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "gray", hex: "#6b7280" },
];

type Expense = {
  id: number | string;
  description: string;
  amount: number;
  category: string;
  date: string;
  tags: string[];
};

const initialExpenses: Expense[] = [
  { id: 1, description: "Big Basket Groceries", amount: 10040, category: "food", date: "2026-03-05", tags: ["groceries"] },
  { id: 2, description: "Uber Trip to Office", amount: 1784, category: "transport", date: "2026-03-03", tags: ["commute"] },
  { id: 3, description: "Netflix Monthly", amount: 1279, category: "entertainment", date: "2026-03-04", tags: ["subscription"] },
  { id: 4, description: "Amazon Purchase", amount: 7199, category: "shopping", date: "2026-03-02", tags: ["electronics"] },
  { id: 5, description: "Rent Payment", amount: 120000, category: "housing", date: "2026-03-01", tags: ["rent"] },
  { id: 6, description: "Starbucks Coffee", amount: 460, category: "food", date: "2026-03-06", tags: ["coffee"] },
  { id: 7, description: "Fuel — Petrol Station", amount: 3600, category: "transport", date: "2026-03-04", tags: ["fuel"] },
  { id: 8, description: "Gym Membership", amount: 4000, category: "health", date: "2026-03-01", tags: ["fitness"] },
  { id: 9, description: "Myntra Fashion", amount: 3499, category: "shopping", date: "2026-03-07", tags: ["clothes"] },
  { id: 10, description: "Zomato Delivery", amount: 850, category: "food", date: "2026-03-07", tags: ["delivery"] },
];

const monthlyBudget = 186400;

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const syncToLocalStorage = (newExpenses: Expense[]) => {
    localStorage.setItem("fintrack_expenses", JSON.stringify(newExpenses));
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
        syncToLocalStorage(data);
        return;
      }
    } catch (e) {
      // Backend unavailable
    }
    // Fallback to local storage or mock data
    const local = localStorage.getItem("fintrack_expenses");
    if (local) {
      setExpenses(JSON.parse(local));
    } else {
      setExpenses(initialExpenses);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    tags: "",
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetPct = Math.round((totalSpent / monthlyBudget) * 100);

  const filteredExpenses = expenses
    .filter((e) => {
      const matchSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === "all" || e.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const handleAdd = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category) return;
    const expensePayload = {
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      tags: newExpense.tags ? newExpense.tags.split(",").map((t) => t.trim()) : [],
    };
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(expensePayload)
      });
      if (res.ok) {
        const savedExpense = await res.json();
        const updated = [savedExpense, ...expenses];
        setExpenses(updated);
        syncToLocalStorage(updated);
        setNewExpense({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], tags: "" });
        setIsAddOpen(false);
        return;
      }
    } catch (e) {
      // Backend unavailable — add locally
    }
    // Fallback: add to local state
    const localExpense: Expense = {
      id: Date.now(),
      ...expensePayload,
    };
    const updated = [localExpense, ...expenses];
    setExpenses(updated);
    syncToLocalStorage(updated);
    setNewExpense({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], tags: "" });
    setIsAddOpen(false);
  };

  const handleDelete = async (id: number | string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const remaining = expenses.filter((e) => e.id !== id);
        setExpenses(remaining);
        syncToLocalStorage(remaining);
        return;
      }
    } catch (e) {
      // Backend unavailable
    }
    // Fallback: delete from local state
    const remaining = expenses.filter((e) => e.id !== id);
    setExpenses(remaining);
    syncToLocalStorage(remaining);
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingExpense || !editingExpense.description || (!editingExpense.amount && editingExpense.amount !== 0) || !editingExpense.category) return;
    
    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(editingExpense)
      });
      
      if (res.ok) {
        const updatedExpense = await res.json();
        const updatedList = expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e);
        setExpenses(updatedList);
        syncToLocalStorage(updatedList);
        setIsEditOpen(false);
        return;
      }
    } catch (e) {
      // Backend unavailable
    }
    // Fallback local edit
    const updatedList = expenses.map(e => e.id === editingExpense.id ? editingExpense : e);
    setExpenses(updatedList);
    syncToLocalStorage(updatedList);
    setIsEditOpen(false);
  };

  const categoryData = categories.map((cat) => ({
    name: cat.label,
    value: expenses.filter((e) => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
    color: cat.hex,
  })).filter((c) => c.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Expense Tracker</h1>
          <p className="text-gray-400">Track and manage all your expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-white bg-white text-black hover:bg-gray-100 hover:text-black font-semibold gap-2 hidden md:flex"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/expenses/export", {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "fintrack_expenses.csv";
                  a.click();
                  window.URL.revokeObjectURL(url);
                } else {
                  alert("Export failed. Please try again.");
                }
              } catch {
                alert("Export failed — backend unavailable.");
              }
            }}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-gray-300">Description</Label>
                  <Input
                    placeholder="e.g., Grocery shopping at Big Basket"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Amount (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Category</Label>
                  <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        className="pl-9 bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Tags (comma separated)</Label>
                    <Input
                      placeholder="groceries, food"
                      value={newExpense.tags}
                      onChange={(e) => setNewExpense({ ...newExpense, tags: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAdd}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Edit Expense</DialogTitle>
              </DialogHeader>
              {editingExpense && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-gray-300">Description</Label>
                  <Input
                    placeholder="e.g., Grocery shopping at Big Basket"
                    value={editingExpense.description}
                    onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Amount (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                      className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Category</Label>
                  <Select value={editingExpense.category} onValueChange={(v) => setEditingExpense({ ...editingExpense, category: v })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="date"
                        value={editingExpense.date.split("T")[0]}
                        onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                        className="pl-9 bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Tags (comma separated)</Label>
                    <Input
                      placeholder="groceries, food"
                      value={editingExpense.tags.join(", ")}
                      onChange={(e) => setEditingExpense({ ...editingExpense, tags: e.target.value.split(",").map(t => t.trim()) })}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleEditSave}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Monthly Budget Overview */}
      <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Monthly Spending</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-white">₹{totalSpent.toLocaleString("en-IN")}</p>
              <p className="text-gray-500 mb-1">/ ₹{monthlyBudget.toLocaleString("en-IN")} budget</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm font-medium ${budgetPct > 90 ? "text-red-400" : budgetPct > 70 ? "text-yellow-400" : "text-green-400"}`}>
                {budgetPct}% used
              </span>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-400 text-sm">₹{(monthlyBudget - totalSpent).toLocaleString("en-IN")} remaining</span>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>₹0</span>
              <span>₹{monthlyBudget.toLocaleString("en-IN")}</span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  budgetPct > 90 ? "bg-gradient-to-r from-red-500 to-red-600" :
                  budgetPct > 70 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                  "bg-gradient-to-r from-blue-500 to-purple-500"
                }`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { label: "Transactions", value: expenses.length, icon: ArrowUpRight, color: "text-blue-400" },
                { label: "Avg/transaction", value: `₹${expenses.length > 0 ? Math.round(totalSpent / expenses.length).toLocaleString("en-IN") : "0"}`, icon: TrendingDown, color: "text-purple-400" },
                { label: "Highest", value: `₹${expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)).toLocaleString("en-IN") : "0"}`, icon: ArrowUpRight, color: "text-orange-400" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="text-center">
                    <Icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                    <p className="font-bold text-white text-sm">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Charts + Category Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#fff" }}
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-400">{cat.name}</span>
                </div>
                <span className="text-white font-medium">₹{cat.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Category tiles */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const catTotal = expenses.filter((e) => e.category === category.value).reduce((s, e) => s + e.amount, 0);
            const isSelected = selectedCategory === category.value;
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(isSelected ? "all" : category.value)}
                className={`rounded-xl p-4 text-center transition-all hover:scale-105 border ${
                  isSelected
                    ? `bg-${category.color}-500/15 border-${category.color}-500/40`
                    : "bg-gray-800/40 border-gray-700/30 hover:border-gray-600/50"
                }`}
              >
                <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-${category.color}-500/10 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${category.color}-400`} />
                </div>
                <p className="text-xs text-gray-400 mb-1">{category.label}</p>
                <p className="text-sm font-bold text-white">
                  {catTotal > 0 ? `₹${(catTotal / 1000).toFixed(1)}k` : "—"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters + Expense List */}
      <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-600"
            />
          </div>
          <div className="flex gap-3">
            <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-44 bg-gray-900/50 border-gray-700 text-white">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount-desc">Highest First</SelectItem>
                <SelectItem value="amount-asc">Lowest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            All Expenses
            <span className="ml-2 text-sm font-normal text-gray-500">({filteredExpenses.length} items)</span>
          </h2>
          <span className="text-sm text-gray-400">
            Total: <span className="text-white font-bold">₹{filteredExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}</span>
          </span>
        </div>

        <div className="space-y-3">
          {paginatedExpenses.map((expense) => {
            const cat = categories.find((c) => c.value === expense.category);
            const Icon = cat?.icon || MoreHorizontal;
            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/60 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-${cat?.color || "gray"}-500/10 border border-${cat?.color || "gray"}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${cat?.color || "gray"}-400`} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{cat?.label}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-500">{(() => { try { const d = new Date(expense.date); if (isNaN(d.getTime())) return expense.date; return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch { return expense.date; } })()}</span>
                      {expense.tags.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded-md bg-gray-700/50 text-gray-400 text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">-₹{expense.amount.toLocaleString("en-IN")}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(expense)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete((expense.id as any))}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} · {filteredExpenses.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm transition-all ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white font-bold"
                      : "text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <RobotGuide
        messages={[
          "Track every expense, no matter how small! Your daily ₹200 chai adds up to ₹6,000/month. ☕",
          "Your biggest expense is Housing at ₹1,20,000. That's 64% of your total spend — review if possible!",
          "You've logged 10 expenses this month. Keep the streak going for better insights! 📊",
        ]}
        position="bottom-right"
      />
    </div>
  );
}
