import { useState } from 'react'
import './Servidor.css'

export default function Servidor() {
  const [status, setStatus] = useState('offline')
  const [logs, setLogs] = useState([])
  const [updating, setUpdating] = useState(false)

  function addLog(message) {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message }])
  }

  function handleStart() {
    setStatus('starting')
    addLog('Iniciando servidor...')
    setTimeout(() => {
      setStatus('online')
      addLog('Servidor encendido correctamente.')
    }, 2000)
  }

  function handleStop() {
    setStatus('stopping')
    addLog('Apagando servidor...')
    setTimeout(() => {
      setStatus('offline')
      addLog('Servidor apagado.')
    }, 2000)
  }

  function handleRestart() {
    setStatus('stopping')
    addLog('Reiniciando servidor...')
    setTimeout(() => {
      setStatus('starting')
      addLog('Servidor detenido. Iniciando...')
      setTimeout(() => {
        setStatus('online')
        addLog('Servidor reiniciado correctamente.')
      }, 2000)
    }, 2000)
  }

  function handleUpdate() {
    setUpdating(true)
    addLog('Buscando actualizaciones...')
    setTimeout(() => {
      addLog('Descargando actualizacion...')
      setTimeout(() => {
        addLog('Actualizacion completada.')
        setUpdating(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="servidor-container">
      <h2>Gestionar Servidor</h2>

      <div className="servidor-status">
        <span className={`status-dot ${status}`}></span>
        <span className="status-text">
          {status === 'online' && 'En linea'}
          {status === 'offline' && 'Apagado'}
          {status === 'starting' && 'Iniciando...'}
          {status === 'stopping' && 'Apagando...'}
        </span>
      </div>

      <div className="servidor-actions">
        {status === 'offline' ? (
          <button className="btn-start" onClick={handleStart} disabled={updating}>
            Encender
          </button>
        ) : status === 'online' ? (
          <>
            <button className="btn-stop" onClick={handleStop} disabled={updating}>
              Apagar
            </button>
            <button className="btn-restart" onClick={handleRestart} disabled={updating}>
              Reiniciar
            </button>
          </>
        ) : (
          <button className="btn-loading" disabled>
            {status === 'starting' ? 'Encendiendo...' : 'Apagando...'}
          </button>
        )}
        <button className="btn-update" onClick={handleUpdate} disabled={status !== 'offline' || updating}>
          {updating ? 'Actualizando...' : 'Actualizar Servidor'}
        </button>
      </div>

      <div className="servidor-logs">
        <h3>Logs</h3>
        <div className="logs-content">
          {logs.length === 0 && <p className="no-logs">Sin actividad aun.</p>}
          {logs.map((log, i) => (
            <div key={i} className="log-entry">
              <span className="log-time">[{log.time}]</span> {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
