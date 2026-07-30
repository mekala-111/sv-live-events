import { useState } from 'react'
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ADMIN_NAV } from '@/constants/eventPortal'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { cn } from '@/lib/utils'
import logo from '@/assets/Logo.png'

export function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isEventPortal =
    location.pathname.startsWith('/admin/events') || location.pathname.startsWith('/admin/themes')

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} onLogout={logout} />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[0.06] bg-[#0a0a0a] lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="SV Live Events" className="h-8 w-auto" />
                  <p className="font-display text-sm font-semibold">SV Live Events</p>
                </div>
                <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-white/50">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
                {ADMIN_NAV.map((group) => (
                  <div key={group.id}>
                    <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-white/30 uppercase">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map(({ id, to, icon: Icon, label, end, danger }) =>
                        id === 'logout' ? (
                          <button
                            key={id}
                            type="button"
                            onClick={logout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/80"
                          >
                            <Icon className="h-4 w-4" /> {label}
                          </button>
                        ) : (
                          <NavLink
                            key={id}
                            to={to}
                            end={end}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                                isActive
                                  ? 'bg-gold/10 text-gold shadow-[inset_3px_0_0_0_#F7B733]'
                                  : danger
                                    ? 'text-red-400'
                                    : 'text-white/55 hover:bg-white/[0.04]',
                              )
                            }
                          >
                            <Icon className="h-4 w-4" /> {label}
                          </NavLink>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={cn('min-h-screen transition-[padding] duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-[280px]')}>
        <div className={cn(!isEventPortal && 'p-6 lg:p-10')}>
          <Outlet context={{ openMobileNav: () => setMobileOpen(true), collapsed }} />
        </div>
      </div>
    </div>
  )
}
