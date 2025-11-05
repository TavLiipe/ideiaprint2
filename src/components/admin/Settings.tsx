import React, { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

interface Status {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

const Settings: React.FC = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchStatuses();
    fetchUsers();
  }, []);

  const fetchStatuses = async () => {
    const { data, error } = await supabase.from('statuses').select('*');
    if (error) {
      toast.error('Erro ao carregar status');
      return;
    }
    setStatuses(data);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      toast.error('Erro ao carregar usuários');
      return;
    }
    setUsers(data);
  };

  const handleSaveStatus = async (status: Partial<Status>) => {
    if (editingStatus) {
      const { error } = await supabase
        .from('statuses')
        .update(status)
        .eq('id', editingStatus.id);
      if (!error) toast.success('Status atualizado!');
    } else {
      const { error } = await supabase.from('statuses').insert(status);
      if (!error) toast.success('Status criado!');
    }
    setIsStatusModalOpen(false);
    setEditingStatus(null);
    fetchStatuses();
  };

  const handleDeleteStatus = async (id: number) => {
    const { error } = await supabase.from('statuses').delete().eq('id', id);
    if (!error) {
      toast.success('Status removido!');
      fetchStatuses();
    }
  };

  const handleSaveUser = async (user: Partial<User>) => {
    if (editingUser) {
      const { error } = await supabase.from('users').update(user).eq('id', editingUser.id);
      if (!error) toast.success('Usuário atualizado!');
    } else {
      const { error } = await supabase.from('users').insert(user);
      if (!error) toast.success('Usuário criado!');
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleDeleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) {
      toast.success('Usuário removido!');
      fetchUsers();
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white mb-8">Configurações</h1>

      {/* Seção de Status */}
      <div className="bg-[#0B192F] p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Status</h2>
          <button
            onClick={() => {
              setEditingStatus(null);
              setIsStatusModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo Status
          </button>
        </div>

        <div className="space-y-2">
          {statuses.map((status) => (
            <div
              key={status.id}
              className="flex justify-between items-center bg-[#111F3C] p-4 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: status.color }}
                ></div>
                <span className="text-white font-medium">{status.name}</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setEditingStatus(status);
                    setIsStatusModalOpen(true);
                  }}
                  className="p-2 hover:text-orange-400 text-gray-300 transition-colors"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteStatus(status.id)}
                  className="p-2 hover:text-red-500 text-gray-300 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Usuários */}
      <div className="bg-[#0B192F] p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Usuários</h2>
          <button
            onClick={() => {
              setEditingUser(null);
              setIsUserModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo Usuário
          </button>
        </div>

        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center bg-[#111F3C] p-4 rounded-lg"
            >
              <span className="text-white font-medium">{user.email}</span>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">{user.role}</span>
                <button
                  onClick={() => {
                    setEditingUser(user);
                    setIsUserModalOpen(true);
                  }}
                  className="p-2 hover:text-orange-400 text-gray-300 transition-colors"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-2 hover:text-red-500 text-gray-300 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modais */}
      {isStatusModalOpen && (
        <StatusModal
          onClose={() => setIsStatusModalOpen(false)}
          onSave={handleSaveStatus}
          editingStatus={editingStatus}
        />
      )}

      {isUserModalOpen && (
        <UserModal
          onClose={() => setIsUserModalOpen(false)}
          onSave={handleSaveUser}
          editingUser={editingUser}
        />
      )}
    </div>
  );
};

export default Settings;

// -----------------------------------------------------------------------
// COMPONENTE MODAL DE STATUS
// -----------------------------------------------------------------------
const StatusModal: React.FC<{
  onClose: () => void;
  onSave: (status: Partial<Status>) => void;
  editingStatus: Status | null;
}> = ({ onClose, onSave, editingStatus }) => {
  const [formData, setFormData] = useState({
    name: editingStatus?.name || '',
    color: editingStatus?.color || '#FFA500',
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Digite um nome para o status');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#0B192F] p-6 rounded-lg w-full max-w-md shadow-lg border border-orange-500/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editingStatus ? 'Editar Status' : 'Novo Status'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#111F3C] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Cor</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// COMPONENTE MODAL DE USUÁRIOS
// -----------------------------------------------------------------------
const UserModal: React.FC<{
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
  editingUser: User | null;
}> = ({ onClose, onSave, editingUser }) => {
  const [formData, setFormData] = useState({
    email: editingUser?.email || '',
    role: editingUser?.role || 'user',
  });

  const handleSubmit = () => {
    if (!formData.email.trim()) {
      toast.error('Digite um e-mail válido');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#0B192F] p-6 rounded-lg w-full max-w-md shadow-lg border border-orange-500/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">E-mail</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#111F3C] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Função</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#111F3C] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
