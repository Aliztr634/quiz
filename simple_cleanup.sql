-- Simple cleanup script for users table
-- Run this SQL in your Supabase SQL Editor

-- First, let's see what columns actually exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('id', 'username', 'name', 'password', 'role', 'email', 'first_name', 'last_name', 'created_at', 'updated_at')
ORDER BY column_name;

-- Check current data
SELECT id, username, name, role, created_at 
FROM users 
LIMIT 5;

-- If username or name are NULL or empty, set default values
UPDATE users 
SET 
    username = COALESCE(NULLIF(username, ''), 'user_' || id::text),
    name = COALESCE(NULLIF(name, ''), 'User')
WHERE username IS NULL OR name IS NULL OR username = '' OR name = '';

-- Try to drop first_name if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users DROP COLUMN first_name;
        RAISE NOTICE 'Dropped first_name column';
    ELSE
        RAISE NOTICE 'first_name column does not exist';
    END IF;
END $$;

-- Try to drop last_name if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users DROP COLUMN last_name;
        RAISE NOTICE 'Dropped last_name column';
    ELSE
        RAISE NOTICE 'last_name column does not exist';
    END IF;
END $$;

-- Final verification
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('id', 'username', 'name', 'password', 'role', 'created_at', 'updated_at')
ORDER BY column_name;

-- Show final data
SELECT id, username, name, role, created_at 
FROM users 
LIMIT 5;
