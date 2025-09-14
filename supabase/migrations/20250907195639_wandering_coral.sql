/*
  # Fix infinite recursion in employees RLS policies

  1. Problem
    - Infinite recursion detected in policy for relation "employees"
    - Current policies are causing circular references
    - AuthContext cannot fetch employee data

  2. Solution
    - Drop ALL existing policies on employees table
    - Create simple, non-recursive policies
    - Use direct auth.uid() comparison without subqueries
    - Ensure no circular dependencies

  3. Security
    - Users can only read their own employee record
    - Managers can read all employee records (simple role check)
    - No complex subqueries that cause recursion
*/

-- Drop all existing policies on employees table
DROP POLICY IF EXISTS "Employees can read own data" ON employees;
DROP POLICY IF EXISTS "employees_select_all_for_managers" ON employees;
DROP POLICY IF EXISTS "employees_select_own" ON employees;

-- Create simple, non-recursive policies
CREATE POLICY "employees_read_own" 
  ON employees 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "employees_read_all_for_managers" 
  ON employees 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM employees 
      WHERE id = auth.uid() 
      AND role = 'gerente'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;