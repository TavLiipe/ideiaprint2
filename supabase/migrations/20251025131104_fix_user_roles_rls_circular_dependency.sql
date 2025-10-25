/*
  # Fix User Roles RLS Circular Dependency

  ## Problem
  The existing RLS policies on `user_roles` table create a circular dependency:
  - To check if a user is ADMIN, we query `user_roles`
  - But the SELECT policy on `user_roles` itself checks if the user is ADMIN
  - This creates an infinite loop (error 42P17)

  ## Solution
  Replace the circular policies with simpler ones:
  1. Allow all authenticated users to SELECT their own role (by user_id)
  2. Allow all authenticated users to SELECT all roles (needed for admin checks)
  3. For INSERT/UPDATE/DELETE, use security definer functions or simpler checks

  ## Changes
  - Drop all existing policies on `user_roles`
  - Create new non-circular policies
  - Authenticated users can view all user roles
  - Only users with ADMIN role can INSERT/UPDATE/DELETE
*/

-- Drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can view own role info" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON user_roles;

-- Allow authenticated users to view all user roles
-- This is necessary to check if someone is an admin without circular dependency
CREATE POLICY "Authenticated users can view all user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'ADMIN'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only admins can insert new user roles
CREATE POLICY "Only admins can insert user roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Only admins can update user roles
CREATE POLICY "Only admins can update user roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Only admins can delete user roles
CREATE POLICY "Only admins can delete user roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (is_admin());
