/*
  # Create storage bucket for order files

  1. Storage
    - Create bucket for order files
    - Set up RLS policies for file access
    - Configure file upload permissions

  2. Security
    - Only authenticated employees can upload files
    - Files are associated with orders
    - Proper access control for file downloads
*/

-- Create storage bucket for order files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('order-files', 'order-files', false);

-- Allow authenticated users to upload files
CREATE POLICY "Employees can upload order files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-files');

-- Allow authenticated users to view files
CREATE POLICY "Employees can view order files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'order-files');

-- Allow authenticated users to delete files they uploaded
CREATE POLICY "Employees can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'order-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update file metadata
CREATE POLICY "Employees can update order files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'order-files');