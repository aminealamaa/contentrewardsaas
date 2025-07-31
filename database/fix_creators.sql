-- Fix for campaigns with missing creator records
-- Run this in your Supabase SQL Editor

-- First, let's see if there are any campaigns without valid creator records
SELECT 
  c.id as campaign_id,
  c.title,
  c.creator_id,
  u.email as creator_email
FROM campaigns c
LEFT JOIN users u ON c.creator_id = u.id
WHERE u.id IS NULL;

-- If there are campaigns without creators, we need to either:
-- 1. Delete them if they're test data
-- 2. Update them with a valid creator_id

-- Option 1: Delete campaigns without valid creators (uncomment if you want to do this)
-- DELETE FROM campaigns 
-- WHERE creator_id NOT IN (SELECT id FROM users);

-- Option 2: Update campaigns to use a default creator (uncomment and modify if needed)
-- UPDATE campaigns 
-- SET creator_id = (SELECT id FROM users WHERE role = 'creator' LIMIT 1)
-- WHERE creator_id NOT IN (SELECT id FROM users);

-- Verify the fix
SELECT 
  c.id as campaign_id,
  c.title,
  c.creator_id,
  u.email as creator_email
FROM campaigns c
LEFT JOIN users u ON c.creator_id = u.id
WHERE c.status = 'active'; 