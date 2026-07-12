import { useState, useEffect } from 'react'
import { getAllProfiles, updateRole } from '../utils/auth'
import { getModpacks, addModpack, deleteModpack } from '../utils/modpacks'
import './AdminPanel.css'

export default function AdminPanel() {
  const [profiles, setProfiles] = useState([])
  const [modpacks, setModpacks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('users')

  const [form, setForm] = useState({
    name: '',
    description: '',
    image_url: '',
    minecraft_version: '',
    mod_count: 0,
  })

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
    const { data, error } = await addModpack(form)
    if (error) {
      setError(error.message)
      return
    }
    setModpacks([data, ...modpacks])
    setForm({ name: '', description: '', image_url: '', minecraft_version: '', mod_count: 0 })
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
              <input
                type="text"
                placeholder="Version Minecraft"
                value={form.minecraft_version}
                onChange={(e) => setForm({ ...form, minecraft_version: e.target.value })}
              />
              <input
                type="number"
                placeholder="Mods"
                value={form.mod_count}
                onChange={(e) => setForm({ ...form, mod_count: parseInt(e.target.value) || 0 })}
              />
            </div>
            <button type="submit">Agregar Modpack</button>
          </form>

          <div className="modpacks-list">
            {modpacks.length === 0 && <p className="no-data">No hay modpacks aun.</p>}
            {modpacks.map((mp) => (
              <div key={mp.id} className="modpack-item">
                <div className="modpack-item-info">
                  <strong>{mp.name}</strong>
                  <span>{mp.minecraft_version} · {mp.mod_count} mods</span>
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
