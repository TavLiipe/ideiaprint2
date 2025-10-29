/*
  # Add creator full name to orders view

  ## Overview
  Updates the orders_with_creator view to include the full name of the user who created the order.

  ## Changes
  1. Update orders_with_creator view
    - Add creator_name field from user_roles table
    - Keep creator_email for backward compatibility
    - Join with user_roles to get the full_name

  ## Important Notes
  - This allows the frontend to display the creator's full name instead of just email
  - Maintains backward compatibility with existing creator_email field
*/

-- Drop the existing view
DROP VIEW IF EXISTS orders_with_creator;

-- Create updated view that includes creator full name
CREATE OR REPLACE VIEW orders_with_creator AS
SELECT 
  o.id,
  o.service,
  o.description,
  o.delivery_date,
  o.created_at,
  o.updated_at,
  o.employee_id,
  o.created_by,
  o.client_id,
  o.status_id,
  o.service_order_status,
  c.name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  c.address as client_company,
  s.name as status,
  s.color as status_color,
  u.email as creator_email,
  ur.full_name as creator_name
FROM orders o
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN order_statuses s ON o.status_id = s.id
LEFT JOIN auth.users u ON o.created_by = u.id
LEFT JOIN user_roles ur ON o.created_by = ur.user_id;