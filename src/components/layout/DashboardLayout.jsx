import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Brand } from '@/components/ui/Brand'
import { logout, selectAuth } from '@/features/auth/authSlice'
import { cn } from '@/lib/cn'
import { ROLES, ROUTES } from '@/lib/constants'

const navItems = [
  {
    to: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    ),
  },
  {
    to: ROUTES.PROJECTS,
    label: 'Projects',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16M4 12h16M4 17h10" />
      </svg>
    ),
  },
  {
    to: ROUTES.TASKS,
    label: 'Tasks',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
      </svg>
    ),
  },
  {
    to: ROUTES.USERS,
    label: 'User Manage',
    adminOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 11a4 4 0 1 0-8 0M4 20a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
]

export function DashboardLayout() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(selectAuth)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAdmin = user?.role === ROLES.ADMIN

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-dvh bg-sidebar">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="px-5 py-5">
          <Brand compact />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium no-underline transition-colors',
                    isActive
                      ? 'bg-sidebar-active text-white'
                      : 'text-ink-soft hover:bg-white/70 hover:no-underline',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
        </nav>
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="mx-3 mb-4 flex cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-4 py-3 text-sm font-medium text-ink-soft hover:bg-white/70"
        >
          <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 7V5a1 1 0 0 1 1-1h8v16h-8a1 1 0 0 1-1-1v-2M7 12H3m0 0 3-3M3 12l3 3" />
          </svg>
          Logout
        </button>
      </aside>

      <div className="flex min-h-dvh flex-col lg:ml-64">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
          <button
            type="button"
            className="grid size-10 cursor-pointer place-items-center rounded-lg border border-border bg-surface text-ink lg:hidden"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="m-0 text-sm font-semibold text-ink">{user?.fullName}</p>
              <p className="m-0 text-xs capitalize text-muted">{user?.role}</p>
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-stat-orange text-sm font-bold text-white">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
