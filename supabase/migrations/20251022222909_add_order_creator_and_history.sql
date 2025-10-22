/*
  # Add order creator and history tracking

  1. Changes to orders table
    - Add created_by column to track which user created the order
    - Links to auth.users table for authentication integration
  
  2. New Tables
    - order_history table to track all changes made to orders
      - id (uuid, primary key)
      - order_id (uuid, references orders)
      - changed_by (uuid, references auth.users)
      - field_name (text) - which field was changed
      - old_value (text) - previous value
      - new_value (text) - new value
      - changed_at (timestamp)
  
  3. Security
    - Enable RLS on order_history table
    - Add policies for authenticated users to read history
    - Add policies for authenticated users to insert history records
*/

-- Add created_by column to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE orders ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create order_history table
CREATE TABLE IF NOT EXISTS order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id),
  field_name text NOT NULL,
  old_value text,
  new_value text,
  changed_at timestamptz DEFAULT now()
);

-- Enable RLS on order_history
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all order history
CREATE POLICY "Authenticated users can read order history"
  ON order_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert order history
CREATE POLICY "Authenticated users can insert order history"
  ON order_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = changed_by);

-- Create index for faster history lookups
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_changed_at ON order_history(changed_at DESC);
