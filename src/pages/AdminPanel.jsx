import { useState, useEffect } from 'react'
import { getAllProfiles, updateRole } from '../utils/auth'
import { getModpacks, addModpack, deleteModpack, uploadModpackFiles } from '../utils/modpacks'
import './AdminPanel.css'

export default function AdminPanel() {
  const [profiles, setProfiles] = useState([])
  const [modpacks, setModpacks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('users')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    image_url: '',
    minecraft_version: '',
    mod_count: 0,
    loader: 'forge',
    memory_min: '2G',
    memory_max: '4G',
  })
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
    setForm({ name: '', description: '', image_url: '', minecraft_version: '', mod_count: 0, loader: 'forge', memory_min: '2G', memory_max: '4G' })
    setFolder(null)
  }

  async function handleDeleteModpack(id) {
    const { error } = await deleteModpack(id)
    if (error) {
      setError(error.message)
      return
    }
    setModpacks(modpacks.filter(m => m.id !== id))
  }

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
          <form className="modpack-form" onSubmit={handleAddModpack}>
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
                <option value="1.21.5">1.21.5</option>
                <option value="1.21.4">1.21.4</option>
                <option value="1.21.3">1.21.3</option>
                <option value="1.21.2">1.21.2</option>
                <option value="1.21.1">1.21.1</option>
                <option value="1.21">1.21</option>
                <option value="1.20.6">1.20.6</option>
                <option value="1.20.4">1.20.4</option>
                <option value="1.20.3">1.20.3</option>
                <option value="1.20.2">1.20.2</option>
                <option value="1.20.1">1.20.1</option>
                <option value="1.20">1.20</option>
                <option value="1.19.4">1.19.4</option>
                <option value="1.19.3">1.19.3</option>
                <option value="1.19.2">1.19.2</option>
                <option value="1.18.2">1.18.2</option>
                <option value="1.17.1">1.17.1</option>
                <option value="1.16.5">1.16.5</option>
                <option value="1.16.4">1.16.4</option>
                <option value="1.16.3">1.16.3</option>
                <option value="1.15.2">1.15.2</option>
                <option value="1.14.4">1.14.4</option>
                <option value="1.12.2">1.12.2</option>
                <option value="1.10.2">1.10.2</option>
                <option value="1.8.9">1.8.9</option>
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
                <option value="512M">RAM Minima: 512M</option>
                <option value="1G">RAM Minima: 1G</option>
                <option value="2G">RAM Minima: 2G</option>
                <option value="3G">RAM Minima: 3G</option>
                <option value="4G">RAM Minima: 4G</option>
                <option value="6G">RAM Minima: 6G</option>
                <option value="8G">RAM Minima: 8G</option>
              </select>
              <select
                className="modpack-loader-select"
                value={form.memory_max}
                onChange={(e) => setForm({ ...form, memory_max: e.target.value })}
              >
                <option value="1G">RAM Maxima: 1G</option>
                <option value="2G">RAM Maxima: 2G</option>
                <option value="3G">RAM Maxima: 3G</option>
                <option value="4G">RAM Maxima: 4G</option>
                <option value="6G">RAM Maxima: 6G</option>
                <option value="8G">RAM Maxima: 8G</option>
                <option value="10G">RAM Maxima: 10G</option>
                <option value="12G">RAM Maxima: 12G</option>
                <option value="16G">RAM Maxima: 16G</option>
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
            <button type="submit" disabled={uploading}>
              {uploading ? uploadProgress : 'Agregar Modpack'}
            </button>
          </form>

          <div className="modpacks-list">
            {modpacks.length === 0 && <p className="no-data">No hay modpacks aun.</p>}
            {modpacks.map((mp) => (
              <div key={mp.id} className="modpack-item">
                <div className="modpack-item-info">
                  <strong>{mp.name}</strong>
                  <span>{mp.minecraft_version} · {mp.loader || 'forge'} · {mp.mod_count} mods · RAM {mp.memory_min || '2G'}-{mp.memory_max || '4G'}</span>
                </div>
                <button className="btn-delete" onClick={() => handleDeleteModpack(mp.id)}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
