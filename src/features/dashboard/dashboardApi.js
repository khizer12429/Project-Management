import { supabase } from '@/lib/supabase'

export async function fetchDashboardStats(isAdmin) {
  const today = new Date().toISOString().slice(0, 10)

  const requests = [
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'done'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'done')
      .lte('due_date', today)
      .not('due_date', 'is', null),
  ]

  if (isAdmin) {
    requests.unshift(
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    )
  }

  const results = await Promise.all(requests)

  results.forEach((result) => {
    if (result.error) {
      throw new Error(result.error.message)
    }
  })

  if (isAdmin) {
    const [users, projects, activeTasks, overdueTasks] = results
    return {
      totalUsers: users.count ?? 0,
      totalProjects: projects.count ?? 0,
      activeTasks: activeTasks.count ?? 0,
      overdueTasks: overdueTasks.count ?? 0,
    }
  }

  const [projects, activeTasks, overdueTasks] = results
  return {
    totalUsers: null,
    totalProjects: projects.count ?? 0,
    activeTasks: activeTasks.count ?? 0,
    overdueTasks: overdueTasks.count ?? 0,
  }
}
