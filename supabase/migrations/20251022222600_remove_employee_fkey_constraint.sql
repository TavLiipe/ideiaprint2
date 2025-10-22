/*
  # Remove employee foreign key constraint from orders

  1. Changes
    - Drop the foreign key constraint on orders.employee_id
    - This allows orders to be created without requiring an existing employee record
    - The employee_id column remains in the table but is no longer enforced

  2. Security
    - No changes to RLS policies
*/

-- Drop the foreign key constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_employee_id_fkey;
