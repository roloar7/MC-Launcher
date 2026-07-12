import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import SetUsername from './pages/SetUsername'
import Home from './pages/Home'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading">Cargando...</div>
  if (!user) return <Login />
  if (!user.username) return <SetUsername />

  return <Home />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
