/*
  # Create Storage Bucket for Chat Attachments

  1. Storage Setup
    - Create 'chat-attachments' bucket for message files
    - Set size limit to 10MB per file
    - Allow common file types (images, PDFs, documents)
  
  2. Security
    - Enable RLS on storage bucket
    - Allow authenticated users to upload files
    - Allow authenticated users to view files from orders they have access to
    - Allow users to delete their own uploaded files

  3. Important Notes
    - Files are organized by order_id/message_id/filename
    - Only employees and admins can upload/view files
*/

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage.objects (chat-attachments bucket)

-- Policy: Authenticated users with access can view files
CREATE POLICY "Authenticated users can view chat attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'employee')
    )
  );

-- Policy: Authenticated users with access can upload files
CREATE POLICY "Authenticated users can upload chat attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'employee')
    )
  );

-- Policy: Users can update their own uploaded files
CREATE POLICY "Users can update their own chat attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND owner = auth.uid()
  );

-- Policy: Users can delete their own uploaded files
CREATE POLICY "Users can delete their own chat attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND owner = auth.uid()
  );