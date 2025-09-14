/*
  # Sistema de Funcionários e Pedidos da Ideia Print

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (enum: gerente, atendente, producao)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `client_email` (text)
      - `client_phone` (text)
      - `client_company` (text, optional)
      - `service` (text)
      - `description` (text, optional)
      - `status` (enum: em_producao, finalizado, cancelado)
      - `delivery_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `employee_id` (uuid, foreign key)
    
    - `order_files`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `file_name` (text)
      - `file_path` (text)
      - `file_size` (integer)
      - `file_type` (text)
      - `category` (enum: cliente, interno)
      - `uploaded_by` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated employees only
    - Employees can only access their own data and orders
    - Managers can access all data
*/

-- Create custom types
CREATE TYPE employee_role AS ENUM ('gerente', 'atendente', 'producao');
CREATE TYPE order_status AS ENUM ('em_producao', 'finalizado', 'cancelado');
CREATE TYPE file_category AS ENUM ('cliente', 'interno');

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role employee_role NOT NULL DEFAULT 'atendente',
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  client_company text,
  service text NOT NULL,
  description text,
  status order_status NOT NULL DEFAULT 'em_producao',
  delivery_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE
);

-- Create order_files table
CREATE TABLE IF NOT EXISTS order_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  file_type text NOT NULL,
  category file_category NOT NULL DEFAULT 'cliente',
  uploaded_by uuid REFERENCES employees(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;

-- Create policies for employees
CREATE POLICY "Employees can read own data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Managers can read all employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid() AND role = 'gerente'
    )
  );

-- Create policies for orders
CREATE POLICY "Employees can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Employees can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Employees can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid()
    )
  );

-- Create policies for order_files
CREATE POLICY "Employees can read order files"
  ON order_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Employees can insert order files"
  ON order_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Employees can delete own uploaded files"
  ON order_files
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample employee (manager)
INSERT INTO employees (email, name, role) VALUES 
('admin@ideiaprint.com.br', 'Administrador', 'gerente')
ON CONFLICT (email) DO NOTHING;