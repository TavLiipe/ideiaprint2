/*
  # Create authenticate_user function
  
  1. New Functions
    - `authenticate_user(p_username, p_password)` - Validates username and password against user_roles table
    - Returns user data if credentials are valid, null otherwise
    
  2. Security
    - Function uses pgcrypto to compare hashed passwords securely
    - Only returns data for active users
*/

-- Create function to authenticate users
CREATE OR REPLACE FUNCTION authenticate_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  role TEXT,
  is_valid BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.user_id,
    ur.username,
    ur.full_name,
    ur.role,
    (ur.password_hash = crypt(p_password, ur.password_hash)) as is_valid
  FROM user_roles ur
  WHERE ur.username = p_username
    AND ur.is_active = true
    AND ur.password_hash = crypt(p_password, ur.password_hash);
END;
$$;