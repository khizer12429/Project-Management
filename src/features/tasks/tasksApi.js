import { supabase } from '@/lib/supabase'

const taskSelect = `
  id,
  title,
  description,
  status,
  priority,
  due_date,
  created_at,
  updated_at,
  project_id,
  assigned_to,
  created_by,
  projects ( name ),
  assignee:profiles!tasks_assigned_to_fkey ( id, full_name )
`

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    projectId: row.project_id,
    projectName: row.projects?.name ?? 'Unknown',
    assignedTo: row.assigned_to,
    assigneeName: row.assignee?.full_name ?? null,
    createdBy: row.created_by,
  }
}

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select(taskSelect)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapTask)
}

export async function fetchAssignableUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name')

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createTask(payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be signed in to create a task.')
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: payload.projectId,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      due_date: payload.dueDate || null,
      assigned_to: payload.assignedTo || null,
      created_by: user.id,
    })
    .select(taskSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapTask(data)
}

export async function updateTaskStatus({ id, status }) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id)
    .select(taskSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapTask(data)
}

export async function updateTask(payload) {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      project_id: payload.projectId,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      due_date: payload.dueDate || null,
      assigned_to: payload.assignedTo || null,
    })
    .eq('id', payload.id)
    .select(taskSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapTask(data)
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
