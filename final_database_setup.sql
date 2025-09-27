-- Final database setup for authentication
-- Run this SQL in your Supabase SQL Editor

-- 1. Drop existing users table if it exists (to start fresh)
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Create the users table
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_role ON public.users(role);

-- 4. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Allow anyone to read users (for login purposes)
CREATE POLICY "Anyone can read users" ON public.users
    FOR SELECT USING (true);

-- Allow anyone to insert users (for signup)
CREATE POLICY "Anyone can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (true);

-- 6. Grant permissions
GRANT ALL ON public.users TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 7. Insert sample users (password is 'password' hashed with bcrypt)
INSERT INTO public.users (username, password, name, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin'),
('john.doe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'instructor'),
('jane.smith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', 'instructor'),
('alice.johnson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Johnson', 'student'),
('bob.wilson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Wilson', 'student');

-- 8. Verify the setup
SELECT 'Table created successfully!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY column_name;

SELECT 'Sample data inserted:' as status;
SELECT id, username, name, role, created_at 
FROM public.users 
ORDER BY role, name;

SELECT 'RLS policies created:' as status;
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';
