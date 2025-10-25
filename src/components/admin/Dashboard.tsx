import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  FileText,
  Plus,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  totalOrders: number;
  statusCounts: Record<string, { count: number; name: string; color: string }>;
  totalFiles: number;
  storageUsed: number;
}

interface OrderStatus {
  id: string;
  name: string;
  color: string;
  order_index: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    statusCounts: {},
    totalFiles: 0,
    storageUsed: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);

  useEffect(() => {
    fetchStatuses();
    fetchDashboardData();
  }, []);

  const fetchStatuses = async () => {
    const { data } = await supabase
      .from('order_statuses')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (data) {
      setStatuses(data);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      let orders: any[] = [];
      try {
        const { data: ordersData } = await supabase
          .from('orders_with_creator')
          .select('*')
          .order('created_at', { ascending: false });

        orders = ordersData || [];
      } catch (err) {
        console.warn('Orders fetch failed:', err);
      }

      // Calculate stats from orders
      const totalOrders = orders.length;

      // Count orders by status
      const statusCounts: Record<string, { count: number; name: string; color: string }> = {};
      orders.forEach(order => {
        if (order.status_id) {
          if (!statusCounts[order.status_id]) {
            statusCounts[order.status_id] = {
              count: 0,
              name: order.status || 'Desconhecido',
              color: order.status_color || '#6B7280'
            };
          }
          statusCounts[order.status_id].count++;
        }
      });

      // Fetch files
      let files: any[] = [];
      try {
        const { data: filesData } = await supabase
          .from('order_files')
          .select('file_size');

        files = filesData || [];
      } catch (err) {
        console.warn('Files fetch failed:', err);
      }

      const totalFiles = files.length;
      const storageUsed = files.reduce((acc, file) => acc + (file.file_size || 0), 0);

      setStats({
        totalOrders,
        statusCounts,
        totalFiles,
        storageUsed
      });

      // Set recent orders (limit to first 5)
      setRecentOrders(orders.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusStyle = (color: string) => {
    const bgColor = color + '20';
    return {
      backgroundColor: bgColor,
      color: color
    };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bem-vindo ao Painel!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Aqui está um resumo das atividades da Ideia Print
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Pedidos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {Object.entries(stats.statusCounts).slice(0, 2).map(([statusId, statusInfo]) => (
          <div key={statusId} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{statusInfo.name}</p>
                <p className="text-3xl font-bold" style={{ color: statusInfo.color }}>{statusInfo.count}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: statusInfo.color + '20' }}>
                <Package className="w-6 h-6" style={{ color: statusInfo.color }} />
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Arquivos</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">{stats.totalFiles}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(stats.storageUsed)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pedidos Recentes</h2>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhum pedido encontrado</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Os pedidos aparecerão aqui quando forem criados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id || index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{order.client_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.service}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Data não disponível'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={getStatusStyle(order.status_color || '#6B7280')}
                    >
                      {order.status || 'Sem Status'}
                    </span>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Entrega: {order.delivery_date ? format(new Date(order.delivery_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;