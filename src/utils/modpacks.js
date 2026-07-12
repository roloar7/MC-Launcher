import { supabase } from './supabase'

export async function getModpacks() {
  const { data, error } = await supabase
    .from('modpacks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { error }
  return { data }
}

export async function addModpack({ name, description, image_url, minecraft_version, mod_count }) {
  const { data, error } = await supabase
    .from('modpacks')
    .insert({ name, description, image_url, minecraft_version, mod_count })
    .select()
    .single()

  if (error) return { error }
  return { data }
}

export async function deleteModpack(id) {
  const { error } = await supabase
    .from('modpacks')
    .delete()
    .eq('id', id)

  if (error) return { error }
  return { data: true }
}
