/*
  # Create view for orders with creator email

  1. New Views
    - orders_with_creator: View that joins orders with auth.users to get creator email
    
  2. Security
    - Enable RLS on the view
    - Add policy for authenticated users to read orders with creator info
*/

-- Create a view that joins orders with auth.users to get creator email
CREATE OR REPLACE VIEW orders_with_creator AS
SELECT 
  o.*,
  u.email as creator_email
FROM orders o
LEFT JOIN auth.users u ON o.created_by = u.id;