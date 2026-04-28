import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  Trophy, Target, Flame, Star, Award, TrendingUp, Zap, Crown,
  Plus, CheckCircle2, Calendar, Gift, Lock, ChevronRight, Sparkles
} from "lucide-react";
import { RobotGuide } from "../components/RobotGuide";
import { AnimatedRobot } from "../components/AnimatedRobot";

const defaultAchievements = [
  { id: 1, name: "First Step", description: "Logged your first expense", icon: Star, unlocked: false, xp: 50, category: "Beginner" },
  { id: 2, name: "Week Warrior", description: "Tracked expenses for 7 consecutive days", icon: Flame, unlocked: false, xp: 100, category: "Streak" },
  { id: 3, name: "Savings Master", description: "Saved ₹80,000 in a month", icon: Trophy, unlocked: false, xp: 300, category: "Savings" },
  { id: 4, name: "Budget Guru", description: "Stayed under budget for 30 days", icon: Crown, unlocked: false, xp: 250, category: "Budget" },
  { id: 5, name: "Challenge Champion", description: "Complete 10 savings challenges", icon: Award, unlocked: false, xp: 500, category: "Challenges" },
  { id: 6, name: "Expense Ninja", description: "Log 100 expenses in total", icon: Zap, unlocked: false, xp: 200, category: "Tracking" },
  { id: 7, name: "Monthly Saver", description: "Save every day for a full month", icon: Target, unlocked: false, xp: 400, category: "Savings" },
  { id: 8, name: "Frugal Legend", description: "Reduce spending by 50% for 3 months", icon: Star, unlocked: false, xp: 600, category: "Expert" },
];

const leaderboard = [
  { rank: 1, name: "Priya S.", points: 4850, avatar: "PS", color: "from-yellow-500 to-amber-500" },
  { rank: 2, name: "Rahul M.", points: 3920, avatar: "RM", color: "from-gray-400 to-gray-500" },
  { rank: 3, name: "Anjali K.", points: 3540, avatar: "AK", color: "from-orange-600 to-orange-700" },
  { rank: 4, name: "You", points: 0, avatar: "JD", color: "from-blue-500 to-purple-500", isMe: true },
  { rank: 5, name: "Vikram P.", points: 980, avatar: "VP", color: "from-teal-500 to-teal-600" },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-500/10 text-green-400 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function HabitBuilderPage() {
  const [activeTab, setActiveTab] = useState<"challenges" | "achievements" | "leaderboard">("challenges");
  const [habits, setHabits] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [isLoggingProgress, setIsLoggingProgress] = useState(false);
  const [loggingChallenge, setLoggingChallenge] = useState<any>(null);
  const [progressAmount, setProgressAmount] = useState("");
  const [userLevel, setUserLevel] = useState({ level: 1, xp: 0, nextLevelXp: 1000, title: "Beginner", totalPoints: 0 });
  const [achievements, setAchievements] = useState(defaultAchievements);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    goal: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const token = localStorage.getItem("token");
    const headers: any = { Authorization: `Bearer ${token}` };

    // Fetch habits
    try {
      const res = await fetch("/api/habits", { headers });
      if (res.ok) setHabits(await res.json());
    } catch {}

    // Fetch challenges from backend
    try {
      const res = await fetch("/api/challenges", { headers });
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.map((c: any) => ({
          ...c,
          current: c.current ?? 0,
          goal: c.goal ?? 0,
          unit: c.unit || "₹",
          daysLeft: c.daysLeft ?? 30,
          reward: c.reward ?? (c.difficulty === "Hard" ? 200 : c.difficulty === "Medium" ? 100 : 50),
          participants: c.participants ?? 0,
          progress: c.goal > 0 ? Math.round(((c.current ?? 0) / c.goal) * 100) : 0,
          icon: c.difficulty === "Hard" ? TrendingUp : c.difficulty === "Medium" ? Target : Flame,
          color: c.difficulty === "Hard" ? "purple" : c.difficulty === "Medium" ? "blue" : "teal",
        })));
      }
    } catch {}

    // Fetch user XP/Level
    try {
      const res = await fetch("/api/auth/me", { headers });
      if (res.ok) {
        const data = await res.json();
        const xp = data.xp || 0;
        const level = data.level || 1;
        const completedCount = data.completedChallenges || 0;
        const titles = ["Beginner", "Saver", "Smart Spender", "Budget Pro", "Money Maestro", "Finance Guru", "Wealth Master", "Legend"];
        setUserLevel({
          level,
          xp,
          nextLevelXp: level * 1000,
          title: titles[Math.min(level - 1, titles.length - 1)],
          totalPoints: xp,
        });

        // Update achievements based on real data
        setAchievements(prev => prev.map(a => {
          if (a.id === 1) return { ...a, unlocked: completedCount > 0 || xp > 0 };
          if (a.id === 5) return { ...a, unlocked: completedCount >= 10 };
          return a;
        }));

        // Update leaderboard "You" entry
        leaderboard[3].points = xp;
      }
    } catch {}
  };

  const handleAddChallenge = async () => {
    if (!newChallenge.title.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newChallenge.title,
          description: newChallenge.description || "A custom savings challenge",
          goal: Number(newChallenge.goal) || 10000,
          unit: "₹",
          difficulty: newChallenge.difficulty,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setChallenges(prev => [...prev, {
          ...saved,
          current: saved.current ?? 0,
          goal: saved.goal ?? 0,
          unit: saved.unit || "₹",
          daysLeft: saved.daysLeft ?? 30,
          reward: saved.reward ?? (saved.difficulty === "Hard" ? 200 : saved.difficulty === "Medium" ? 100 : 50),
          participants: saved.participants ?? 0,
          progress: 0,
          icon: saved.difficulty === "Hard" ? TrendingUp : saved.difficulty === "Medium" ? Target : Flame,
          color: saved.difficulty === "Hard" ? "purple" : saved.difficulty === "Medium" ? "blue" : "teal",
        }]);
      }
    } catch {
      alert("Failed to create challenge. Backend may be unavailable.");
    }
    setNewChallenge({ title: "", description: "", goal: "", difficulty: "Medium" });
    setShowNewChallenge(false);
  };

  const handleSaveProgress = async () => {
    if (!loggingChallenge || !progressAmount || isNaN(Number(progressAmount))) return;
    const amount = Number(progressAmount);
    if (amount <= 0) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/challenges/${loggingChallenge.id}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const updated = await res.json();
        setChallenges(prev => prev.map(c => c.id === updated.id ? {
          ...updated,
          current: updated.current ?? 0,
          goal: updated.goal ?? 0,
          unit: updated.unit || c.unit || "₹",
          daysLeft: updated.daysLeft ?? c.daysLeft ?? 30,
          reward: updated.reward ?? c.reward ?? 100,
          participants: c.participants ?? 0,
          progress: updated.goal > 0 ? Math.round(((updated.current ?? 0) / updated.goal) * 100) : 0,
          icon: updated.difficulty === "Hard" ? TrendingUp : updated.difficulty === "Medium" ? Target : Flame,
          color: updated.difficulty === "Hard" ? "purple" : updated.difficulty === "Medium" ? "blue" : "teal",
        } : c));
        // Refresh user data for XP update
        fetchAll();
      }
    } catch {
      alert("Failed to log progress. Backend may be unavailable.");
    }
    setProgressAmount("");
    setIsLoggingProgress(false);
    setLoggingChallenge(null);
  };

  // Build habit calendar from real habit completedDates
  const habitCalendar = Array.from({ length: 28 }, (_, i) => {
    const day = i + 1;
    const dateStr = new Date(new Date().getFullYear(), new Date().getMonth(), day).toISOString().split("T")[0];
    const completed = habits.some((h: any) => h.completedDates?.includes(dateStr));
    return { day, completed, streak: completed };
  });

  // Derive streaks from habits
  const streaks = habits.length > 0
    ? habits.slice(0, 3).map((h: any) => ({
        name: h.name || "Habit",
        streak: h.currentStreak || 0,
        best: h.targetDays || 30,
        icon: Flame,
        color: "orange",
        active: true,
      }))
    : [
        { name: "Daily Budget Check", streak: 0, best: 30, icon: Flame, color: "orange", active: false },
        { name: "Expense Logging", streak: 0, best: 30, icon: Zap, color: "yellow", active: false },
        { name: "Savings Goal", streak: 0, best: 30, icon: Target, color: "blue", active: false },
      ];

  const xpPct = userLevel.nextLevelXp > 0 ? Math.round((userLevel.xp / userLevel.nextLevelXp) * 100) : 0;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const completedChallenges = challenges.filter((c: any) => c.completed).map((c: any) => c.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Habit Builder</h1>
          <p className="text-gray-400">Build better financial habits with gamified challenges</p>
        </div>
        <Button
          onClick={() => setShowNewChallenge(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          New Challenge
        </Button>
      </div>

      {/* New Challenge Dialog */}
      {showNewChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Create New Challenge</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-1">Challenge Title</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. No Eating Out Week"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                  rows={2}
                  placeholder="What is this challenge about?"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1">Savings Goal (₹)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. 10000"
                  value={newChallenge.goal}
                  onChange={(e) => setNewChallenge({ ...newChallenge, goal: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1">Difficulty</label>
                <div className="flex gap-2">
                  {(["Easy", "Medium", "Hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setNewChallenge({ ...newChallenge, difficulty: d })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        newChallenge.difficulty === d
                          ? d === "Easy" ? "bg-green-500/20 text-green-400 border-green-500/40"
                            : d === "Medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                          : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewChallenge(false)}
                className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChallenge}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Create Challenge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Progress Dialog */}
      {isLoggingProgress && loggingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Log Progress</h2>
            <p className="text-sm text-gray-400 mb-4">
              Add progress to <span className="text-blue-400 font-medium">{loggingChallenge.title}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-1">
                  Amount ({loggingChallenge.unit})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-lg focus:border-blue-500 focus:outline-none"
                    placeholder={`e.g. ${loggingChallenge.unit === "₹" ? "500" : "1"}`}
                    value={progressAmount}
                    onChange={(e) => setProgressAmount(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Current: {loggingChallenge.unit === "₹" ? `₹${loggingChallenge.current.toLocaleString("en-IN")}` : `${loggingChallenge.current} ${loggingChallenge.unit}`}</span>
                  <span>Goal: {loggingChallenge.unit === "₹" ? `₹${loggingChallenge.goal.toLocaleString("en-IN")}` : `${loggingChallenge.goal} ${loggingChallenge.unit}`}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsLoggingProgress(false);
                  setLoggingChallenge(null);
                  setProgressAmount("");
                }}
                className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                className="flex-[2] py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex justify-center items-center gap-2"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Level Card */}
      <Card className="bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-teal-500/10 backdrop-blur-xl border-blue-500/20 p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <AnimatedRobot size="md" animate={true} />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-gray-900 flex items-center justify-center">
                <span className="text-xs font-black text-white">{userLevel.level}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">Level {userLevel.level}</h2>
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">{userLevel.title}</Badge>
              </div>
              <p className="text-gray-400 text-sm">{userLevel.xp.toLocaleString()} / {userLevel.nextLevelXp.toLocaleString()} XP</p>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">{userLevel.totalPoints.toLocaleString()} points total</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full md:w-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress to Level {userLevel.level + 1}</span>
              <span className="text-white font-bold">{xpPct}%</span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Challenges Done", value: completedChallenges.length, icon: Trophy, color: "text-yellow-400" },
                { label: "Achievements", value: `${unlockedCount}/${achievements.length}`, icon: Award, color: "text-purple-400" },
                { label: "Best Streak", value: "22 days", icon: Flame, color: "text-orange-400" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="text-center p-3 rounded-xl bg-gray-800/40">
                    <Icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                    <p className="font-bold text-white">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Streak Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {(habits.length > 0 ? habits : streaks).map((streak: any, index: number) => {
          const Icon = streak.icon || Flame;
          const color = streak.color || "orange";
          const currentStreak = streak.currentStreak !== undefined ? streak.currentStreak : streak.streak;
          const best = streak.goalDays !== undefined ? streak.goalDays : streak.best;
          const name = streak.name;
          const active = streak.active !== undefined ? streak.active : true;
          const bestPct = best ? Math.min(100, Math.round((currentStreak / best) * 100)) : 0;
          return (
            <Card key={index} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${color}-400`} />
                </div>
                {active && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-1">{name}</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-black text-white">{currentStreak}</span>
                <span className="text-gray-400 mb-1">days</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Current</span>
                  <span>Goal: {best} days</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-${color}-500`}
                    style={{ width: `${bestPct}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-2xl border border-gray-700/50 w-fit">
        {[
          { id: "challenges", label: "Active Challenges", icon: Target },
          { id: "achievements", label: "Achievements", icon: Trophy },
          { id: "leaderboard", label: "Leaderboard", icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Challenges Tab */}
      {activeTab === "challenges" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              const isDone = completedChallenges.includes(challenge.id) || challenge.progress === 100;
              return (
                <Card
                  key={challenge.id}
                  className={`backdrop-blur-xl p-6 transition-all hover:scale-[1.02] ${
                    isDone
                      ? "bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20"
                      : "bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50 hover:border-gray-600/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-${challenge.color}-500/10 border border-${challenge.color}-500/20 flex items-center justify-center`}>
                      {isDone ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <Icon className={`w-6 h-6 text-${challenge.color}-400`} />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={difficultyColor[challenge.difficulty]}>
                        {challenge.difficulty}
                      </Badge>
                      {isDone ? (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">✓ Done!</Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          <Calendar className="w-3 h-3 mr-1" />
                          {challenge.daysLeft}d left
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{challenge.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{challenge.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-bold text-white">{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-2.5" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{challenge.unit === "₹" ? `₹${(challenge.current || 0).toLocaleString("en-IN")}` : `${challenge.current || 0} ${challenge.unit || ""}`}</span>
                      <span>{challenge.unit === "₹" ? `₹${(challenge.goal || 0).toLocaleString("en-IN")}` : `${challenge.goal || 0} ${challenge.unit || ""}`}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-400">{challenge.reward} XP</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-400">{(challenge.participants || 0).toLocaleString()} joined</span>
                      </div>
                    </div>
                    {!isDone && (
                      <button
                        onClick={() => {
                          setLoggingChallenge(challenge);
                          setIsLoggingProgress(true);
                        }}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Log progress <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Habit Calendar */}
          <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">March 2026 — Habit Calendar</h2>
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                <Flame className="w-3 h-3 mr-1" />22-day streak
              </Badge>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <p key={d} className="text-center text-xs text-gray-600">{d}</p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {habitCalendar.map((day) => (
                <div
                  key={day.day}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-medium transition-all ${
                    day.completed
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                      : day.day <= new Date().getDate()
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-gray-800/50 text-gray-600"
                  }`}
                >
                  {day.completed ? <CheckCircle2 className="w-4 h-4" /> : day.day}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{unlockedCount} of {achievements.length} achievements unlocked</p>
              <p className="text-sm text-gray-500">Keep completing challenges to earn more!</p>
            </div>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-sm px-3 py-1">
              {unlockedCount}/{achievements.length} Unlocked
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:scale-105"
                      : "bg-gray-800/40 border-gray-700/50 opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      achievement.unlocked ? "bg-yellow-500/20" : "bg-gray-700/50"
                    }`}>
                      {achievement.unlocked
                        ? <Icon className="w-6 h-6 text-yellow-400" />
                        : <Lock className="w-5 h-5 text-gray-600" />
                      }
                    </div>
                    <span className="text-xs text-gray-500">{achievement.category}</span>
                  </div>
                  <h3 className={`font-bold mb-1 ${achievement.unlocked ? "text-white" : "text-gray-500"}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${achievement.unlocked ? "text-yellow-400" : "text-gray-600"}`}>
                      +{achievement.xp} XP
                    </span>
                    {achievement.unlocked && (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">✓ Earned</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">This Month's Top Savers</h2>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">March 2026</Badge>
          </div>
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  user.isMe
                    ? "bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-blue-500/30"
                    : "bg-gray-800/40 border-gray-700/30 hover:border-gray-600/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  user.rank === 1 ? "bg-yellow-500 text-white" :
                  user.rank === 2 ? "bg-gray-400 text-white" :
                  user.rank === 3 ? "bg-orange-600 text-white" :
                  "bg-gray-700 text-gray-400"
                }`}>
                  {user.rank === 1 ? "👑" : user.rank}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${user.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${user.isMe ? "text-blue-300" : "text-white"}`}>
                    {user.name}{user.isMe ? " (You)" : ""}
                  </p>
                  <p className="text-xs text-gray-500">{user.points.toLocaleString()} points</p>
                </div>
                <div className="text-right">
                  <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${(user.points / leaderboard[0].points) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
            <p className="text-sm text-gray-300">You're <span className="text-blue-400 font-bold">3,600 points</span> away from the top 3!</p>
            <p className="text-xs text-gray-500 mt-1">Complete 2 more challenges to climb the leaderboard 🚀</p>
          </div>
        </Card>
      )}

      <RobotGuide
        messages={[
          "22-day expense logging streak! 🔥 You're in the top 5% of FinTrack users!",
          "Complete the Coffee Break Challenge in just 2 more days to earn 50 XP! ☕",
          "3 achievements away from 'Challenge Champion' badge. Keep going! 🏆",
        ]}
        position="bottom-right"
      />
    </div>
  );
}
