import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, UserCircle, Tag, Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
}

interface OrderStatus {
  id: string;
  name: string;
  color: string;
  order_index: number;
  is_active: boolean;
}

interface UserAccount {
  id: string;
  username: string;
  full_name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  is_active: boolean;
  created_at: string;
}

type TabType = 'clients' | 'statuses' | 'users';

const Settings: React.FC = () => {
  const { userRole, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    if (!isAdmin) return;

    if (activeTab === 'clients') {
      fetchClients();
    } else if (activeTab === 'statuses') {
      fetchStatuses();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (!error && data) {
      setClients(data);
    }
    setLoading(false);
  };

  const fetchStatuses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('order_statuses')
      .select('*')
      .order('order_index');

    if (!error && data) {
      setStatuses(data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (editingItem) {
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', editingItem.id);

      if (!error) {
        fetchClients();
        setShowClientModal(false);
        setEditingItem(null);
      }
    } else {
      const { error } = await supabase
        .from('clients')
        .insert([{ ...clientData, created_by: userRole?.user_id }]);

      if (!error) {
        fetchClients();
        setShowClientModal(false);
      }
    }
  };

  const handleSaveStatus = async (statusData: Partial<OrderStatus>) => {
    if (editingItem) {
      const { error } = await supabase
        .from('order_statuses')
        .update(statusData)
        .eq('id', editingItem.id);

      if (!error) {
        fetchStatuses();
        setShowStatusModal(false);
        setEditingItem(null);
      }
    } else {
      const maxIndex = Math.max(...statuses.map(s => s.order_index), 0);
      const { error } = await supabase
        .from('order_statuses')
        .insert([{ ...statusData, order_index: maxIndex + 1, created_by: userRole?.user_id }]);

      if (!error) {
        fetchStatuses();
        setShowStatusModal(false);
      }
    }
  };

  const handleSaveUser = async (userData: any) => {
    if (editingItem) {
      const updateData: any = {
        username: userData.username,
        full_name: userData.full_name,
        role: userData.role,
        is_active: userData.is_active,
      };

      if (userData.password) {
        const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
          editingItem.user_id,
          { password: userData.password }
        );

        if (authError) {
          alert('Erro ao atualizar senha');
          return;
        }
      }

      const { error } = await supabase
        .from('user_roles')
        .update(updateData)
        .eq('id', editingItem.id);

      if (!error) {
        fetchUsers();
        setShowUserModal(false);
        setEditingItem(null);
      }
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${userData.username}@internal.local`,
        password: userData.password,
      });

      if (authError || !authData.user) {
        alert('Erro ao criar usuário');
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          username: userData.username,
          full_name: userData.full_name,
          role: userData.role,
          password_hash: '',
          created_by: userRole?.user_id,
        }]);

      if (!error) {
        fetchUsers();
        setShowUserModal(false);
      }
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Deseja desativar este cliente?')) {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', id);

      if (!error) {
        fetchClients();
      }
    }
  };

  const handleDeleteStatus = async (id: string) => {
    if (confirm('Deseja desativar este status?')) {
      const { error } = await supabase
        .from('order_statuses')
        .update({ is_active: false })
        .eq('id', id);

      if (!error) {
        fetchStatuses();
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Deseja desativar este usuário?')) {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', id);

      if (!error) {
        fetchUsers();
      }
    }
  };

  if (!isAdmin) { return ( <div className="flex items-center justify-center h-full"> <p className="text-gray-500">Acesso negado. Apenas administradores podem acessar as configurações.</p> </div> ); }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'clients'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('statuses')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'statuses'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Status de Pedidos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <UserCircle className="w-4 h-4 inline mr-2" />
            Usuários
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'clients' && (
          <ClientsTab
            clients={clients}
            loading={loading}
            onAdd={() => { setEditingItem(null); setShowClientModal(true); }}
            onEdit={(client) => { setEditingItem(client); setShowClientModal(true); }}
            onDelete={handleDeleteClient}
          />
        )}

        {activeTab === 'statuses' && (
          <StatusesTab
            statuses={statuses}
            loading={loading}
            onAdd={() => { setEditingItem(null); setShowStatusModal(true); }}
            onEdit={(status) => { setEditingItem(status); setShowStatusModal(true); }}
            onDelete={handleDeleteStatus}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab
            users={users}
            loading={loading}
            onAdd={() => { setEditingItem(null); setShowUserModal(true); }}
            onEdit={(user) => { setEditingItem(user); setShowUserModal(true); }}
            onDelete={handleDeleteUser}
          />
        )}
      </div>

      {showClientModal && (
        <ClientModal
          client={editingItem}
          onSave={handleSaveClient}
          onClose={() => { setShowClientModal(false); setEditingItem(null); }}
        />
      )}

      {showStatusModal && (
        <StatusModal
          status={editingItem}
          onSave={handleSaveStatus}
          onClose={() => { setShowStatusModal(false); setEditingItem(null); }}
        />
      )}

      {showUserModal && (
        <UserModal
          user={editingItem}
          onSave={handleSaveUser}
          onClose={() => { setShowUserModal(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
};

const ClientsTab: React.FC<{
  clients: Client[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}> = ({ clients, loading, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Clientes Cadastrados</h2>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {client.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(client)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {client.is_active && (
                        <button
                          onClick={() => onDelete(client.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StatusesTab: React.FC<{
  statuses: OrderStatus[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (status: OrderStatus) => void;
  onDelete: (id: string) => void;
}> = ({ statuses, loading, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Status de Pedidos</h2>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Status
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statuses.map((status) => (
                <tr key={status.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{status.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: status.color }}
                      />
                      {status.color}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{status.order_index}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${status.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {status.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(status)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {status.is_active && (
                        <button
                          onClick={() => onDelete(status.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const UsersTab: React.FC<{
  users: UserAccount[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (user: UserAccount) => void;
  onDelete: (id: string) => void;
}> = ({ users, loading, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Usuários do Sistema</h2>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.is_active && (
                        <button
                          onClick={() => onDelete(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ClientModal: React.FC<{
  client: Client | null;
  onSave: (data: Partial<Client>) => void;
  onClose: () => void;
}> = ({ client, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    notes: client?.notes || '',
    is_active: client?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{client ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Cliente Ativo</label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusModal: React.FC<{
  status: OrderStatus | null;
  onSave: (data: Partial<OrderStatus>) => void;
  onClose: () => void;
}> = ({ status, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: status?.name || '',
    color: status?.color || '#3B82F6',
    is_active: status?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{status ? 'Editar Status' : 'Novo Status'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor *</label>
            <div className="flex gap-2">
              <input
                type="color"
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 border rounded-lg cursor-pointer"
              />
              <input
                type="text"
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="status_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="status_active" className="text-sm font-medium text-gray-700">Status Ativo</label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserModal: React.FC<{
  user: UserAccount | null;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    password: '',
    role: user?.role || 'EMPLOYEE',
    is_active: user?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !formData.password) {
      alert('Senha é obrigatória para novos usuários');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{user ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário *</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!!user}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {user ? '(deixe em branco para não alterar)' : '*'}
            </label>
            <input
              type="password"
              required={!user}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permissão *</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'EMPLOYEE' })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="EMPLOYEE">Funcionário</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="user_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="user_active" className="text-sm font-medium text-gray-700">Usuário Ativo</label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
