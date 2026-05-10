import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './services/auth-context'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import './App.css'

const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  return isAuthenticated ? element : <Navigate to="/login" />
}

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/analysis/:analysisId" element={<ProtectedRoute element={<Analysis />} />} />
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
