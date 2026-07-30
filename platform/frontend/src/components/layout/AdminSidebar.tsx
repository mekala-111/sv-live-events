import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ADMIN_NAV } from '@/constants/eventPortal'
import { cn } from '@/lib/utils'
import logo from '@/assets/Logo.png'

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
  onLogout: () => void
}

export function AdminSidebar({ collapsed, onToggle, onLogout }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-xl transition-[width] duration-300',
        collapsed ? 'w-[76px]' : 'w-[280px]',
        'hidden lg:flex',
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-white/[0.06] px-4', collapsed ? 'justify-center' : 'gap-3')}>
        <img src={logo} alt="SV Live Events" className="h-8 w-auto shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="min-w-0"
            >
              <p className="truncate font-display text-sm font-semibold text-white">SV Live Events</p>
              <p className="truncate text-[10px] tracking-wider text-gold uppercase">Admin</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {ADMIN_NAV.map((group) => (
          <div key={group.id}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-white/30 uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ id, to, icon: Icon, label, end, danger }) => {
                if (id === 'logout') {
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={onLogout}
                      title={label}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                        'text-red-400/80 hover:bg-red-500/10 hover:text-red-300',
                        collapsed && 'justify-center px-0',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && label}
                    </button>
                  )
                }

                return (
                  <NavLink
                    key={id}
                    to={to}
                    end={end}
                    title={label}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                        collapsed && 'justify-center px-0',
                        isActive
                          ? 'bg-gold/10 text-gold shadow-[inset_3px_0_0_0_#F7B733,0_0_20px_rgba(247,183,51,0.12)]'
                          : danger
                            ? 'text-red-400/80 hover:bg-red-500/10'
                            : 'text-white/55 hover:bg-white/[0.04] hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition',
                            isActive ? 'text-gold' : 'group-hover:scale-110',
                          )}
                        />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        className="m-3 flex items-center justify-center gap-2 rounded-xl border border-white/5 py-2.5 text-xs text-white/40 transition hover:border-gold/30 hover:text-gold"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}
      </button>
    </aside>
  )
}
