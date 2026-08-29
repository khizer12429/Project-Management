import { supabase } from '@/lib/supabase'

function mapComment(row) {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    authorName: row.author?.full_name ?? 'Unknown',
    body: row.body,
    createdAt: row.created_at,
  }
}

export async function fetchTaskComments(taskId) {
  const { data, error } = await supabase
    .from('task_comments')
    .select(
      `
      id,
      task_id,
      user_id,
      body,
      created_at,
      author:profiles!task_comments_user_id_fkey ( full_name )
    `,
    )
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapComment)
}

export async function createTaskComment({ taskId, body }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be signed in to comment.')
  }

  const { data, error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      user_id: user.id,
      body: body.trim(),
    })
    .select(
      `
      id,
      task_id,
      user_id,
      body,
      created_at,
      author:profiles!task_comments_user_id_fkey ( full_name )
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapComment(data)
}
