import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getModpacks, getModpackFiles, getModpackFileUrl } from '../utils/modpacks'
import './Modpacks.css'

const isElectron = !!window.electronAPI

export default function Modpacks() {
  const { user } = useAuth()
  const [modpacks, setModpacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState(null)
  const [installStatus, setInstallStatus] = useState('')
  const [installed, setInstalled] = useState({})
  const [needsUpdate, setNeedsUpdate] = useState({})
  const [launching, setLaunching] = useState(null)

  const gradients = [
    'linear-gradient(135deg, #646cff, #3b82f6)',
    'linear-gradient(135deg, #51cf66, #20c997)',
    'linear-gradient(135deg, #ff6b6b, #f06595)',
    'linear-gradient(135deg, #ffd43b, #ff922b)',
    'linear-gradient(135deg, #cc5de8, #845ef7)',
  ]

  useEffect(() => {
    getModpacks().then(({ data }) => {
      if (data) setModpacks(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!isElectron) return
    modpacks.forEach(async (mp) => {
      const status = await window.electronAPI.getModpackStatus(mp.id)
      setInstalled(prev => ({ ...prev, [mp.id]: status.installed }))
      if (status.installed) {
        if (status.fileHash) {
          const { data: files } = await getModpackFiles(mp.id)
          if (files && files.length > 0) {
            const currentHash = files.map(f => f.path).sort().join('|')
            setNeedsUpdate(prev => ({ ...prev, [mp.id]: status.fileHash !== currentHash }))
          } else {
            setNeedsUpdate(prev => ({ ...prev, [mp.id]: true }))
          }
        } else {
          setNeedsUpdate(prev => ({ ...prev, [mp.id]: false }))
        }
      }
    })
  }, [modpacks])

  async function handleInstall(mp) {
    if (!isElectron) {
      setInstallStatus('Descarga disponible solo en la aplicacion de escritorio.')
      return
    }

    setInstalling(mp.id)
    setInstallStatus(`Instalando ${mp.name}...`)

    const { data: files, error } = await getModpackFiles(mp.id)

    if (!error && files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = file.path.replace(`${mp.id}/`, '')
        setInstallStatus(`Descargando ${i + 1}/${files.length}: ${fileName}`)

        const url = getModpackFileUrl(mp.id, fileName)
        const response = await fetch(url)
        const blob = await response.blob()
        const buffer = await blob.arrayBuffer()

        await window.electronAPI.installModpackFile(mp.id, fileName, Array.from(new Uint8Array(buffer)))
      }
    }

    const fileHash = files ? files.map(f => f.path).sort().join('|') : null
    await window.electronAPI.markModpackInstalled(mp.id, mp.updated_at, fileHash)

    setInstallStatus(`${mp.name} instalado. Haz clic en Jugar para descargar Minecraft y jugar.`)
    setInstalled(prev => ({ ...prev, [mp.id]: true }))
    setNeedsUpdate(prev => ({ ...prev, [mp.id]: false }))
    setTimeout(() => {
      setInstalling(null)
      setInstallStatus('')
    }, 3000)
  }

  async function handleUninstall(mp) {
    if (!isElectron) return
    if (!confirm(`¿Eliminar ${mp.name} y todos sus archivos?`)) return

    setInstallStatus(`Desinstalando ${mp.name}...`)
    await window.electronAPI.uninstallModpack(mp.id)
    setInstalled(prev => ({ ...prev, [mp.id]: false }))
    setInstallStatus(`${mp.name} desinstalado.`)
    setTimeout(() => setInstallStatus(''), 2000)
  }

  async function handlePlay(mp) {
    if (!isElectron) return

    setLaunching(mp.id)
    setInstallStatus(`Descargando Minecraft ${mp.minecraft_version} y ${mp.loader}...`)

    window.electronAPI.onMcLog((log) => {
      console.log('[MC]', log)
      setInstallStatus(log.substring(0, 120))
    })

    window.electronAPI.onMcProgress((progress) => {
      if (progress.type === 'download' && progress.data) {
        const d = progress.data
        if (d.type === 'bytes') {
          setInstallStatus(`Descargando MC: ${((d.current / d.total) * 100).toFixed(0)}%`)
        } else if (d.type === 'json') {
          setInstallStatus(`Descargando: ${d.name || 'assets'}...`)
        } else if (d.type === 'library') {
          setInstallStatus(`Descargando librerias...`)
        }
      }
    })

    window.electronAPI.onMcClosed(() => {
      setLaunching(null)
      setInstallStatus('')
    })

    const result = await window.electronAPI.launchMinecraft(
      mp.id,
      mp.minecraft_version,
      mp.loader,
      user?.username || user?.email || 'Player',
      mp.memory_min || '2G',
      mp.memory_max || '4G'
    )

    if (result.error) {
      setInstallStatus(`Error: ${result.error}`)
      setLaunching(null)
      setTimeout(() => setInstallStatus(''), 5000)
    }
  }

  if (loading) return <p className="modpacks-loading">Cargando modpacks...</p>

  return (
    <div className="modpacks-container">
      <h2>Modpacks</h2>
      {installStatus && (
        <div className="install-banner">{installStatus}</div>
      )}
      {modpacks.length === 0 && <p className="modpacks-empty">No hay modpacks disponibles.</p>}
      <div className="modpacks-grid">
        {modpacks.map((mp, i) => (
          <div className="modpack-card" key={mp.id}>
            <div
              className="modpack-banner"
              style={{ background: mp.image_url ? `url(${mp.image_url}) center/cover` : gradients[i % gradients.length] }}
            >
              {!mp.image_url && mp.name}
            </div>
            <div className="modpack-info">
              <h3>{mp.name}</h3>
              {mp.description && <p>{mp.description}</p>}
              <span className="modpack-meta">
                {mp.loader && <span className="modpack-loader-tag">{mp.loader}</span>}
                {' '}{mp.mod_count} mods{mp.minecraft_version && ` · MC ${mp.minecraft_version}`}
              </span>
            </div>
            <div className="modpack-actions">
              {installed[mp.id] ? (
                <>
                  {needsUpdate[mp.id] ? (
                    <button
                      className="modpack-update"
                      onClick={() => handleInstall(mp)}
                      disabled={installing !== null || launching !== null}
                    >
                      {installing === mp.id ? 'Actualizando...' : 'Actualizar'}
                    </button>
                  ) : (
                    <button
                      className="modpack-play"
                      onClick={() => handlePlay(mp)}
                      disabled={launching !== null}
                    >
                      {launching === mp.id ? 'Iniciando...' : 'Jugar'}
                    </button>
                  )}
                  <button
                    className="modpack-uninstall"
                    onClick={() => handleUninstall(mp)}
                    disabled={launching !== null}
                  >
                    Desinstalar
                  </button>
                </>
              ) : (
                <button
                  className="modpack-install"
                  onClick={() => handleInstall(mp)}
                  disabled={installing !== null}
                >
                  {installing === mp.id ? 'Instalando...' : 'Instalar'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
