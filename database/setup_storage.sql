-- Setup Storage Bucket for Screenshots
-- Run this in your Supabase SQL Editor

-- Create the screenshots bucket if it doesn't exist
-- Note: This needs to be done in the Supabase Dashboard under Storage
-- Go to Storage > New Bucket > Name: screenshots > Public > Create

-- Storage policies for the screenshots bucket
-- Run these after creating the bucket in the dashboard

-- Allow authenticated users to upload screenshots
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND auth.role() = 'authenticated');

-- Allow public access to screenshots
CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');

-- Allow users to update their own uploads
CREATE POLICY "Allow users to update own uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
CREATE POLICY "Allow users to delete own uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]); 