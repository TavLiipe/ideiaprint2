/*
  # Fix Mention Notifications System

  ## Overview
  This migration fixes the mention detection and notification system to properly
  identify @username mentions in chat messages and create notifications for mentioned users.

  ## Changes
  1. Replace the `create_message_notifications()` function with a corrected version that:
     - Properly extracts @mentions from messages using regex
     - Matches mentions against usernames in user_roles table (not email)
     - Creates notifications only for valid, active users
     - Avoids notifying the message sender

  ## Important Notes
  - Mentions must match exact usernames from the user_roles table
  - Only active users receive mention notifications
  - The sender of the message never receives a notification
  - Followers still receive 'new_message' notifications as before
*/

-- Drop the old function and recreate with fixes
CREATE OR REPLACE FUNCTION create_message_notifications()
RETURNS TRIGGER AS $$
DECLARE
  mention_match text;
  mentioned_username text;
  follower_record RECORD;
BEGIN
  -- Extract all @mentions from the message
  -- Loop through each @username pattern found
  FOR mention_match IN
    SELECT DISTINCT (regexp_matches(NEW.message, '@(\w+)', 'g'))[1]
  LOOP
    mentioned_username := mention_match;
    
    -- Create notification for mentioned user if they exist and are active
    INSERT INTO order_notifications (user_id, order_id, message_id, type, is_read)
    SELECT ur.user_id, NEW.order_id, NEW.id, 'mention', false
    FROM user_roles ur
    WHERE LOWER(ur.username) = LOWER(mentioned_username)
    AND ur.is_active = true
    AND ur.user_id != NEW.user_id
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Create notifications for all followers (except message sender)
  FOR follower_record IN
    SELECT user_id FROM order_followers
    WHERE order_id = NEW.order_id
    AND notifications_enabled = true
    AND user_id != NEW.user_id
  LOOP
    -- Avoid duplicate notification if user was already mentioned
    INSERT INTO order_notifications (user_id, order_id, message_id, type, is_read)
    VALUES (follower_record.user_id, NEW.order_id, NEW.id, 'new_message', false)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;