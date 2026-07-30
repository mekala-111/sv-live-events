import { Outlet, NavLink, Navigate } from 'react-router-dom'
import {
  Bell, Calendar, CreditCard, FileText, Headphones, LayoutDashboard, LogOut, User, Video,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import logo from '@/assets/Logo.png'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/dashboard/invoices', icon: FileText, label: 'Invoices' },
  { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
  { to: '/dashboard/recordings', icon: Video, label: 'Recordings' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { to: '/dashboard/support', icon: Headphones, label: 'Support' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
]

export function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />

  return (
    <div className="flex min-h-screen bg-[#090909]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 glass-strong lg:flex">
        <div className="flex items-center gap-3 border-b border-white/5 p-6">
          <img src={logo} alt="SV Live" className="h-8 w-auto" />
          <div>
            <p className="font-display text-sm font-semibold">Client Portal</p>
            <p className="text-xs text-white/40">{user?.name}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition',
                  isActive ? 'bg-gold/15 text-gold-light' : 'text-white/60 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="m-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/50 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  )
}
