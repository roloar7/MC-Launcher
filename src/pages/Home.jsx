import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../utils/auth'
import { getSetting } from '../utils/settings'
import AdminPanel from './AdminPanel'
import Modpacks from './Modpacks'
import Servidor from './Servidor'
import steve from '../assets/steve.webp'
import './Home.css'

const isElectron = !!window.electronAPI

export default function Home() {
  const { user, setUser } = useAuth()
  const [page, setPage] = useState('home')
  const [downloadUrl, setDownloadUrl] = useState('')

  useEffect(() => {
    getSetting('download_url').then(url => {
      if (url) setDownloadUrl(url)
    })
  }, [])

  async function handleSignOut() {
    await signOut()
    setUser(null)
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className='username-avatar-box'>
          <img src={steve} alt="Steve" className="header-avatar" />
          <span>{user.username}</span>
        </div>
        <nav className="home-nav">
          <button
            className={page === 'home' ? 'active' : ''}
            onClick={() => setPage('home')}
          >
            Inicio
          </button>
          <button
            className={page === 'modpacks' ? 'active' : ''}
            onClick={() => setPage('modpacks')}
          >
            Modpacks
          </button>
          <button
            className={page === 'servidor' ? 'active' : ''}
            onClick={() => setPage('servidor')}
          >
            Servidor
          </button>
          {user?.role === 'admin' && (
            <button
              className={page === 'admin' ? 'active' : ''}
              onClick={() => setPage('admin')}
            >
              Admin Panel
            </button>
          )}
          <button onClick={handleSignOut}>Cerrar Sesion</button>
        </nav>
      </header>
      <main className="home-content">
        {page === 'home' && (
          <>
            <p>Bienvenido, <strong>{user?.username || user?.email}</strong></p>
            <p>Rol: <strong>{user?.role}</strong></p>
            {!isElectron && downloadUrl && (
              <a href={downloadUrl} download className="download-btn-home">
                Descargar Launcher
              </a>
            )}
          </>
        )}
        {page === 'modpacks' && <Modpacks />}
        {page === 'servidor' && <Servidor />}
        {page === 'admin' && user?.role === 'admin' && <AdminPanel />}
        <p className='working' >Working... </p>
      </main>
    </div>
  )
}
