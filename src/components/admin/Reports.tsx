import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Package,
  Users,
  Clock,
  CheckCircle,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportData {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  cancelledOrders: number;
  totalClients: number;
  averageOrdersPerClient: number;
  monthlyOrders: { month: string; orders: number }[];
  serviceBreakdown: { service: string; count: number }[];
  clientRanking: { client: string; orders: number }[];
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalOrders: 0,
    completedOrders: 0,
    inProgressOrders: 0,
    cancelledOrders: 0,
    totalClients: 0,
    averageOrdersPerClient: 0,
    monthlyOrders: [],
    serviceBreakdown: [],
    clientRanking: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch orders within date range
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      if (!orders) {
        setLoading(false);
        return;
      }

      // Calculate basic stats
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'finalizado').length;
      const inProgressOrders = orders.filter(o => o.status === 'em_producao').length;
      const cancelledOrders = orders.filter(o => o.status === 'cancelado').length;

      // Calculate unique clients
      const uniqueClients = new Set(orders.map(o => o.client_email));
      const totalClients = uniqueClients.size;
      const averageOrdersPerClient = totalClients > 0 ? totalOrders / totalClients : 0;

      // Monthly orders breakdown
      const monthlyMap = new Map();
      orders.forEach(order => {
        const month = format(parseISO(order.created_at), 'MMM yyyy', { locale: ptBR });
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
      });
      const monthlyOrders = Array.from(monthlyMap.entries()).map(([month, orders]) => ({
        month,
        orders: orders as number
      }));

      // Service breakdown
      const serviceMap = new Map();
      orders.forEach(order => {
        serviceMap.set(order.service, (serviceMap.get(order.service) || 0) + 1);
      });
      const serviceBreakdown = Array.from(serviceMap.entries())
        .map(([service, count]) => ({ service, count: count as number }))
        .sort((a, b) => b.count - a.count);

      // Client ranking
      const clientMap = new Map();
      orders.forEach(order => {
        const client = order.client_name;
        clientMap.set(client, (clientMap.get(client) || 0) + 1);
      });
      const clientRanking = Array.from(clientMap.entries())
        .map(([client, orders]) => ({ client, orders: orders as number }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 10);

      setReportData({
        totalOrders,
        completedOrders,
        inProgressOrders,
        cancelledOrders,
        totalClients,
        averageOrdersPerClient,
        monthlyOrders,
        serviceBreakdown,
        clientRanking
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ['Relatório de Pedidos - Ideia Print'],
      ['Período:', `${dateRange.start} a ${dateRange.end}`],
      [''],
      ['Resumo Geral'],
      ['Total de Pedidos', reportData.totalOrders],
      ['Pedidos Finalizados', reportData.completedOrders],
      ['Pedidos em Produção', reportData.inProgressOrders],
      ['Pedidos Cancelados', reportData.cancelledOrders],
      ['Total de Clientes', reportData.totalClients],
      ['Média de Pedidos por Cliente', reportData.averageOrdersPerClient.toFixed(2)],
      [''],
      ['Pedidos por Mês'],
      ...reportData.monthlyOrders.map(item => [item.month, item.orders]),
      [''],
      ['Serviços Mais Solicitados'],
      ...reportData.serviceBreakdown.map(item => [item.service, item.count]),
      [''],
      ['Top 10 Clientes'],
      ...reportData.clientRanking.map(item => [item.client, item.orders])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completionRate = reportData.totalOrders > 0 
    ? (reportData.completedOrders / reportData.totalOrders * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análise de desempenho e estatísticas</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={exportReport}
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Carregando relatórios...</span>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="text-3xl font-bold text-gray-900">{reportData.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                  <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                  <p className="text-3xl font-bold text-purple-600">{reportData.totalClients}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média por Cliente</p>
                  <p className="text-3xl font-bold text-orange-600">{reportData.averageOrdersPerClient.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Finalizados</h3>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{reportData.completedOrders}</p>
              <p className="text-sm text-gray-500 mt-1">
                {reportData.totalOrders > 0 ? ((reportData.completedOrders / reportData.totalOrders) * 100).toFixed(1) : 0}% do total
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Em Produção</h3>
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">{reportData.inProgressOrders}</p>
              <p className="text-sm text-gray-500 mt-1">
                {reportData.totalOrders > 0 ? ((reportData.inProgressOrders / reportData.totalOrders) * 100).toFixed(1) : 0}% do total
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cancelados</h3>
                <Package className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">{reportData.cancelledOrders}</p>
              <p className="text-sm text-gray-500 mt-1">
                {reportData.totalOrders > 0 ? ((reportData.cancelledOrders / reportData.totalOrders) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Orders */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
                Pedidos por Mês
              </h3>
              <div className="space-y-4">
                {reportData.monthlyOrders.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-20">{item.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.max((item.orders / Math.max(...reportData.monthlyOrders.map(m => m.orders))) * 100, 5)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.orders}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-500" />
                Serviços Mais Solicitados
              </h3>
              <div className="space-y-4">
                {reportData.serviceBreakdown.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex-1 truncate">{item.service}</span>
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.max((item.count / Math.max(...reportData.serviceBreakdown.map(s => s.count))) * 100, 10)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Top 10 Clientes
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedidos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participação
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.clientRanking.map((client, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.client}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.orders}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {((client.orders / reportData.totalOrders) * 100).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;