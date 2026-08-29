import { supabase } from '@/lib/supabase'

function mapActivity(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    taskId: row.task_id,
    userId: row.user_id,
    userName: row.actor?.full_name ?? 'Unknown',
    action: row.action,
    details: row.details ?? {},
    createdAt: row.created_at,
  }
}

export async function fetchTaskActivity() {
  const { data, error } = await supabase
    .from('activity')
    .select(
      `
      id,
      project_id,
      task_id,
      user_id,
      action,
      details,
      created_at,
      actor:profiles!activity_user_id_fkey ( full_name )
    `,
    )
    .eq('action', 'task_status_changed')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapActivity)
}
