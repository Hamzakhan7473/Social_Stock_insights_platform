'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as apiLogin, signup as apiSignup, getCurrentUser } from '../lib/api'

interface User {
  id: number
  username: string
  email: string
  full_name?: string
  bio?: string
  reputation_score: number
  is_verified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (userData: SignupData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

interface SignupData {
  username: string
  email: string
  password: string
  full_name?: string
  bio?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem('auth_token')
    if (token) {
      validateToken()
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await apiLogin(username, password)
    localStorage.setItem('auth_token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
  }

  const signup = async (userData: SignupData) => {
    const response = await apiSignup(userData)
    localStorage.setItem('auth_token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

