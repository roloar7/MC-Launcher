import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { setUsername } from '../utils/auth'
import './SetUsername.css'

export default function SetUsername() {
  const { user, setUser } = useAuth()
  const [username, setUsernameInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: err } = await setUsername(user.id, username)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setUser({ ...user, ...data })
    setLoading(false)
  }

  return (
    <div className="set-username-container">
      <form className="set-username-form" onSubmit={handleSubmit}>
        <h2>Elige tu username</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsernameInput(e.target.value)}
          required
          minLength={3}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
