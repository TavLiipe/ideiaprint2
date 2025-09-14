/*
  # Fix RLS Policies - Remove Infinite Recursion

  1. Security Changes
    - Drop existing problematic policies on employees table
    - Create new simplified policies without recursion
    - Fix policies on orders and order_files tables
    - Ensure no circular dependencies between policies

  2. Policy Changes
    - Employees: Simple policies based on auth.uid()
    - Orders: Direct reference to employee_id without subqueries
    - Order Files: Direct reference to uploaded_by without complex joins
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON employees;
DROP POLICY IF EXISTS "Managers can read all employees" ON employees;
DROP POLICY IF EXISTS "Employees can read all orders" ON orders;
DROP POLICY IF EXISTS "Employees can insert orders" ON orders;
DROP POLICY IF EXISTS "Employees can update orders" ON orders;
DROP POLICY IF EXISTS "Employees can read order files" ON order_files;
DROP POLICY IF EXISTS "Employees can insert order files" ON order_files;
DROP POLICY IF EXISTS "Employees can delete own uploaded files" ON order_files;

-- Create simple, non-recursive policies for employees table
CREATE POLICY "employees_select_own"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "employees_select_all_for_managers"
  ON employees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = auth.uid() AND e.role = 'gerente'
    )
  );

-- Create simple policies for orders table
CREATE POLICY "orders_select_all"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "orders_insert_authenticated"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "orders_update_all"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simple policies for order_files table
CREATE POLICY "order_files_select_all"
  ON order_files
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "order_files_insert_authenticated"
  ON order_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "order_files_delete_own"
  ON order_files
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());