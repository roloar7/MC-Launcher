import { useState, useEffect } from 'react'
import { getAllProfiles, updateRole } from '../utils/auth'
import { getModpacks, addModpack, updateModpack, deleteModpack, uploadModpackFiles } from '../utils/modpacks'
import './AdminPanel.css'

const EMPTY_FORM = {
  name: '',
  description: '',
  image_url: '',
  minecraft_version: '',
  mod_count: 0,
  loader: 'forge',
  memory_min: '2G',
  memory_max: '4G',
}

export default function AdminPanel() {
  const [profiles, setProfiles] = useState([])
  const [modpacks, setModpacks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('users')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [folder, setFolder] = useState(null)

  useEffect(() => {
    Promise.all([loadProfiles(), loadModpacks()]).then(() => setLoading(false))
  }, [])

  async function loadProfiles() {
    const { data, error } = await getAllProfiles()
    if (!error) setProfiles(data)
  }

  async function loadModpacks() {
    const { data, error } = await getModpacks()
    if (!error) setModpacks(data)
  }

  async function handleRoleChange(userId, newRole) {
    const { error } = await updateRole(userId, newRole)
    if (error) {
      setError(error.message)
      return
    }
    setProfiles(profiles.map(p =>
      p.id === userId ? { ...p, role: newRole } : p
    ))
  }

  async function handleAddModpack(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    const { data, error } = await addModpack(form)
    if (error) {
      setError(error.message)
      return
    }

    if (folder && folder.length > 0) {
      setUploading(true)
      setUploadProgress('Subiendo archivos...')

      const { error: uploadError } = await uploadModpackFiles(data.id, folder, (uploaded, total) => {
        setUploadProgress(`Subiendo ${uploaded}/${total} archivos...`)
      })

      setUploading(false)
      setUploadProgress('')

      if (uploadError) {
        setError(`Modpack creado pero error al subir archivos: ${uploadError.message}`)
      }
    }

    setModpacks([data, ...modpacks])
    setForm(EMPTY_FORM)
    setFolder(null)
  }

  async function handleUpdateModpack(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    const { data, error } = await updateModpack(editing, form)
    if (error) {
      setError(error.message)
      return
    }

    if (folder && folder.length > 0) {
      setUploading(true)
      setUploadProgress('Subiendo archivos...')

      const { error: uploadError } = await uploadModpackFiles(editing, folder, (uploaded, total) => {
        setUploadProgress(`Subiendo ${uploaded}/${total} archivos...`)
      })

      setUploading(false)
      setUploadProgress('')

      if (uploadError) {
        setError(`Modpack actualizado pero error al subir archivos: ${uploadError.message}`)
      }
    }

    setModpacks(modpacks.map(m => m.id === editing ? data : m))
    setEditing(null)
    setForm(EMPTY_FORM)
    setFolder(null)
  }

  function handleEditModpack(mp) {
    setEditing(mp.id)
    setForm({
      name: mp.name || '',
      description: mp.description || '',
      image_url: mp.image_url || '',
      minecraft_version: mp.minecraft_version || '',
      mod_count: mp.mod_count || 0,
      loader: mp.loader || 'forge',
      memory_min: mp.memory_min || '2G',
      memory_max: mp.memory_max || '4G',
    })
    setFolder(null)
  }

  function handleCancelEdit() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFolder(null)
  }

  async function handleDeleteModpack(id) {
    if (!confirm('¿Eliminar este modpack y todos sus archivos de Supabase?')) return

    const { error } = await deleteModpack(id)
    if (error) {
      setError(error.message)
      return
    }
    setModpacks(modpacks.filter(m => m.id !== id))
  }

  const MC_VERSIONS = [
    '1.21.5','1.21.4','1.21.3','1.21.2','1.21.1','1.21',
    '1.20.6','1.20.4','1.20.3','1.20.2','1.20.1','1.20',
    '1.19.4','1.19.3','1.19.2','1.18.2','1.17.1',
    '1.16.5','1.16.4','1.16.3','1.15.2','1.14.4',
    '1.12.2','1.10.2','1.8.9',
  ]

  const RAM_MIN = ['512M','1G','2G','3G','4G','6G','8G']
  const RAM_MAX = ['1G','2G','3G','4G','6G','8G','10G','12G','16G']

  if (loading) return <p>Cargando...</p>

  return (
    <div className="admin-panel">
      <h2>Panel de Admin</h2>
      {error && <p className="error">{error}</p>}

      <div className="admin-tabs">
        <button
          className={tab === 'users' ? 'active' : ''}
          onClick={() => setTab('users')}
        >
          Usuarios
        </button>
        <button
          className={tab === 'modpacks' ? 'active' : ''}
          onClick={() => setTab('modpacks')}
        >
          Modpacks
        </button>
      </div>

      {tab === 'users' && (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td>{profile.id}</td>
                <td>{profile.username || 'Sin username'}</td>
                <td>
                  <span className={`role-badge ${profile.role}`}>
                    {profile.role}
                  </span>
                </td>
                <td>
                  <select
                    value={profile.role}
                    onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'modpacks' && (
        <>
          <form className="modpack-form" onSubmit={editing ? handleUpdateModpack : handleAddModpack}>
            <h3>{editing ? 'Editar Modpack' : 'Agregar Modpack'}</h3>
            <input
              type="text"
              placeholder="Nombre del modpack"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Descripcion"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="text"
              placeholder="URL de imagen (opcional)"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <div className="modpack-form-row">
              <select
                className="modpack-loader-select"
                value={form.minecraft_version}
                onChange={(e) => setForm({ ...form, minecraft_version: e.target.value })}
              >
                <option value="">Version Minecraft</option>
                {MC_VERSIONS.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Mods"
                value={form.mod_count}
                onChange={(e) => setForm({ ...form, mod_count: parseInt(e.target.value) || 0 })}
              />
            </div>
            <select
              className="modpack-loader-select"
              value={form.loader}
              onChange={(e) => setForm({ ...form, loader: e.target.value })}
            >
              <option value="forge">Forge</option>
              <option value="fabric">Fabric</option>
              <option value="quilt">Quilt</option>
              <option value="neoforge">NeoForge</option>
              <option value="vanilla">Vanilla (sin mods)</option>
            </select>
            <div className="modpack-form-row">
              <select
                className="modpack-loader-select"
                value={form.memory_min}
                onChange={(e) => setForm({ ...form, memory_min: e.target.value })}
              >
                {RAM_MIN.map(r => (
                  <option key={r} value={r}>RAM Minima: {r}</option>
                ))}
              </select>
              <select
                className="modpack-loader-select"
                value={form.memory_max}
                onChange={(e) => setForm({ ...form, memory_max: e.target.value })}
              >
                {RAM_MAX.map(r => (
                  <option key={r} value={r}>RAM Maxima: {r}</option>
                ))}
              </select>
            </div>
            <label className="folder-upload">
              <input
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={(e) => setFolder(Array.from(e.target.files))}
              />
              <span className="folder-upload-btn">
                {folder ? `${folder.length} archivos seleccionados` : 'Seleccionar carpeta del modpack'}
              </span>
            </label>
            {folder && (
              <div className="folder-preview">
                <p className="folder-name">{folder[0]?.webkitRelativePath?.split('/')[0]}</p>
                <p className="folder-count">{folder.length} archivos</p>
              </div>
            )}
            <div className="modpack-form-actions">
              <button type="submit" disabled={uploading}>
                {uploading ? uploadProgress : editing ? 'Guardar Cambios' : 'Agregar Modpack'}
              </button>
              {editing && (
                <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="modpacks-list">
            {modpacks.length === 0 && <p className="no-data">No hay modpacks aun.</p>}
            {modpacks.map((mp) => (
              <div key={mp.id} className="modpack-item">
                <div className="modpack-item-info">
                  <strong>{mp.name}</strong>
                  <span>{mp.minecraft_version} · {mp.loader || 'forge'} · {mp.mod_count} mods · RAM {mp.memory_min || '2G'}-{mp.memory_max || '4G'}</span>
                </div>
                <div className="modpack-item-actions">
                  <button className="btn-edit" onClick={() => handleEditModpack(mp)}>
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteModpack(mp.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
