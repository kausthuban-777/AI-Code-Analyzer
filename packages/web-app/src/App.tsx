import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './services/auth-context'
import Login from './pages/Login'
import Register from './pages/Register'
import Analyzer from './pages/Analyzer'
import Results from './pages/Results'
import './App.css'

const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>
  }

  return isAuthenticated ? element : <Navigate to="/login" />
}

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<ProtectedRoute element={<Analyzer />} />} />
      <Route path="/results/:analysisId" element={<ProtectedRoute element={<Results />} />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
