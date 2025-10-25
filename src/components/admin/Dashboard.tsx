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
  inProduction: number;
  completed: number;
  cancelled: number;
  totalFiles: number;
  storageUsed: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    inProduction: 0,
    completed: 0,
    cancelled: 0,
    totalFiles: 0,
    storageUsed: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      let orders: any[] = [];
      try {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('status, created_at, client_name, service, delivery_date');

        orders = ordersData || [];
      } catch (err) {
        console.warn('Orders fetch failed:', err);
      }

      // Calculate stats from orders
      const totalOrders = orders.length;
      const inProduction = orders.filter(o => o.status === 'em_producao').length;
      const completed = orders.filter(o => o.status === 'finalizado').length;
      const cancelled = orders.filter(o => o.status === 'cancelado').length;

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
        inProduction,
        completed,
        cancelled,
        totalFiles,
        storageUsed
      });

      // Set recent orders (limit to first 5)
      setRecentOrders(orders.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_producao':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_producao':
        return 'Em Produção';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
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

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Em Produção</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{stats.inProduction}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Finalizados</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
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

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors duration-200">
            <Plus className="w-6 h-6 mb-2" />
            <div className="font-semibold">Novo Pedido</div>
            <div className="text-sm opacity-90">Criar um novo pedido</div>
          </button>
          <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors duration-200">
            <Package className="w-6 h-6 mb-2" />
            <div className="font-semibold">Ver Pedidos</div>
            <div className="text-sm opacity-90">Gerenciar pedidos existentes</div>
          </button>
          <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors duration-200">
            <BarChart3 className="w-6 h-6 mb-2" />
            <div className="font-semibold">Relatórios</div>
            <div className="text-sm opacity-90">Ver estatísticas detalhadas</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;