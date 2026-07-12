import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { signIn } from '../utils/auth'
import steve from '../assets/steve.webp'
import './Login.css'

const isElectron = !!window.electronAPI

export default function Login() {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: err } = await signIn(email, password)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setUser({ ...data.user, ...data.profile })
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-hero">
        <img src={steve} alt="Steve" className="login-logo" />
        <h1>MC-Launcher</h1>
        <p className="login-subtitle">Tu launcher de Minecraft</p>
        {!isElectron && (
          <a href="/release/MC-Launcher Setup.exe" download className="download-btn">
            Descargar Aplicacion
          </a>
        )}
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesion</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
