import { supabase } from './supabase'

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, role: 'user' }, { onConflict: 'id' })

    if (insertError) return { error: insertError }

    return { data: { ...data, profile: { id: data.user.id, username: null, role: 'user' } } }
  }

  return { data: { ...data, profile } }
}

export async function setUsername(userId, username) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', userId)
    .select()
    .single()

  if (error) return { error }
  return { data }
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('role', { ascending: false })

  if (error) return { error }
  return { data }
}

export async function updateRole(userId, newRole) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single()

  if (error) return { error }
  return { data }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, role: 'user' }, { onConflict: 'id' })

    if (insertError) return user

    return { ...user, username: null, role: 'user' }
  }

  return { ...user, ...profile }
}
