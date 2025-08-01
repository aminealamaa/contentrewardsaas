-- Make current user admin
-- Run this in your Supabase SQL editor

-- First, let's see what users exist
SELECT id, email, role, created_at FROM users;

-- Update your specific user to admin role
-- Replace 'your-email@example.com' with your actual email
UPDATE users 
SET role = 'admin' 
WHERE email = 'flexandflow10@gmail.com';

-- Verify the update
SELECT id, email, role, created_at FROM users WHERE email = 'flexandflow10@gmail.com';

-- Alternative: Make all existing users admin (for testing only)
-- UPDATE users SET role = 'admin'; 