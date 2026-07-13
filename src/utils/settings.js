import { supabase } from './supabase'

export async function getSetting(key) {
  const { data, error } = await supabase
    .from('settings')
    .select(key)
    .limit(1)
    .single()

  if (error) return null
  return data?.[key] || null
}

export async function setSetting(key, value) {
  const { data, error: selectError } = await supabase
    .from('settings')
    .select('id')
    .limit(1)
    .single()

  if (selectError) {
    const { error } = await supabase
      .from('settings')
      .insert({ [key]: value })
    return { error }
  }

  const { error } = await supabase
    .from('settings')
    .update({ [key]: value })
    .eq('id', data.id)

  return { error }
}
