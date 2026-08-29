import { supabase } from '@/lib/supabase'

export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, created_at, updated_at, created_by')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createProject({ name, description }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be signed in to create a project.')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      created_by: user.id,
    })
    .select('id, name, description, created_at, updated_at, created_by')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateProject({ id, name, description }) {
  const { data, error } = await supabase
    .from('projects')
    .update({ name, description })
    .eq('id', id)
    .select('id, name, description, created_at, updated_at, created_by')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
