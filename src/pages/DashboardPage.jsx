import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { StatCard } from '@/components/ui/StatCard'
import { Alert } from '@/components/ui/Alert'
import { loadDashboardStats, selectDashboard } from '@/features/dashboard/dashboardSlice'
import { selectAuth } from '@/features/auth/authSlice'
import { ROLES } from '@/lib/constants'

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(selectAuth)
  const { stats, status, error } = useAppSelector(selectDashboard)
  const isAdmin = user?.role === ROLES.ADMIN

  useEffect(() => {
    dispatch(loadDashboardStats(isAdmin))
  }, [dispatch, isAdmin])

  const cards = [
    ...(isAdmin
      ? [{ label: 'Total Users', value: stats?.totalUsers, variant: 'orange' }]
      : []),
    { label: 'Active Projects', value: stats?.totalProjects, variant: isAdmin ? 'beige' : 'orange' },
    { label: 'Active Tasks', value: stats?.activeTasks, variant: isAdmin ? 'orange' : 'beige' },
    { label: 'Overdue Tasks', value: stats?.overdueTasks, variant: 'beige' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="m-0 text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-muted">
          Overview of projects, tasks, and overdue work.
        </p>
      </div>

      {error && <Alert className="mb-6">{error}</Alert>}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={status === 'loading' ? '…' : card.value}
            variant={card.variant}
          />
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="m-0 text-lg font-semibold text-ink">Quick summary</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Welcome back, {user?.fullName?.split(' ')[0] || 'there'}. You are signed in as{' '}
            {isAdmin ? 'an admin' : 'a team member'}. Use the sidebar to{' '}
            {isAdmin ? 'manage projects and users' : 'view projects and tasks'}.
          </p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="m-0 text-lg font-semibold text-ink">Task health</h2>
          <div className="mt-6 flex items-center justify-center">
            <div className="relative grid size-36 place-items-center rounded-full border-8 border-stat-beige sm:size-48">
              <div className="text-center">
                <p className="m-0 text-3xl font-semibold text-stat-orange">
                  {stats?.overdueTasks ?? 0}
                </p>
                <p className="m-0 text-xs text-muted">Overdue</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
