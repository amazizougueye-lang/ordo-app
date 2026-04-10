import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Today from './pages/Today'
import CaseDetail from './pages/CaseDetail'
import Upload from './pages/Upload'
import Profil from './pages/Profil'
import Calendar from './pages/Calendar'
import Stats from './pages/Stats'
import Confidentialite from './pages/legal/Confidentialite'
import Conditions from './pages/legal/Conditions'
import Rgpd from './pages/legal/Rgpd'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ color: '#94A3B8', fontSize: 13 }}>
      Chargement…
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/today" element={<ProtectedRoute><Today /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
      <Route path="/dossier/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
      <Route path="/confidentialite" element={<Confidentialite />} />
      <Route path="/conditions" element={<Conditions />} />
      <Route path="/rgpd" element={<Rgpd />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  )
}
