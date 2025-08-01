-- Migration: Add original_video_path column to campaigns table
-- Run this in your Supabase SQL editor if you have an existing database

-- Add the new column (nullable for existing records)
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS original_video_path TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN campaigns.original_video_path IS 'Path to original video file in Supabase Storage bucket';

-- Create an index for better performance when querying by original_video_path
CREATE INDEX IF NOT EXISTS idx_campaigns_original_video_path ON campaigns(original_video_path) WHERE original_video_path IS NOT NULL; 