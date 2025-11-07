import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Save,
  ArrowLeft,
  User,
  Package,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  Search,
  Plus,
  X,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

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

interface NewOrderPageProps {
  onBack: () => void;
  onSave: () => void;
}

const NewOrderPage: React.FC<NewOrderPageProps> = ({ onBack, onSave }) => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showServiceOrderConfirm, setShowServiceOrderConfirm] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [formData, setFormData] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
    (client.phone && client.phone.includes(clientSearch))
  );

  const handleCreateClient = async () => {
    if (!newClientData.name) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: newClientData.name,
          email: newClientData.email || null,
          phone: newClientData.phone || null,
          address: newClientData.address || null,
          notes: newClientData.notes || null,
          is_active: true,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchClients();
      setSelectedClient(data);
      setClientSearch(data.name);
      setShowNewClientModal(false);
      setNewClientData({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
    } catch (error: any) {
      console.error('Error creating client:', error);
      alert(`Erro ao criar cliente: ${error.message}`);
    }
  };

  const handleServiceOrderYes = async () => {
    if (createdOrderId) {
      await supabase
        .from('orders')
        .update({ service_order_status: 'registrada' })
        .eq('id', createdOrderId);
    }

    window.open('https://www.example.com/registro-os', '_blank');

    onSave();
  };

  const handleServiceOrderNo = () => {
    onSave();
  };

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

      if (!selectedClient) {
        setError('Por favor, selecione um cliente');
        return;
      }

      if (!formData.status_id) {
        setError('Por favor, selecione um status');
        return;
      }

      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert([{
          client_id: selectedClient.id,
          service: formData.service,
          description: formData.description,
          delivery_date: deliveryDateTime,
          employee_id: user.id,
          created_by: user.id,
          status_id: formData.status_id,
          service_order_status: 'pendente'
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setCreatedOrderId(newOrder?.id || null);
      setShowServiceOrderConfirm(true);
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(`Erro ao criar pedido: ${error.message || 'Tente novamente.'}`);
    }
  };

  if (showServiceOrderConfirm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Pedido Criado!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Deseja registrar a Ordem de Serviço agora?
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleServiceOrderNo}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold"
            >
              Não
            </button>
            <button
              onClick={handleServiceOrderYes}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 font-semibold flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Sim
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Pedido</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Preencha as informações do pedido</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 font-semibold flex items-center shadow-lg shadow-orange-500/30"
            >
              <Save className="w-5 h-5 mr-2" />
              Criar Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Client Selection Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 relative">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Selecione o Cliente
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Novo Cliente
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientDropdown(true);
                    if (!e.target.value) {
                      setSelectedClient(null);
                    }
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                  placeholder="Buscar cliente por nome, email ou telefone..."
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
                />
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>

              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0 transition-colors"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white text-lg">{client.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {client.email && `${client.email}`}
                        {client.email && client.phone && ' • '}
                        {client.phone && client.phone}
                      </div>
                      {client.address && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{client.address}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedClient && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedClient.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedClient.email && selectedClient.email}
                    {selectedClient.email && selectedClient.phone && ' • '}
                    {selectedClient.phone && selectedClient.phone}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-400 font-medium">{error}</span>
          </div>
        )}

        {!selectedClient && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl text-center">
            <User className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-blue-700 dark:text-blue-400 font-medium">Selecione um cliente para começar</p>
          </div>
        )}

        {selectedClient && (
          <div className="space-y-8">
            {/* Service Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Informações do Serviço</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Serviço *
                  </label>
                  <input
                    type="text"
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="Ex: Cartões de Visita, Banner, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    name="status_id"
                    required
                    value={formData.status_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  >
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Data de Entrega *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="delivery_date"
                      required
                      value={formData.delivery_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Hora de Entrega
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="delivery_time"
                      value={formData.delivery_time}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer transition-all duration-200"
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

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descrição do Projeto
                </label>
                <textarea
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                  placeholder="Descreva os detalhes do projeto, especificações, quantidade, etc."
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 font-bold text-lg flex items-center shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105"
                >
                  <Save className="w-6 h-6 mr-3" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Modal Novo Cliente */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Cliente</h2>
              <button
                onClick={() => {
                  setShowNewClientModal(false);
                  setNewClientData({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    notes: ''
                  });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Preencha os dados do novo cliente. Apenas o nome é obrigatório.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={newClientData.name}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Nome do cliente"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Endereço
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      rows={3}
                      value={newClientData.address}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Endereço completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    rows={4}
                    value={newClientData.notes}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Informações adicionais sobre o cliente..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewClientModal(false);
                    setNewClientData({
                      name: '',
                      email: '',
                      phone: '',
                      address: '',
                      notes: ''
                    });
                  }}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateClient}
                  disabled={!newClientData.name}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 font-semibold flex items-center shadow-lg disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewOrderPage;
