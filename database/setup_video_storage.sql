-- Setup video storage bucket and policies
-- Run this in your Supabase SQL editor

-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false, -- Private bucket for security
  104857600, -- 100MB file size limit
  ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/mkv']
) ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload videos
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow authenticated users to view videos (for download)
CREATE POLICY "Allow authenticated downloads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow creators to update their own videos
CREATE POLICY "Allow creators to update videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow creators to delete their own videos
CREATE POLICY "Allow creators to delete videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
  ); 