import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  BarChart2,
  User,
  LogOut,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/challenges', icon: Target, label: 'Challenges' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64 fixed left-0 top-0 bottom-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <TrendingUp className="text-indigo-400" size={24} />
        <span className="text-xl font-bold text-indigo-400">FinTrack</span>
      </div>

      <div className="px-4 py-3 border-b border-gray-700">
        <p className="text-xs text-gray-400">Welcome back,</p>
        <p className="font-medium truncate">{user?.username}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-900/50 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
