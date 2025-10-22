import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Order {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company?: string;
  service: string;
  description?: string;
  status: 'em_producao' | 'finalizado' | 'cancelado';
  delivery_date: string;
  created_at: string;
  updated_at: string;
  employee_id: string;
  created_by?: string;
  creator_email?: string;
}

interface OrderListProps {
  onSelectOrder: (order: Order) => void;
  onNewOrder: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ onSelectOrder, onNewOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.status-menu-container')) {
          setStatusMenuOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusMenuOpen]);

  const fetchOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          creator:created_by (email)
        `)
        .order('created_at', { ascending: false });

      const formattedData = data?.map(order => ({
        ...order,
        creator_email: order.creator?.email || 'Desconhecido'
      })) || [];

      setOrders(formattedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const currentStatus = order.status;
    if (currentStatus === newStatus) {
      setStatusMenuOpen(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('order_history')
          .insert({
            order_id: orderId,
            changed_by: user.id,
            field_name: 'status',
            old_value: getStatusText(currentStatus),
            new_value: getStatusText(newStatus)
          });
      }

      setStatusMenuOpen(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.client_company && order.client_company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'em_producao':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'finalizado':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_producao':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <button
          onClick={onNewOrder}
          className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Pedido
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente, email, serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos os Status</option>
              <option value="em_producao">Em Produção</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro pedido'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado por
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrega
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.client_name}</div>
                        <div className="text-sm text-gray-500">{order.client_email}</div>
                        {order.client_company && (
                          <div className="text-xs text-gray-400">{order.client_company}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.service}</div>
                      {order.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {order.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative status-menu-container">
                        <button
                          onClick={() => setStatusMenuOpen(statusMenuOpen === order.id ? null : order.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer ${getStatusColor(order.status)}`}
                          title="Clique para alterar o status"
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusText(order.status)}</span>
                        </button>
                        {statusMenuOpen === order.id && (
                          <div className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                            <button
                              onClick={() => handleStatusChange(order.id, 'em_producao')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span>Em Produção</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'finalizado')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Finalizado</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'cancelado')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span>Cancelado</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.creator_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(order.delivery_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="text-orange-600 hover:text-orange-900 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;