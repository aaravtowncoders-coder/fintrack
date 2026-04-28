import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Receipt, Target, BarChart3, Settings,
  LogOut, Bell, ChevronDown, Menu, X, TrendingUp,
  Wallet, ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState, useEffect } from "react";

const menuItems = [
  { path: "/app", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/expenses", label: "Expenses", icon: Receipt },
  { path: "/app/habit-builder", label: "Habit Builder", icon: Target },
  { path: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/app/settings", label: "Settings", icon: Settings },
];

const notifications = [
  { id: 1, text: "You've saved ₹12,000 this week! 🎉", time: "2 min ago", read: false },
  { id: 2, text: "New challenge available: No-Spend Weekend", time: "1 hr ago", read: false },
  { id: 3, text: "Monthly report is ready to view", time: "3 hr ago", read: true },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{name: string; email: string}>({ name: "", email: "" });

  // Fetch current user profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => setUser({ name: data.name || "User", email: data.email || "" }))
      .catch(() => {
        // Fallback: use localStorage user data when backend is unavailable
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser({ name: parsed.name || "User", email: parsed.email || "" });
          } catch { setUser({ name: "User", email: "" }); }
        } else {
          setUser({ name: "User", email: "" });
        }
      });
  }, []);

  const isActive = (path: string) => {
    if (path === "/app") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = () => { setNotifOpen(false); setProfileOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentPage = menuItems.find((m) => isActive(m.path));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold text-white">FinTrack</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Active</span>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="mb-6 px-2">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-500/20 p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Wallet className="w-3 h-3" />Total Balance
          </p>
          <p className="text-2xl font-bold text-white">Welcome!</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">+12.5% this month</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <p className="text-xs text-gray-600 px-3 mb-3 uppercase tracking-wider">Menu</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                active
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-lg shadow-blue-500/10"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${active ? "text-blue-400" : "group-hover:text-blue-400"} transition-colors`} />
                <span className="font-medium">{item.label}</span>
              </div>
              {active && <ChevronRight className="w-4 h-4 text-blue-400" />}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-800/50 pt-4 space-y-2">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl">
          <Avatar className="w-9 h-9 border-2 border-blue-500/30 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">{user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name || "User"}</p>
            <p className="text-xs text-blue-400">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-gradient-to-b from-gray-900/80 to-gray-900/60 backdrop-blur-xl border-r border-gray-800/50 p-6 flex-col fixed h-full z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-gray-900 border-r border-gray-800/50 p-6 flex flex-col h-full">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Breadcrumb */}
              <div>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Home / {currentPage?.label || "Dashboard"}
                </p>
                <h2 className="text-lg font-bold text-white">{currentPage?.label || "Dashboard"}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="relative p-2.5 rounded-xl hover:bg-gray-800/60 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-gray-900 border border-gray-700/50 shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <span className="text-xs text-blue-400 cursor-pointer">Mark all read</span>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${!n.read ? "bg-blue-500/5" : ""}`}>
                          <p className="text-sm text-gray-300">{n.text}</p>
                          <p className="text-xs text-gray-600 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-800/60 transition-colors"
                >
                  <Avatar className="w-8 h-8 border-2 border-blue-500/30">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">{user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "U"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white leading-tight">{user.name || "User"}</p>
                    <p className="text-xs text-blue-400">{user.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-gray-900 border border-gray-700/50 shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-800">
                      <p className="font-medium text-white text-sm">{user.name || "User"}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {[
                      { label: "Profile Settings", path: "/app/settings" },
                      { label: "Billing", path: "/app/settings" },
                      { label: "Help Center", path: "/" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-800 mt-1 pt-1">
                      <button
                        onClick={() => navigate("/")}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
