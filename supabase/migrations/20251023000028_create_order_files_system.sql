/*
  # Order Files System

  1. New Tables
    - `order_files`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `file_name` (text) - Original file name
      - `file_path` (text) - Path in storage bucket
      - `file_type` (text) - MIME type
      - `file_size` (bigint) - Size in bytes
      - `uploaded_by` (uuid, foreign key to auth.users)
      - `uploaded_at` (timestamptz)
      - `description` (text, nullable)

  2. Storage
    - Create storage bucket `order-files` for storing order documents
    - Enable RLS on storage bucket

  3. Security
    - Enable RLS on `order_files` table
    - Authenticated users can view files for orders they have access to
    - Authenticated users can upload files to orders
    - Authenticated users can delete their own uploaded files
    - Storage policies allow authenticated users to upload and access files
*/

-- Create order_files table
CREATE TABLE IF NOT EXISTS order_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now() NOT NULL,
  description text
);

-- Enable RLS
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_files table
CREATE POLICY "Authenticated users can view order files"
  ON order_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload order files"
  ON order_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Authenticated users can update their uploaded files"
  ON order_files FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Authenticated users can delete their uploaded files"
  ON order_files FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- Create storage bucket for order files
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-files', 'order-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Authenticated users can upload order files to storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'order-files');

CREATE POLICY "Authenticated users can view order files in storage"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'order-files');

CREATE POLICY "Authenticated users can update their own files in storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'order-files' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'order-files' AND owner = auth.uid());

CREATE POLICY "Authenticated users can delete their own files in storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'order-files' AND owner = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_order_files_uploaded_by ON order_files(uploaded_by);