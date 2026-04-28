import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import {
  User, Bell, Lock, Globe, CreditCard, Shield, Camera,
  Eye, EyeOff, CheckCircle2, AlertTriangle, Download,
  Smartphone, Mail, MessageSquare, TrendingUp, Trash2,
  ChevronRight, ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";

type NotifKey = "email" | "push" | "weekly" | "monthly" | "budget" | "challenge";

export function SettingsPage() {
  const [notifications, setNotifications] = useState<Record<NotifKey, boolean>>({
    email: true,
    push: true,
    weekly: true,
    monthly: false,
    budget: true,
    challenge: true,
  });

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", phone: "", bio: "" });
  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });

  const [preferences, setPreferences] = useState<Record<string, string>>({
    language: "en", currency: "inr", timezone: "ist", dateFormat: "dd-mm-yyyy", budgetStartDay: "1"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            const parts = (data.name || "").split(" ");
            setProfile({
              firstName: parts[0] || "",
              lastName: parts.slice(1).join(" ") || "",
              email: data.email || "",
              phone: data.phone || "",
              bio: "",
            });
            // Load saved notifications from backend
            if (data.notifications && Object.keys(data.notifications).length > 0) {
              setNotifications(prev => ({ ...prev, ...data.notifications }));
            }
            // Load saved preferences from backend
            if (data.preferences && Object.keys(data.preferences).length > 0) {
              setPreferences(prev => ({ ...prev, ...data.preferences }));
            }
          }
        })
        .catch(() => {
          const stored = localStorage.getItem("user");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const parts = (parsed.name || "").split(" ");
              setProfile({
                firstName: parts[0] || "",
                lastName: parts.slice(1).join(" ") || "",
                email: parsed.email || "",
                phone: "",
                bio: "",
              });
            } catch {}
          }
        });
    }
  }, []);

  const userInitials = profile.firstName && profile.lastName
    ? (profile.firstName[0] + profile.lastName[0]).toUpperCase()
    : profile.firstName ? profile.firstName.slice(0, 2).toUpperCase() : "U";
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "User";

  const handleSave = async (section: string) => {
    setErrorMessage("");
    const token = localStorage.getItem("token");
    try {
      if (section === "profile") {
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: fullName, phone: profile.phone }),
        });
        if (!res.ok) {
          const data = await res.json();
          setErrorMessage(data.message || "Failed to save profile.");
          return;
        }
      } else if (section === "password") {
        if (!passwords.current) {
          setErrorMessage("Current password is required.");
          return;
        }
        if (passwords.newPw !== passwords.confirm) {
          setErrorMessage("New passwords do not match.");
          return;
        }
        const res = await fetch("/api/profile/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPw }),
        });
        if (!res.ok) {
          const data = await res.json();
          setErrorMessage(data.message || "Failed to change password.");
          return;
        }
        setPasswords({ current: "", newPw: "", confirm: "" });
      } else if (section === "preferences") {
        const res = await fetch("/api/profile/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(preferences),
        });
        if (!res.ok) {
          const data = await res.json();
          setErrorMessage(data.message || "Failed to save preferences.");
          return;
        }
      }
      setSavedMessage(section);
      setTimeout(() => setSavedMessage(""), 2500);
    } catch {
      if (section === "password") {
        setErrorMessage("Service unavailable. Failed to change password.");
      } else {
        setSavedMessage(section);
        setTimeout(() => setSavedMessage(""), 2500);
      }
    }
  };

  const toggleNotif = async (key: NotifKey) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    // Persist to backend
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/profile/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
    } catch {}
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "privacy", label: "Privacy & Data", icon: Shield },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:w-56 flex-shrink-0">
          <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-3">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3" />}
                  </button>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Saved notification */}
          {savedMessage && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Changes saved successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === "profile" && (
            <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8 p-4 rounded-2xl bg-gray-800/40 border border-gray-700/30">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {userInitials}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center hover:bg-gray-600 transition-colors">
                    <Camera className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-white">{fullName}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Verified</Badge>
                  </div>
                </div>
                <button className="ml-auto text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Change photo <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input id="firstName" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="bg-gray-900/50 border-gray-700 text-white focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input id="lastName" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="bg-gray-900/50 border-gray-700 text-white focus:border-blue-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                  <Input id="email" type="email" value={profile.email} readOnly className="bg-gray-900/50 border-gray-700 text-white/60 focus:border-blue-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input id="phone" placeholder="+91 9876543210" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="bg-gray-900/50 border-gray-700 text-white focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Tell us a bit about yourself..."
                    defaultValue="Software Engineer | Finance enthusiast | Goal: Financial freedom by 35"
                    className="w-full rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none p-3 text-sm resize-none"
                  />
                </div>
                <Button
                  onClick={() => handleSave("profile")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Security</h2>
              </div>

              {/* Password Strength Banner */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-400">Strong password set</p>
                  <p className="text-xs text-gray-500">Last changed 45 days ago</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Current Password</Label>
                  <div className="relative">
                    <Input type={showCurrentPw ? "text" : "password"} placeholder="••••••••" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="pr-10 bg-gray-900/50 border-gray-700 text-white" />
                    <button
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">New Password</Label>
                    <div className="relative">
                      <Input type={showNewPw ? "text" : "password"} placeholder="Min 8 characters" value={passwords.newPw} onChange={(e) => setPasswords({...passwords, newPw: e.target.value})} className="pr-10 bg-gray-900/50 border-gray-700 text-white" />
                      <button
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="bg-gray-900/50 border-gray-700 text-white" />
                  </div>
                </div>
                <Button
                  onClick={() => handleSave("password")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Update Password
                </Button>
              </div>

              {/* Two-Factor Auth */}
              <div className="mt-8 pt-6 border-t border-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 text-sm" onClick={() => alert("Two-Factor Authentication is coming soon!")}>
                    Enable 2FA
                  </Button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <h3 className="font-medium text-white mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: navigator.userAgent.includes("Chrome") ? "Chrome Browser" : navigator.userAgent.includes("Firefox") ? "Firefox Browser" : "Web Browser", location: "Current device", time: "Current session", active: true },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-white">{session.device}</p>
                          <p className="text-xs text-gray-500">{session.location} · {session.time}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-teal-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
              </div>

              <div className="space-y-0.5">
                {([
                  { key: "email", icon: Mail, title: "Email Notifications", desc: "Receive updates, reports, and tips via email" },
                  { key: "push", icon: Smartphone, title: "Push Notifications", desc: "Get instant alerts on your mobile device" },
                  { key: "weekly", icon: TrendingUp, title: "Weekly Summary", desc: "Weekly financial performance summary every Sunday" },
                  { key: "monthly", icon: TrendingUp, title: "Monthly Report", desc: "Detailed monthly financial report with insights" },
                  { key: "budget", icon: AlertTriangle, title: "Budget Alerts", desc: "Alert when you're approaching budget limits" },
                  { key: "challenge", icon: MessageSquare, title: "Challenge Updates", desc: "Progress updates for your active savings challenges" },
                ] as { key: NotifKey; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[]).map(({ key, icon: Icon, title, desc }) => (
                  <div key={key} className="flex items-center justify-between py-4 border-b border-gray-800/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-white">{title}</p>
                        <p className="text-sm text-gray-500">{desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[key]}
                      onCheckedChange={() => toggleNotif(key)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Preferences Section */}
          {activeSection === "preferences" && (
            <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-pink-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Preferences</h2>
              </div>

              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Language</Label>
                    <Select value={preferences.language} onValueChange={(v) => setPreferences({ ...preferences, language: v })}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
                        <SelectItem value="ta">🇮🇳 Tamil</SelectItem>
                        <SelectItem value="te">🇮🇳 Telugu</SelectItem>
                        <SelectItem value="mr">🇮🇳 Marathi</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Default Currency</Label>
                    <Select value={preferences.currency} onValueChange={(v) => setPreferences({ ...preferences, currency: v })}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inr">🇮🇳 INR (₹)</SelectItem>
                        <SelectItem value="usd">🇺🇸 USD ($)</SelectItem>
                        <SelectItem value="eur">🇪🇺 EUR (€)</SelectItem>
                        <SelectItem value="gbp">🇬🇧 GBP (£)</SelectItem>
                        <SelectItem value="sgd">🇸🇬 SGD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Timezone</Label>
                    <Select value={preferences.timezone} onValueChange={(v) => setPreferences({ ...preferences, timezone: v })}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Date Format</Label>
                    <Select value={preferences.dateFormat} onValueChange={(v) => setPreferences({ ...preferences, dateFormat: v })}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Monthly Budget Start Day</Label>
                  <Select value={preferences.budgetStartDay} onValueChange={(v) => setPreferences({ ...preferences, budgetStartDay: v })}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 5, 10, 15, 20, 25].map((d) => (
                        <SelectItem key={d} value={String(d)}>Day {d} of each month</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => handleSave("preferences")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}

          {/* Billing Section */}
          {activeSection === "billing" && (
            <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Billing & Subscription</h2>
              </div>

              {/* Current Plan */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">Premium Plan</h3>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">₹799/month · Next billing: April 1, 2026</p>
                    <div className="flex flex-wrap gap-2">
                      {["Unlimited expenses", "AI insights", "All challenges", "Priority support"].map((f) => (
                        <div key={f} className="flex items-center gap-1 text-xs text-gray-300">
                          <CheckCircle2 className="w-3 h-3 text-green-400" />{f}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">₹799</p>
                    <p className="text-xs text-gray-500">/month</p>
                  </div>
                </div>
              </div>

              {/* Billing History */}
              <h3 className="font-medium text-white mb-4">Billing History</h3>
              <div className="space-y-2 mb-6">
                {[
                  { date: "Mar 1, 2026", amount: "₹799", status: "Paid" },
                  { date: "Feb 1, 2026", amount: "₹799", status: "Paid" },
                  { date: "Jan 1, 2026", amount: "₹799", status: "Paid" },
                ].map((bill, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
                    <span className="text-sm text-gray-400">{bill.date}</span>
                    <span className="font-medium text-white">{bill.amount}</span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">{bill.status}</Badge>
                    <button className="text-xs text-blue-400 hover:text-blue-300">Download</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  Change Plan
                </Button>
                <Button variant="outline" className="border-red-700/50 text-red-400 hover:bg-red-500/10">
                  Cancel Subscription
                </Button>
              </div>
            </Card>
          )}

          {/* Privacy Section */}
          {activeSection === "privacy" && (
            <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Privacy & Data</h2>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { label: "Download Your Data", desc: "Get a complete export of all your financial data", icon: Download },
                  { label: "Privacy Policy", desc: "Read how we handle your data", icon: ExternalLink },
                  { label: "Terms of Service", desc: "Review our terms and conditions", icon: ExternalLink },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-700/50 bg-gray-800/40 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all text-left group"
                      onClick={async () => {
                        if (item.label === "Download Your Data") {
                          try {
                            const token = localStorage.getItem("token");
                            const res = await fetch("/api/profile/data", { headers: { Authorization: `Bearer ${token}` } });
                            if (res.ok) {
                              const data = await res.json();
                              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = "fintrack_data.json";
                              a.click();
                              window.URL.revokeObjectURL(url);
                            }
                          } catch { alert("Failed to download data."); }
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </button>
                  );
                })}
              </div>

              {/* Danger Zone */}
              <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-red-400">Danger Zone</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                {!deleteConfirm ? (
                  <Button
                    onClick={() => setDeleteConfirm(true)}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-red-300 font-medium">⚠️ Are you absolutely sure? This cannot be undone.</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        onClick={() => setDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white gap-2"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("token");
                            const res = await fetch("/api/profile", {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (res.ok) {
                              localStorage.clear();
                              window.location.href = "/login";
                            } else { alert("Failed to delete account."); }
                          } catch { alert("Service unavailable."); }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Yes, Delete Forever
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
