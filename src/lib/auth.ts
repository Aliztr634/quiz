import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

// User interface for custom authentication
export interface User {
  id: string
  username: string
  password: string
  name: string
  role: 'admin' | 'instructor' | 'student'
  created_at: string
  updated_at: string
}

// Session interface for custom authentication
export interface Session {
  user: User
  token: string
  expires_at: string
}

// Simple token generation (in production, use JWT)
const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Session storage key
const SESSION_KEY = 'quiz_app_session'

// Get current session from localStorage
export const getCurrentSession = (): Session | null => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (!sessionData) return null
    
    const session = JSON.parse(sessionData)
    
    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Save session to localStorage
export const saveSession = (session: Session): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

// Clear session from localStorage
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY)
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// Sign in user
export const signIn = async (username: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !user) {
      return { user: null, error: 'Invalid username or password' }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return { user: null, error: 'Invalid username or password' }
    }

    // Create session
    const session: Session = {
      user: {
        id: user.id,
        username: user.username,
        password: '', // Don't store password in session
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token: generateToken(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    saveSession(session)
    return { user: session.user, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { user: null, error: 'An error occurred during sign in' }
  }
}

// Sign up user
export const signUp = async (
  username: string, 
  password: string, 
  name: string, 
  role: 'admin' | 'instructor' | 'student'
): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return { user: null, error: 'User with this username already exists' }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        username,
        password: hashedPassword,
        name,
        role
      }])
      .select()
      .single()

    if (error) {
      console.error('Sign up error:', error)
      return { user: null, error: 'Failed to create user account' }
    }

    // Create session
    const session: Session = {
      user: {
        id: user.id,
        username: user.username,
        password: '', // Don't store password in session
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token: generateToken(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    saveSession(session)
    return { user: session.user, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { user: null, error: 'An error occurred during sign up' }
  }
}

// Sign out user
export const signOut = (): void => {
  clearSession()
}

// Get current user
export const getCurrentUser = (): User | null => {
  const session = getCurrentSession()
  return session ? session.user : null
}