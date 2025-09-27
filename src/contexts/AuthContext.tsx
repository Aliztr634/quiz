import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '../lib/auth'
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, getCurrentSession } from '../lib/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: any }>
  signUp: (username: string, password: string, name: string, role: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on app load
    const loadSession = async () => {
      try {
        const currentSession = getCurrentSession()
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadSession()
  }, [])

  const signIn = async (username: string, password: string) => {
    const { user: userData, error } = await authSignIn(username, password)
    if (userData) {
      setUser(userData)
      const currentSession = getCurrentSession()
      if (currentSession) {
        setSession(currentSession)
      }
    }
    return { error }
  }

  const signUp = async (username: string, password: string, name: string, role: string) => {
    const { user: userData, error } = await authSignUp(username, password, name, role as 'admin' | 'instructor' | 'student')
    if (userData) {
      setUser(userData)
      const currentSession = getCurrentSession()
      if (currentSession) {
        setSession(currentSession)
      }
    }
    return { error }
  }

  const signOut = async () => {
    authSignOut()
    setUser(null)
    setSession(null)
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
