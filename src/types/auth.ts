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
