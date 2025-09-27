-- Update database schema to match the new User interface
-- Run this in your Supabase SQL Editor

-- First, let's check if we need to update the users table structure
-- Add new columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(255),
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Update existing users to have username and name
-- This is a migration script - adjust as needed for your data
UPDATE users 
SET 
  username = COALESCE(email, 'user_' || id::text),
  name = COALESCE(first_name || ' ' || last_name, 'User')
WHERE username IS NULL OR name IS NULL;

-- Make username unique and not null
ALTER TABLE users 
ALTER COLUMN username SET NOT NULL,
ADD CONSTRAINT unique_username UNIQUE (username);

-- Make name not null
ALTER TABLE users 
ALTER COLUMN name SET NOT NULL;

-- Optional: Drop old columns if you want to clean up
-- ALTER TABLE users DROP COLUMN IF EXISTS first_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS last_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS email;

-- Update sample data to use new structure
UPDATE users SET 
  username = 'admin',
  name = 'Admin User'
WHERE role = 'admin';

UPDATE users SET 
  username = 'john.doe',
  name = 'John Doe'
WHERE role = 'instructor' AND username LIKE '%john%';

UPDATE users SET 
  username = 'jane.smith',
  name = 'Jane Smith'
WHERE role = 'instructor' AND username LIKE '%jane%';

UPDATE users SET 
  username = 'student1',
  name = 'Alice Johnson'
WHERE role = 'student' AND username LIKE '%student1%';

UPDATE users SET 
  username = 'student2',
  name = 'Bob Wilson'
WHERE role = 'student' AND username LIKE '%student2%';
