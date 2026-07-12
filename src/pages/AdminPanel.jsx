import { useState, useEffect } from 'react'
import { getAllProfiles, updateRole } from '../utils/auth'
import './AdminPanel.css'

export default function AdminPanel() {
  const [profiles, setProfiles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    const { data, error } = await getAllProfiles()
    if (error) {
      setError(error.message)
    } else {
      setProfiles(data)
    }
    setLoading(false)
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

  if (loading) return <p>Cargando usuarios...</p>

  return (
    <div className="admin-panel">
      <h2>Panel de Admin</h2>
      {error && <p className="error">{error}</p>}
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
    </div>
  )
}
