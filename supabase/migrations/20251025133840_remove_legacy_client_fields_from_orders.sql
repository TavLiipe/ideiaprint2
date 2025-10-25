/*
  # Remove legacy client fields from orders table

  ## Changes
  
  1. Schema Updates
    - Remove NOT NULL constraint from `client_name`, `client_email`, `client_phone` columns
    - These fields are now deprecated in favor of the `client_id` foreign key
    - The data is now accessed via the `clients` table relationship
  
  2. Data Integrity
    - Existing data is preserved
    - New orders will use `client_id` instead of direct client fields
  
  ## Notes
  - The `orders_with_creator` view already uses the new client relationship
  - This migration makes the orders table schema consistent with the new design
*/

-- Make legacy client fields nullable since we're using client_id now
ALTER TABLE orders 
  ALTER COLUMN client_name DROP NOT NULL,
  ALTER COLUMN client_email DROP NOT NULL,
  ALTER COLUMN client_phone DROP NOT NULL;

-- Add a comment to mark these as deprecated
COMMENT ON COLUMN orders.client_name IS 'DEPRECATED: Use client_id and join with clients table instead';
COMMENT ON COLUMN orders.client_email IS 'DEPRECATED: Use client_id and join with clients table instead';
COMMENT ON COLUMN orders.client_phone IS 'DEPRECATED: Use client_id and join with clients table instead';
COMMENT ON COLUMN orders.client_company IS 'DEPRECATED: Use client_id and join with clients table instead';
