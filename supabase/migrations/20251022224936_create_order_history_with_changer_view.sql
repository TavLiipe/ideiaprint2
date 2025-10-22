/*
  # Create view for order history with changer email

  1. New Views
    - order_history_with_changer: View that joins order_history with auth.users to get changer email
*/

-- Create a view that joins order_history with auth.users to get changer email
CREATE OR REPLACE VIEW order_history_with_changer AS
SELECT 
  h.*,
  u.email as changer_email
FROM order_history h
LEFT JOIN auth.users u ON h.changed_by = u.id;