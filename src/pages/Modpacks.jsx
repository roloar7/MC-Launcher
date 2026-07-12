import { useState, useEffect } from 'react'
import { getModpacks } from '../utils/modpacks'
import './Modpacks.css'

export default function Modpacks() {
  const [modpacks, setModpacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getModpacks().then(({ data }) => {
      if (data) setModpacks(data)
      setLoading(false)
    })
  }, [])

  const gradients = [
    'linear-gradient(135deg, #646cff, #3b82f6)',
    'linear-gradient(135deg, #51cf66, #20c997)',
    'linear-gradient(135deg, #ff6b6b, #f06595)',
    'linear-gradient(135deg, #ffd43b, #ff922b)',
    'linear-gradient(135deg, #cc5de8, #845ef7)',
  ]

  if (loading) return <p className="modpacks-loading">Cargando modpacks...</p>

  return (
    <div className="modpacks-container">
      <h2>Modpacks</h2>
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
                {mp.mod_count} mods{mp.minecraft_version && ` · Minecraft ${mp.minecraft_version}`}
              </span>
            </div>
            <button className="modpack-install">Instalar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
