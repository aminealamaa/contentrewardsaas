-- Complete Admin Setup Script
-- Run this in your Supabase SQL editor to fix admin access

-- Step 1: Fix RLS policies for admin access
-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Creators can manage their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Clippers can view their submissions" ON submissions;
DROP POLICY IF EXISTS "Clippers can create submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON submissions;

-- Step 2: Create new policies that allow admin access
-- Users policies
CREATE POLICY "Users can view own data or admin can view all" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can update any user" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete any user" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns or admin can view all" ON campaigns
  FOR SELECT USING (
    status = 'active' OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Creators can manage their campaigns" ON campaigns
  FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Admin can manage all campaigns" ON campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Submissions policies
CREATE POLICY "Clippers can view their submissions" ON submissions
  FOR SELECT USING (auth.uid() = clipper_id);

CREATE POLICY "Clippers can create submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = clipper_id);

CREATE POLICY "Admin can view all submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can update all submissions" ON submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete all submissions" ON submissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Storage policies for admin access
CREATE POLICY "Admin can access all storage" ON storage.objects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Step 3: Make current user admin (replace with your email)
UPDATE users 
SET role = 'admin' 
WHERE email = 'flexandflow10@gmail.com';

-- Step 4: Verify setup
SELECT 'Admin setup complete. Current users:' as message;
SELECT id, email, role, created_at FROM users;

-- Step 5: Test admin access
SELECT 'Testing admin access to submissions:' as message;
SELECT COUNT(*) as total_submissions FROM submissions;

SELECT 'Testing admin access to users:' as message;
SELECT COUNT(*) as total_users FROM users;

SELECT 'Testing admin access to campaigns:' as message;
SELECT COUNT(*) as total_campaigns FROM campaigns; 