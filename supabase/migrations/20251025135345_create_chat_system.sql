/*
  # Create Chat System for Orders

  1. New Tables
    - `order_messages`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `user_id` (uuid, foreign key to auth.users)
      - `user_name` (text, cached user name)
      - `user_email` (text, cached user email)
      - `message` (text, message content)
      - `created_at` (timestamptz, message timestamp)
      - `updated_at` (timestamptz, for edits)
      - `is_edited` (boolean, track if edited)
    
    - `message_attachments`
      - `id` (uuid, primary key)
      - `message_id` (uuid, foreign key to order_messages)
      - `file_name` (text, original file name)
      - `file_path` (text, storage path)
      - `file_size` (bigint, file size in bytes)
      - `file_type` (text, MIME type)
      - `created_at` (timestamptz)
    
    - `order_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `order_id` (uuid, foreign key to orders)
      - `message_id` (uuid, foreign key to order_messages)
      - `type` (text, notification type: 'mention', 'new_message')
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz)
    
    - `order_followers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `order_id` (uuid, foreign key to orders)
      - `notifications_enabled` (boolean, default true)
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, order_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their orders' messages
    - Policies to create messages if user has access to order
    - Policies for notifications and followers management

  3. Important Notes
    - Messages are stored with cached user info for performance
    - Attachments reference message and are stored in Supabase Storage
    - Notifications system tracks mentions and new messages
    - Followers system allows users to follow orders and control notifications
*/

-- Create order_messages table
CREATE TABLE IF NOT EXISTS order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  user_email text NOT NULL DEFAULT '',
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_edited boolean DEFAULT false
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES order_messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text NOT NULL DEFAULT 'application/octet-stream',
  created_at timestamptz DEFAULT now()
);

-- Create order_notifications table
CREATE TABLE IF NOT EXISTS order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  message_id uuid REFERENCES order_messages(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('mention', 'new_message')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create order_followers table
CREATE TABLE IF NOT EXISTS order_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, order_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_created_at ON order_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_user_id ON order_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_is_read ON order_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_order_followers_user_id ON order_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_order_followers_order_id ON order_followers(order_id);

-- Enable RLS
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_messages
CREATE POLICY "Authenticated users can view messages from orders they have access to"
  ON order_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Authenticated users can create messages for orders they have access to"
  ON order_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'employee')
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages"
  ON order_messages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON order_messages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for message_attachments
CREATE POLICY "Authenticated users can view attachments from messages they can see"
  ON message_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_messages
      JOIN user_roles ON user_roles.user_id = auth.uid()
      WHERE order_messages.id = message_attachments.message_id
      AND user_roles.role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Authenticated users can create attachments for their messages"
  ON message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM order_messages
      WHERE order_messages.id = message_attachments.message_id
      AND order_messages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments from their own messages"
  ON message_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_messages
      WHERE order_messages.id = message_attachments.message_id
      AND order_messages.user_id = auth.uid()
    )
  );

-- RLS Policies for order_notifications
CREATE POLICY "Users can view their own notifications"
  ON order_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications for users"
  ON order_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON order_notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON order_notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for order_followers
CREATE POLICY "Authenticated users can view followers for orders they have access to"
  ON order_followers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Authenticated users can follow orders they have access to"
  ON order_followers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'employee')
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own follower settings"
  ON order_followers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unfollow orders"
  ON order_followers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to automatically follow order when user sends first message
CREATE OR REPLACE FUNCTION auto_follow_order_on_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_followers (user_id, order_id, notifications_enabled)
  VALUES (NEW.user_id, NEW.order_id, true)
  ON CONFLICT (user_id, order_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-follow order on first message
DROP TRIGGER IF EXISTS trigger_auto_follow_order ON order_messages;
CREATE TRIGGER trigger_auto_follow_order
  AFTER INSERT ON order_messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_follow_order_on_message();

-- Function to create notifications for mentions and followers
CREATE OR REPLACE FUNCTION create_message_notifications()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_users text[];
  mentioned_user text;
  follower_record RECORD;
BEGIN
  -- Extract @mentions from message (simple regex pattern)
  mentioned_users := regexp_matches(NEW.message, '@(\w+)', 'g');
  
  -- Create notification for each mentioned user (if they exist and have access)
  IF mentioned_users IS NOT NULL THEN
    FOREACH mentioned_user IN ARRAY mentioned_users
    LOOP
      INSERT INTO order_notifications (user_id, order_id, message_id, type, is_read)
      SELECT u.id, NEW.order_id, NEW.id, 'mention', false
      FROM auth.users u
      JOIN user_roles ur ON ur.user_id = u.id
      WHERE u.email LIKE mentioned_user || '%'
      AND ur.role IN ('admin', 'employee')
      AND u.id != NEW.user_id
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  
  -- Create notifications for all followers (except message sender)
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

-- Trigger to create notifications on new message
DROP TRIGGER IF EXISTS trigger_create_message_notifications ON order_messages;
CREATE TRIGGER trigger_create_message_notifications
  AFTER INSERT ON order_messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notifications();