import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  HiOutlineViewGrid, HiOutlinePencilAlt, HiOutlineUserCircle,
  HiOutlineChartBar, HiOutlineLightBulb, HiOutlineBeaker,
  HiOutlineStar, HiOutlineDocumentReport, HiOutlineCog,
  HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineShieldCheck,
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { path: '/log', icon: HiOutlinePencilAlt, label: 'Log Health' },
  { path: '/twin', icon: HiOutlineUserCircle, label: 'Digital Twin' },
  { path: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
  { path: '/predictions', icon: HiOutlineLightBulb, label: 'Predictions' },
  { path: '/simulator', icon: HiOutlineBeaker, label: 'Simulator' },
  { path: '/achievements', icon: HiOutlineStar, label: 'Achievements' },
  { path: '/report', icon: HiOutlineDocumentReport, label: 'Weekly Report' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col
          bg-surface-900/80 backdrop-blur-xl border-r border-white/[0.06]
          transform transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/[0.06]">
          <span className="text-3xl">🧬</span>
          <div>
            <h1 className="text-lg font-bold gradient-text">Vitalis AI</h1>
            <p className="text-[10px] text-surface-500 uppercase tracking-widest">Health Coach</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-surface-400 hover:text-white"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-hide space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="h-px bg-white/[0.06] my-3" />
              <NavLink
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <HiOutlineShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Admin Panel</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <NavLink
              to="/settings"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs text-surface-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <HiOutlineCog className="w-4 h-4" />
              Settings
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs text-surface-400 hover:text-vitalis-red hover:bg-vitalis-red/10 transition-colors"
            >
              <HiOutlineLogout className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-surface-900/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <HiOutlineMenu className="w-6 h-6" />
          </button>
          <span className="text-lg">🧬</span>
          <span className="font-semibold gradient-text">Vitalis AI</span>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
