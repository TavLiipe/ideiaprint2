import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Save,
  X,
  User,
  Package,
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';

interface OrderFormProps {
  onClose: () => void;
  onSave: () => void;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
}

interface OrderStatus {
  id: string;
  name: string;
  color: string;
  order_index: number;
}

const OrderForm: React.FC<OrderFormProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    client_search: '',
    service: '',
    description: '',
    delivery_date: '',
    delivery_time: '',
    status_id: ''
  });

  useEffect(() => {
    fetchClients();
    fetchStatuses();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (data) {
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const { data } = await supabase
        .from('order_statuses')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (data) {
        setStatuses(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, status_id: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'client_search') {
      setShowClientSuggestions(value.length > 0);
      setSelectedClientId(null);
    }
  };

  const handleClientSelect = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      client_search: client.name
    }));
    setSelectedClientId(client.id);
    setShowClientSuggestions(false);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(formData.client_search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Erro: Usuário não está logado. Faça login para continuar.');
      return;
    }

    try {
      const deliveryDateTime = formData.delivery_time
        ? `${formData.delivery_date}T${formData.delivery_time}:00`
        : formData.delivery_date;

      if (!selectedClientId) {
        setError('Por favor, selecione um cliente da lista');
        return;
      }

      if (!formData.status_id) {
        setError('Por favor, selecione um status');
        return;
      }

      const { error: insertError } = await supabase
        .from('orders')
        .insert([{
          client_id: selectedClientId,
          service: formData.service,
          description: formData.description,
          delivery_date: deliveryDateTime,
          employee_id: user.id,
          created_by: user.id,
          status_id: formData.status_id
        }]);

      if (insertError) throw insertError;

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(`Erro ao criar pedido: ${error.message || 'Tente novamente.'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-500" />
              Cliente
            </h3>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cliente *
              </label>
              <input
                type="text"
                name="client_search"
                required
                value={formData.client_search}
                onChange={handleChange}
                onFocus={() => setShowClientSuggestions(formData.client_search.length > 0)}
                onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Digite o nome do cliente"
              />
              {showClientSuggestions && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {client.email && `${client.email}`}
                        {client.email && client.phone && ' • '}
                        {client.phone && client.phone}
                      </div>
                      {client.address && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">{client.address}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-500" />
              Informações do Serviço
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Serviço *
                  </label>
                  <input
                    type="text"
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ex: Cartões de Visita, Banner, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    name="status_id"
                    required
                    value={formData.status_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Entrega *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      type="date"
                      name="delivery_date"
                      required
                      value={formData.delivery_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hora de Entrega
    </label>
    <div className="relative">
      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
      <select
        name="delivery_time"
        value={formData.delivery_time}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
      >
        <option value="">Selecione a hora</option>
        {Array.from({ length: 24 * 2 }).map((_, index) => {
          const hour = Math.floor(index / 2);
          const minute = index % 2 === 0 ? '00' : '30';
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;
          return (
            <option key={timeStr} value={timeStr}>
              {timeStr}
            </option>
          );
        })}
      </select>
    </div>
  </div>
</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição do Projeto
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Descreva os detalhes do projeto, especificações, quantidade, etc."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Criar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
