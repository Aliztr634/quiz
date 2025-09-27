// Environment variable validation
export const env = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
}

// Validate environment variables
if (!env.VITE_SUPABASE_URL) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Log environment status (only in development)
if (import.meta.env.DEV) {
  console.log('Environment variables loaded:', {
    supabaseUrl: env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    supabaseKey: env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'
  })
}
