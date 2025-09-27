-- Cleanup script to remove old columns from users table
-- Run this SQL in your Supabase SQL Editor

-- First, let's check what table we're working with
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'users';

-- Check if this is the auth.users table or a custom users table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('first_name', 'last_name', 'email')
ORDER BY column_name;

-- Check if email column exists before trying to use it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'email') THEN
        -- Email column exists, update based on email
        UPDATE users 
        SET 
            username = CASE 
                WHEN username IS NULL OR username = '' THEN
                    CASE 
                        WHEN email = 'admin@quiz.com' THEN 'admin'
                        WHEN email = 'john.doe@quiz.com' THEN 'john.doe'
                        WHEN email = 'jane.smith@quiz.com' THEN 'jane.smith'
                        WHEN email = 'student1@quiz.com' THEN 'alice.johnson'
                        WHEN email = 'student2@quiz.com' THEN 'bob.wilson'
                        ELSE split_part(email, '@', 1)
                    END
                ELSE username
            END,
            name = CASE 
                WHEN name IS NULL OR name = '' THEN
                    CASE 
                        WHEN email = 'admin@quiz.com' THEN 'Admin User'
                        WHEN email = 'john.doe@quiz.com' THEN 'John Doe'
                        WHEN email = 'jane.smith@quiz.com' THEN 'Jane Smith'
                        WHEN email = 'student1@quiz.com' THEN 'Alice Johnson'
                        WHEN email = 'student2@quiz.com' THEN 'Bob Wilson'
                        ELSE COALESCE(first_name || ' ' || last_name, 'Unknown User')
                    END
                ELSE name
            END
        WHERE username IS NULL OR name IS NULL OR username = '' OR name = '';
        RAISE NOTICE 'Updated users based on email column';
    ELSE
        -- Email column doesn't exist, update based on first_name/last_name if they exist
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'first_name') THEN
            UPDATE users 
            SET 
                username = CASE 
                    WHEN username IS NULL OR username = '' THEN 'user_' || id::text
                    ELSE username
                END,
                name = CASE 
                    WHEN name IS NULL OR name = '' THEN COALESCE(first_name || ' ' || last_name, 'Unknown User')
                    ELSE name
                END
            WHERE username IS NULL OR name IS NULL OR username = '' OR name = '';
            RAISE NOTICE 'Updated users based on first_name/last_name columns';
        ELSE
            -- No old columns exist, just set defaults for empty values
            UPDATE users 
            SET 
                username = CASE 
                    WHEN username IS NULL OR username = '' THEN 'user_' || id::text
                    ELSE username
                END,
                name = CASE 
                    WHEN name IS NULL OR name = '' THEN 'User'
                    ELSE name
                END
            WHERE username IS NULL OR name IS NULL OR username = '' OR name = '';
            RAISE NOTICE 'Updated users with default values';
        END IF;
    END IF;
END $$;

-- Now let's try to drop the old columns if they exist and are not part of Supabase Auth
-- We'll do this carefully to avoid breaking the auth system

-- Check if first_name and last_name exist and are not part of the auth system
DO $$ 
BEGIN
    -- Only drop if these columns exist and we're not in the auth schema
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' 
               AND column_name = 'first_name'
               AND table_schema = 'public') THEN
        ALTER TABLE users DROP COLUMN first_name;
        RAISE NOTICE 'Dropped first_name column';
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' 
               AND column_name = 'last_name'
               AND table_schema = 'public') THEN
        ALTER TABLE users DROP COLUMN last_name;
        RAISE NOTICE 'Dropped last_name column';
    END IF;
END $$;

-- For email, we need to be more careful since it might be part of the auth system
-- Let's check if we can safely drop it
DO $$ 
BEGIN
    -- Only drop email if it's not the primary auth email column
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' 
               AND column_name = 'email'
               AND table_schema = 'public'
               AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'users' 
                              AND column_name = 'encrypted_password')) THEN
        ALTER TABLE users DROP COLUMN email;
        RAISE NOTICE 'Dropped email column';
    ELSE
        RAISE NOTICE 'Email column is part of auth system, keeping it';
    END IF;
END $$;

-- Verify the final structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('id', 'username', 'name', 'password', 'role', 'created_at', 'updated_at')
ORDER BY column_name;

-- Show sample data
SELECT id, username, name, role, created_at 
FROM users 
WHERE username IS NOT NULL 
LIMIT 5;
