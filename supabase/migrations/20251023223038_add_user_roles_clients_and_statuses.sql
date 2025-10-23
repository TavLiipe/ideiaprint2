/*
  # Add User Roles, Client Management, and Custom Order Statuses

  ## Overview
  This migration adds a complete role-based access control system with ADMIN and EMPLOYEE roles,
  client management functionality, and customizable order status system.

  ## 1. New Tables

  ### `user_roles` table
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key to auth.users) - Reference to authenticated user
  - `role` (text) - User role: 'ADMIN' or 'EMPLOYEE'
  - `username` (text, unique) - Username for login
  - `password_hash` (text) - Hashed password
  - `full_name` (text) - User's full name
  - `is_active` (boolean) - Whether user account is active
  - `created_at` (timestamptz) - Creation timestamp
  - `created_by` (uuid) - User who created this account

  ### `clients` table
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, not null) - Client name
  - `email` (text) - Client email
  - `phone` (text) - Client phone
  - `address` (text) - Client address
  - `notes` (text) - Additional notes
  - `is_active` (boolean) - Whether client is active
  - `created_at` (timestamptz) - Creation timestamp
  - `created_by` (uuid) - User who created this client

  ### `order_statuses` table
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, unique, not null) - Status name
  - `color` (text, not null) - Hex color code
  - `order_index` (integer) - Display order
  - `is_active` (boolean) - Whether status is active
  - `created_at` (timestamptz) - Creation timestamp
  - `created_by` (uuid) - User who created this status

  ## 2. Changes to Existing Tables

  ### `orders` table modifications
  - Add `client_id` (uuid, foreign key to clients) - Reference to client
  - Modify `employee_id` to be nullable
  - Add `status_id` (uuid, foreign key to order_statuses) - Reference to custom status

  ## 3. Security
  - Enable RLS on all new tables
  - ADMIN users can manage users, clients, and statuses
  - EMPLOYEE users can view clients and statuses
  - All authenticated users can view their own user role information

  ## 4. Important Notes
  - First user created should be set as ADMIN manually
  - Default order statuses will be created for backward compatibility
  - Client data replaces the old client_name text field in orders
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own role info"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can insert user roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can update user roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can delete user roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active clients"
  ON clients FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

-- Create order_statuses table
CREATE TABLE IF NOT EXISTS order_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE order_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active statuses"
  ON order_statuses FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all statuses"
  ON order_statuses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can insert statuses"
  ON order_statuses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can update statuses"
  ON order_statuses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can delete statuses"
  ON order_statuses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN' AND ur.is_active = true
    )
  );

-- Insert default order statuses
INSERT INTO order_statuses (name, color, order_index) VALUES
  ('Novo', '#3B82F6', 1),
  ('Em Andamento', '#F59E0B', 2),
  ('Aguardando Aprovação', '#8B5CF6', 3),
  ('Concluído', '#10B981', 4),
  ('Cancelado', '#EF4444', 5)
ON CONFLICT (name) DO NOTHING;

-- Add new columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN client_id uuid REFERENCES clients(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN status_id uuid REFERENCES order_statuses(id);
  END IF;
END $$;

-- Make employee_id nullable if not already
ALTER TABLE orders ALTER COLUMN employee_id DROP NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_username ON user_roles(username);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_id ON orders(status_id);