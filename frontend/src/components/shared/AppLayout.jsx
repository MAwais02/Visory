import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, BookOpen, PlusCircle, Bookmark, User,
  Bell, LogOut, ChevronLeft, Shield, Zap, Menu, X
} from 'lucide-react'
import useAuthStore from '../../context/authStore'
import api from '../../utils/api'
import { useQuery } from '@tanstack/react-query'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'My Courses', end: true },
  { to: '/courses/generate', icon: PlusCircle, label: 'Generate Course' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 60000,
  })

  const unread = notifData?.unreadCount || 0

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-40 h-full flex flex-col bg-[#16161f] border-r border-white/[0.07]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-white/[0.07] min-h-[64px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          {!collapsed && <span className="font-bold text-white text-sm tracking-wide">Visory</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-[#8888aa] hover:bg-white/5 hover:text-[#e8e8f0]'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-yellow-500/20 text-yellow-400' : 'text-[#8888aa] hover:bg-white/5 hover:text-[#e8e8f0]'}`
              }
            >
              <Shield size={18} className="flex-shrink-0" />
              {!collapsed && <span>Admin Panel</span>}
            </NavLink>
          )}
        </nav>

        {/* Bottom: user + actions */}
        <div className="p-3 border-t border-white/[0.07] space-y-1">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="text-left overflow-hidden">
                <p className="text-xs font-medium text-[#e8e8f0] truncate">{user?.name}</p>
                <p className="text-[10px] text-[#8888aa] truncate">{user?.email}</p>
              </div>
            )}
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-[#8888aa] hover:text-[#e8e8f0] transition-all text-sm relative"
          >
            <Bell size={16} />
            {!collapsed && <span>Notifications</span>}
            {unread > 0 && (
              <span className="absolute top-1 left-5 w-4 h-4 bg-primary-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-[#8888aa] hover:text-red-400 transition-all text-sm"
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-[#8888aa] transition-all text-sm"
          >
            <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#16161f]">
          <button onClick={() => setMobileOpen(true)} className="text-[#8888aa] hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary-400" />
            <span className="text-sm font-bold text-white">Visory</span>
          </div>
          <div className="w-8" />
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}