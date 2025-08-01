-- Create admin user for testing
-- Run this in your Supabase SQL editor

-- Insert admin user (replace with your actual email)
INSERT INTO users (id, email, role) 
VALUES (
  gen_random_uuid(),
  'admin@contentrewards.com',
  'admin'
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- You can also update an existing user to be admin
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com'; 