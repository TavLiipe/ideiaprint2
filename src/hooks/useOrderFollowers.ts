import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface OrderFollower {
  id: string;
  user_id: string;
  order_id: string;
  notifications_enabled: boolean;
  created_at: string;
}

export const useOrderFollowers = (orderId: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    checkFollowStatus();
  }, [orderId]);

  const checkFollowStatus = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('order_followers')
        .select('*')
        .eq('user_id', user.id)
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;

      setIsFollowing(!!data);
      setNotificationsEnabled(data?.notifications_enabled ?? true);
    } catch (err) {
      console.error('Error checking follow status:', err);
    } finally {
      setLoading(false);
    }
  };

  const followOrder = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from('order_followers').insert({
        user_id: user.id,
        order_id: orderId,
        notifications_enabled: true,
      });

      if (error) throw error;

      setIsFollowing(true);
      setNotificationsEnabled(true);

      return true;
    } catch (err) {
      console.error('Error following order:', err);
      return false;
    }
  };

  const unfollowOrder = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('order_followers')
        .delete()
        .eq('user_id', user.id)
        .eq('order_id', orderId);

      if (error) throw error;

      setIsFollowing(false);

      return true;
    } catch (err) {
      console.error('Error unfollowing order:', err);
      return false;
    }
  };

  const toggleNotifications = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const newValue = !notificationsEnabled;

      const { error } = await supabase
        .from('order_followers')
        .update({ notifications_enabled: newValue })
        .eq('user_id', user.id)
        .eq('order_id', orderId);

      if (error) throw error;

      setNotificationsEnabled(newValue);

      return true;
    } catch (err) {
      console.error('Error toggling notifications:', err);
      return false;
    }
  };

  return {
    isFollowing,
    notificationsEnabled,
    loading,
    followOrder,
    unfollowOrder,
    toggleNotifications,
    refetch: checkFollowStatus,
  };
};
