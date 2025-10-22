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
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company: string | null;
}

const OrderForm: React.FC<OrderFormProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    service: '',
    description: '',
    delivery_date: '',
    delivery_time: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('client_name, client_email, client_phone, client_company');

      if (data) {
        const uniqueClients = Array.from(
          new Map(data.map(item => [item.client_name, item])).values()
        );
        setClients(uniqueClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'client_name') {
      setShowClientSuggestions(value.length > 0);
    }
  };

  const handleClientSelect = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      client_name: client.client_name,
      client_email: client.client_email,
      client_phone: client.client_phone,
      client_company: client.client_company || ''
    }));
    setShowClientSuggestions(false);
  };

  const filteredClients = clients.filter(client =>
    client.client_name.toLowerCase().includes(formData.client_name.toLowerCase())
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

      const { error: insertError } = await supabase
        .from('orders')
        .insert([{
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          client_company: formData.client_company || null,
          service: formData.service,
          description: formData.description,
          delivery_date: deliveryDateTime,
          employee_id: user.id,
          created_by: user.id,
          status: 'em_producao'
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
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Novo Pedido</h2>
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
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-500" />
              Cliente
            </h3>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <input
                type="text"
                name="client_name"
                required
                value={formData.client_name}
                onChange={handleChange}
                onFocus={() => setShowClientSuggestions(formData.client_name.length > 0)}
                onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Digite o nome do cliente"
              />
              {showClientSuggestions && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredClients.map((client, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{client.client_name}</div>
                      <div className="text-sm text-gray-500">{client.client_email} • {client.client_phone}</div>
                      {client.client_company && (
                        <div className="text-xs text-gray-400">{client.client_company}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-500" />
              Informações do Serviço
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serviço *
                </label>
                <input
                  type="text"
                  name="service"
                  required
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ex: Cartões de Visita, Banner, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Entrega *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="delivery_date"
                      required
                      value={formData.delivery_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Entrega
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      name="delivery_time"
                      value={formData.delivery_time}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Projeto
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Descreva os detalhes do projeto, especificações, quantidade, etc."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
