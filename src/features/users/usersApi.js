import { supabase } from '@/lib/supabase'

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createUser({ fullName, email, password, role }) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  const adminSession = sessionData.session

  if (!adminSession) {
    throw new Error('You must be signed in as an admin to create users.')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('Unable to create user.')
  }

  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error('A user with this email already exists.')
  }

  const { error: restoreError } = await supabase.auth.setSession({
    access_token: adminSession.access_token,
    refresh_token: adminSession.refresh_token,
  })

  if (restoreError) {
    throw new Error(
      'User was created but your admin session could not be restored. Please sign in again.',
    )
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      email,
      role,
    })
    .eq('id', data.user.id)
    .select('id, full_name, email, role, created_at')
    .maybeSingle()

  if (profileError) {
    return {
      id: data.user.id,
      full_name: fullName,
      email,
      role,
      created_at: new Date().toISOString(),
    }
  }

  return (
    profile ?? {
      id: data.user.id,
      full_name: fullName,
      email,
      role,
      created_at: new Date().toISOString(),
    }
  )
}

export async function updateUser({ id, fullName, email, role }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      email,
      role,
    })
    .eq('id', id)
    .select('id, full_name, email, role, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteUser(id) {
  const { error } = await supabase.rpc('admin_delete_user', {
    p_user_id: id,
  })

  if (error) {
    throw new Error(error.message)
  }
}
