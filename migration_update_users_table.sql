-- Migration script to update users table from email-based to username-based authentication
-- Run this SQL in your Supabase SQL Editor

-- First, let's check if we need to add the new columns
-- Add username column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(255);
    END IF;
END $$;

-- Add name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(200);
    END IF;
END $$;

-- Update existing records to have username and name based on email and first_name/last_name
UPDATE users 
SET 
    username = CASE 
        WHEN email = 'admin@quiz.com' THEN 'admin'
        WHEN email = 'john.doe@quiz.com' THEN 'john.doe'
        WHEN email = 'jane.smith@quiz.com' THEN 'jane.smith'
        WHEN email = 'student1@quiz.com' THEN 'alice.johnson'
        WHEN email = 'student2@quiz.com' THEN 'bob.wilson'
        ELSE split_part(email, '@', 1) -- Use part before @ as username
    END,
    name = CASE 
        WHEN email = 'admin@quiz.com' THEN 'Admin User'
        WHEN email = 'john.doe@quiz.com' THEN 'John Doe'
        WHEN email = 'jane.smith@quiz.com' THEN 'Jane Smith'
        WHEN email = 'student1@quiz.com' THEN 'Alice Johnson'
        WHEN email = 'student2@quiz.com' THEN 'Bob Wilson'
        ELSE COALESCE(first_name || ' ' || last_name, 'Unknown User')
    END
WHERE username IS NULL OR name IS NULL;

-- Make username NOT NULL and UNIQUE
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Make name NOT NULL
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- First, drop all RLS policies that depend on the email column
DROP POLICY IF EXISTS "Students can read enrolled courses" ON courses;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Anyone can read subjects" ON subjects;
DROP POLICY IF EXISTS "Instructors can read own courses" ON courses;

-- Update the index before dropping columns
DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Now drop the old columns (this should work now that dependencies are removed)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE users DROP COLUMN email;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users DROP COLUMN first_name;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users DROP COLUMN last_name;
    END IF;
END $$;

-- Recreate the RLS policies with the new username-based structure
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read subjects" ON subjects
    FOR SELECT USING (true);

CREATE POLICY "Instructors can read own courses" ON courses
    FOR SELECT USING (true);

CREATE POLICY "Students can read enrolled courses" ON courses
    FOR SELECT USING (
        id IN (
            SELECT course_id FROM enrollments 
            WHERE student_id = (SELECT id FROM users WHERE username = current_setting('request.jwt.claims', true)::json->>'username')
        )
    );

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
