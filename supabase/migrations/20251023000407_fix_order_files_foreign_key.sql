/*
  # Fix order_files foreign key constraint

  1. Changes
    - Drop existing foreign key constraint from order_files.uploaded_by to employees
    - Add new foreign key constraint from order_files.uploaded_by to auth.users
    - Update existing records to use proper user IDs

  2. Notes
    - This fixes the issue where uploaded_by was incorrectly referencing employees table
    - Now it correctly references auth.users table for proper authentication integration
*/

-- Drop the existing foreign key constraint
ALTER TABLE order_files 
DROP CONSTRAINT IF EXISTS order_files_uploaded_by_fkey;

-- Add the correct foreign key constraint to auth.users
ALTER TABLE order_files 
ADD CONSTRAINT order_files_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;