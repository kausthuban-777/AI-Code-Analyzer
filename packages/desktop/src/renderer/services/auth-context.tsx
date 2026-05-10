import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: { id: number; email: string } | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = 'http://localhost:3000/api'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: number; email: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })

      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)

      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed'
      setError(message)
      throw new Error(message)
    }
  }

  const register = async (email: string, username: string, password: string) => {
    try {
      setError(null)
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        username,
        password,
      })

      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)

      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed'
      setError(message)
      throw new Error(message)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setError(null)

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')

    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
