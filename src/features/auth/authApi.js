import { supabase } from '@/lib/supabase'

function toUser(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email,
    fullName: profile.full_name,
    role: profile.role,
  }
}

function toAuthError(error, fallback) {
  const code = error?.code
  const message = error?.message ?? fallback

  if (code === 'PGRST116') {
    return 'Your profile was not found. Please try again or contact support.'
  }

  if (message === 'Invalid login credentials') {
    return 'Email or password is incorrect.'
  }

  if (code === 'email_not_confirmed' || message.toLowerCase().includes('email not confirmed')) {
    return 'This account is not active yet. Ask an admin to confirm it, then try again.'
  }

  if (message.toLowerCase().includes('user already registered')) {
    return 'An account with this email already exists.'
  }

  if (message.toLowerCase().includes('cannot coerce the result to a single json object')) {
    return 'Your profile was not found. Please try again or contact support.'
  }

  return message
}

async function getProfile(authUser) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', authUser.id)
    .maybeSingle()

  if (error) {
    throw new Error(toAuthError(error, 'Unable to load your profile.'))
  }

  if (data) {
    return data
  }

  throw new Error('This account is not active or has been removed. Contact an admin.')
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(toAuthError(error, 'Unable to restore your session.'))
  }

  if (!data.session) {
    return null
  }

  try {
    const profile = await getProfile(data.session.user)

    return {
      session: data.session,
      user: toUser(data.session.user, profile),
    }
  } catch {
    await supabase.auth.signOut()
    return null
  }
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(toAuthError(error, 'Unable to sign in.'))
  }

  try {
    const profile = await getProfile(data.user)

    return {
      session: data.session,
      user: toUser(data.user, profile),
    }
  } catch (profileError) {
    await supabase.auth.signOut()
    throw profileError
  }
}

export async function signUpWithEmail({ fullName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    throw new Error(toAuthError(error, 'Unable to create your account.'))
  }

  if (!data.user) {
    throw new Error('Unable to create your account.')
  }

  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists.')
  }

  if (!data.session) {
    const signedIn = await supabase.auth.signInWithPassword({ email, password })

    if (signedIn.error || !signedIn.data.session) {
      throw new Error(toAuthError(signedIn.error, 'Account created. Sign in with your email and password.'))
    }

    const profile = await getProfile(signedIn.data.user)

    return {
      session: signedIn.data.session,
      user: toUser(signedIn.data.user, profile),
    }
  }

  const profile = await getProfile(data.user)

  return {
    session: data.session,
    user: toUser(data.user, profile),
  }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(toAuthError(error, 'Unable to sign out.'))
  }
}
