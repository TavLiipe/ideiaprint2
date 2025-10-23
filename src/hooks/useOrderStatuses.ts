import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface OrderStatus {
  id: string;
  name: string;
  color: string;
  order_index: number;
  is_active: boolean;
}

export const useOrderStatuses = () => {
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('order_statuses')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (!error && data) {
        setStatuses(data);
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusById = (id: string): OrderStatus | undefined => {
    return statuses.find(s => s.id === id);
  };

  const getStatusColor = (statusId: string): string => {
    const status = getStatusById(statusId);
    return status?.color || '#6B7280';
  };

  const getStatusName = (statusId: string): string => {
    const status = getStatusById(statusId);
    return status?.name || 'Desconhecido';
  };

  return {
    statuses,
    loading,
    getStatusById,
    getStatusColor,
    getStatusName,
    refetch: fetchStatuses
  };
};
