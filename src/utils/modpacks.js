import { supabase } from './supabase'

export async function getModpacks() {
  const { data, error } = await supabase
    .from('modpacks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { error }
  return { data }
}

export async function addModpack({ name, description, image_url, minecraft_version, mod_count, loader, memory_min, memory_max }) {
  const { data, error } = await supabase
    .from('modpacks')
    .insert({ name, description, image_url, minecraft_version, mod_count, loader, memory_min, memory_max })
    .select()
    .single()

  if (error) return { error }
  return { data }
}

export async function updateModpack(id, { name, description, image_url, minecraft_version, mod_count, loader, memory_min, memory_max }) {
  const { error } = await supabase
    .from('modpacks')
    .update({ name, description, image_url, minecraft_version, mod_count, loader, memory_min, memory_max })
    .eq('id', id)

  if (error) return { error }
  return { data: { id, name, description, image_url, minecraft_version, mod_count, loader, memory_min, memory_max } }
}

export async function deleteModpack(id) {
  await supabase.storage.from('modpacks').list(id)
  const { data: files } = await supabase.storage.from('modpacks').list(id)
  if (files && files.length > 0) {
    const paths = files.map(f => `${id}/${f.name}`)
    await supabase.storage.from('modpacks').remove(paths)
  }

  const { error } = await supabase
    .from('modpacks')
    .delete()
    .eq('id', id)

  if (error) return { error }
  return { data: true }
}

export async function uploadModpackFiles(modpackId, files, onProgress) {
  let uploaded = 0
  const total = files.length

  for (const file of files) {
    const relativePath = file.webkitRelativePath
      ? file.webkitRelativePath.split('/').slice(1).join('/')
      : file.name
    const filePath = `${modpackId}/${relativePath}`
    const { error } = await supabase.storage
      .from('modpacks')
      .upload(filePath, file, { upsert: true })

    if (error) return { error }
    uploaded++
    if (onProgress) onProgress(uploaded, total)
  }

  return { data: true }
}

async function listAllFiles(bucket, folder) {
  const files = []
  const { data: items } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  })
  if (!items) return files

  for (const item of items) {
    if (item.id) {
      files.push({ path: `${folder}/${item.name}`, name: item.name })
    } else {
      const sub = await listAllFiles(bucket, `${folder}/${item.name}`)
      files.push(...sub)
    }
  }
  return files
}

export async function getModpackFiles(modpackId) {
  try {
    const files = await listAllFiles('modpacks', modpackId)
    return { data: files }
  } catch {
    return { data: [] }
  }
}

export async function getModpackFileUrl(modpackId, filePath) {
  const { data } = supabase.storage
    .from('modpacks')
    .getPublicUrl(`${modpackId}/${filePath}`)
  return data.publicUrl
}
