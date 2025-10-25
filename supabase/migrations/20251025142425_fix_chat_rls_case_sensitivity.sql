/*
  # Fix Chat RLS Case Sensitivity
  
  1. Changes
    - Update RLS policies for order_messages to use case-insensitive role comparison
    - Update RLS policies for message_attachments to use case-insensitive role comparison
    - Update RLS policies for order_followers to use case-insensitive role comparison
  
  2. Security
    - Maintains same security level but handles both uppercase and lowercase roles
    - Ensures users with 'ADMIN', 'admin', 'EMPLOYEE', or 'employee' roles can access chat
*/

-- Drop existing policies for order_messages
DROP POLICY IF EXISTS "Authenticated users can view messages from orders they have access to" ON order_messages;
DROP POLICY IF EXISTS "Authenticated users can create messages for orders they have access to" ON order_messages;

-- Recreate policies with case-insensitive role check
CREATE POLICY "Authenticated users can view messages from orders they have access to"
  ON order_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND UPPER(user_roles.role) IN ('ADMIN', 'EMPLOYEE')
    )
  );

CREATE POLICY "Authenticated users can create messages for orders they have access to"
  ON order_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND UPPER(user_roles.role) IN ('ADMIN', 'EMPLOYEE')
    )
    AND user_id = auth.uid()
  );

-- Drop and recreate policies for message_attachments
DROP POLICY IF EXISTS "Authenticated users can view attachments from messages they can see" ON message_attachments;

CREATE POLICY "Authenticated users can view attachments from messages they can see"
  ON message_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_messages
      JOIN user_roles ON user_roles.user_id = auth.uid()
      WHERE order_messages.id = message_attachments.message_id
      AND UPPER(user_roles.role) IN ('ADMIN', 'EMPLOYEE')
    )
  );

-- Drop and recreate policies for order_followers
DROP POLICY IF EXISTS "Authenticated users can view followers for orders they have access to" ON order_followers;
DROP POLICY IF EXISTS "Authenticated users can follow orders they have access to" ON order_followers;

CREATE POLICY "Authenticated users can view followers for orders they have access to"
  ON order_followers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND UPPER(user_roles.role) IN ('ADMIN', 'EMPLOYEE')
    )
  );

CREATE POLICY "Authenticated users can follow orders they have access to"
  ON order_followers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND UPPER(user_roles.role) IN ('ADMIN', 'EMPLOYEE')
    )
    AND user_id = auth.uid()
  );

-- Update the notification function to use case-insensitive role check
CREATE OR REPLACE FUNCTION create_message_notifications()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_users text[];
  mentioned_user text;
  follower_record RECORD;
BEGIN
  mentioned_users := regexp_matches(NEW.message, '@(\w+)', 'g');
  
  IF mentioned_users IS NOT NULL THEN
    FOREACH mentioned_user IN ARRAY mentioned_users
    LOOP
      INSERT INTO order_notifications (user_id, order_id, message_id, type, is_read)
      SELECT u.id, NEW.order_id, NEW.id, 'mention', false
      FROM auth.users u
      JOIN user_roles ur ON ur.user_id = u.id
      WHERE u.email LIKE mentioned_user || '%'
      AND UPPER(ur.role) IN ('ADMIN', 'EMPLOYEE')
      AND u.id != NEW.user_id
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  
  FOR follower_record IN
    SELECT user_id FROM order_followers
    WHERE order_id = NEW.order_id
    AND notifications_enabled = true
    AND user_id != NEW.user_id
  LOOP
    INSERT INTO order_notifications (user_id, order_id, message_id, type, is_read)
    VALUES (follower_record.user_id, NEW.order_id, NEW.id, 'new_message', false)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;