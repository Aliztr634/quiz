-- Fix RLS policies for authentication
-- Run this SQL in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read users" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Create new policies that explicitly allow anon role
CREATE POLICY "Allow anon to read users" ON public.users
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow anon to insert users" ON public.users
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow users to update own data" ON public.users
    FOR UPDATE TO anon, authenticated
    USING (true);

-- Also ensure the anon role has proper permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon;

-- Test the policies
SELECT 'RLS policies updated:' as status;
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- Test a simple query
SELECT 'Testing query:' as status;
SELECT username, name, role FROM public.users LIMIT 3;
