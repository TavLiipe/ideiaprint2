import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Clock, CheckCircle, XCircle, Package, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  client_name: string;
  client_email: string;
  client_company?: string;
  service: string;
  description?: string;
  status: string;
  status_id: string | null;
  service_order_status?: string;
  delivery_date: string;
  created_at: string;
  creator_email: string;
}

interface OrderStatus {
  id: string;
  name: string;
  color: string;
  order_index: number;
  is_active: boolean;
}

interface OrderListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onNewOrder: () => void;
  onRefresh: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onSelectOrder, onEditOrder, onNewOrder, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);
  const [availableStatuses, setAvailableStatuses] = useState<OrderStatus[]>([]);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    const { data } = await supabase
      .from('order_statuses')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (data) {
      setAvailableStatuses(data);
    }
  };

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatusId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status_id: newStatusId })
        .eq('id', orderId);

      if (error) throw error;

      setStatusMenuOpen(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.client_company && order.client_company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status_id === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getOrderStatus = (order: Order): OrderStatus | undefined => {
    if (order.status_id) {
      return availableStatuses.find(s => s.id === order.status_id);
    }
    return undefined;
  };

  const getStatusStyle = (status: OrderStatus | undefined) => {
    if (!status) return { backgroundColor: '#E5E7EB', color: '#374151' };

    const bgColor = status.color + '20';
    return {
      backgroundColor: bgColor,
      color: status.color,
      borderColor: status.color
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Pedidos</h1>
        <button
          onClick={onNewOrder}
          className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Pedido
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente, email, serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos os Status</option>
              {availableStatuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro pedido'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate" style={{ borderSpacing: '0 8px' }}>
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    OS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Criado por
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entrega
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {filteredOrders.map((order, index) => (
                  <tr
  key={order.id}
  className="border-2 border-orange-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-sm font-bold text-orange-500">
                        #{String(index + 1).padStart(3, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.client_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.client_email}</div>
                        {order.client_company && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">{order.client_company}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{order.service}</div>
                      {order.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {order.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="relative status-menu-container">
                        <button
                          onClick={() => setStatusMenuOpen(statusMenuOpen === order.id ? null : order.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer border"
                          style={getStatusStyle(getOrderStatus(order))}
                          title="Clique para alterar o status"
                        >
                          <span>{getOrderStatus(order)?.name || 'Sem Status'}</span>
                        </button>
                        {statusMenuOpen === order.id && (
                          <div className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1">
                            {availableStatuses.map(status => (
                              <button
                                key={status.id}
                                onClick={() => handleStatusChange(order.id, status.id)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center space-x-2"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: status.color }}
                                />
                                <span>{status.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                        order.service_order_status === 'registrada'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300 dark:border-green-700'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
                      }`}>
                        {order.service_order_status === 'registrada' ? 'Registrada' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {order.creator_email}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
  Data: {format(new Date(order.delivery_date), 'dd/MM/yyyy', { locale: ptBR })} | 
  Hora: {format(new Date(order.delivery_date), 'HH:mm', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditOrder(order)}
                          className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          title="Editar pedido"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
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
