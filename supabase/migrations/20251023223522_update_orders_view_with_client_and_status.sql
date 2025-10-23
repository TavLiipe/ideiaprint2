/*
  # Update orders view to include client and status information

  ## Overview
  Updates the orders_with_creator view to include client information and custom order status.

  ## Changes
  1. Update orders_with_creator view
    - Add client information (name, email, phone, address)
    - Add order status information (name, color)
    - Maintain backward compatibility with existing code

  ## Important Notes
  - This view replaces the old client_name, client_email, client_phone fields with client data from the clients table
  - The status field will show the status name instead of the old enum values
  - This enables the frontend to use the new client and status management system
*/

-- Drop the existing view
DROP VIEW IF EXISTS orders_with_creator;

-- Create updated view that includes client and status information
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
  c.name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  c.address as client_company,
  s.name as status,
  s.color as status_color,
  u.email as creator_email
FROM orders o
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN order_statuses s ON o.status_id = s.id
LEFT JOIN auth.users u ON o.created_by = u.id;
