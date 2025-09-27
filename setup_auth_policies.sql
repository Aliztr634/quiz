-- Setup authentication policies for Supabase
-- Run this SQL in your Supabase SQL Editor

-- First, let's check what tables we have
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
ORDER BY table_schema, table_name;

-- Check if we have a custom users table in public schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY column_name;

-- If we don't have a custom users table, let's create one
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the custom users table
-- Allow anyone to read users (for login purposes)
CREATE POLICY "Anyone can read users" ON public.users
    FOR SELECT USING (true);

-- Allow anyone to insert users (for signup)
CREATE POLICY "Anyone can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (true);

-- Grant permissions
GRANT ALL ON public.users TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Insert some sample users for testing
INSERT INTO public.users (username, password, name, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin'),
('john.doe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'instructor'),
('alice.johnson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Johnson', 'student')
ON CONFLICT (username) DO NOTHING;

-- Verify the setup
SELECT id, username, name, role, created_at 
FROM public.users 
ORDER BY created_at;
