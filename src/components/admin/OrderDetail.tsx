import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useDropzone } from 'react-dropzone';
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  Package,
  Calendar,
  Clock,
  Upload,
  File,
  Download,
  Trash2,
  Edit,
  Save,
  AlertCircle,
  CheckCircle,
  History,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrderChat from './OrderChat';

interface Order {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company?: string;
  service: string;
  description?: string;
  status: 'em_producao' | 'finalizado' | 'cancelado';
  status_id: string | null;
  delivery_date: string;
  created_at: string;
  updated_at: string;
  employee_id: string;
}

interface OrderStatus {
  id: string;
  name: string;
  color: string;
  order_index: number;
  is_active: boolean;
}

interface OrderFile {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: 'cliente' | 'interno';
  uploaded_by: string;
  created_at: string;
}

interface OrderHistory {
  id: string;
  order_id: string;
  changed_by: string;
  field_name: string;
  old_value: string;
  new_value: string;
  changed_at: string;
  changer_email?: string;
}

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
  startInEditMode?: boolean;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onClose, onUpdate, startInEditMode = false }) => {
  const [editing, setEditing] = useState(startInEditMode);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [availableStatuses, setAvailableStatuses] = useState<OrderStatus[]>([]);
  const [formData, setFormData] = useState({
    status_id: order.status_id || '',
    description: order.description || '',
    delivery_date: order.delivery_date
  });

  useEffect(() => {
    getCurrentUser();
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

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchHistory();
  }, [order.id]);

  const fetchFiles = async () => {
    try {
      const { data } = await supabase
        .from('order_files')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });

      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await supabase
        .from('order_history_with_changer')
        .select('*')
        .eq('order_id', order.id)
        .order('changed_at', { ascending: false });

      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setUploadingFiles(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${order.id}/${Date.now()}.${fileExt}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('order-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save file record to database
        const { error: dbError } = await supabase
          .from('order_files')
          .insert([{
            order_id: order.id,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type,
            category: 'cliente',
            uploaded_by: user.id
          }]);

        if (dbError) throw dbError;
      }

      await fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Erro ao fazer upload dos arquivos');
    } finally {
      setUploadingFiles(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const changes = [];

      if (formData.status_id !== order.status_id) {
        const oldStatus = availableStatuses.find(s => s.id === order.status_id);
        const newStatus = availableStatuses.find(s => s.id === formData.status_id);
        changes.push({
          order_id: order.id,
          changed_by: user.id,
          field_name: 'status',
          old_value: oldStatus?.name || 'Sem Status',
          new_value: newStatus?.name || 'Sem Status'
        });
      }

      if (formData.description !== (order.description || '')) {
        changes.push({
          order_id: order.id,
          changed_by: user.id,
          field_name: 'description',
          old_value: order.description || 'Nenhuma descrição',
          new_value: formData.description || 'Nenhuma descrição'
        });
      }

      if (formData.delivery_date !== order.delivery_date) {
        changes.push({
          order_id: order.id,
          changed_by: user.id,
          field_name: 'delivery_date',
          old_value: format(new Date(order.delivery_date), 'dd/MM/yyyy', { locale: ptBR }),
          new_value: format(new Date(formData.delivery_date), 'dd/MM/yyyy', { locale: ptBR })
        });
      }

      const { error } = await supabase
        .from('orders')
        .update({
          status_id: formData.status_id,
          description: formData.description,
          delivery_date: formData.delivery_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      if (changes.length > 0) {
        await supabase
          .from('order_history')
          .insert(changes);
      }

      await fetchHistory();
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('order-files')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('order_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('order-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getCurrentStatus = (): OrderStatus | undefined => {
    return availableStatuses.find(s => s.id === order.status_id);
  };

  const getStatusStyle = (status: OrderStatus | undefined) => {
    if (!status) return { backgroundColor: '#E5E7EB', color: '#374151' };

    const bgColor = status.color + '20';
    return {
      backgroundColor: bgColor,
      color: status.color
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes do Pedido</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {order.id.slice(0, 8)}</p>
          </div>
          <div className="flex items-center space-x-2">
            {!editing && activeTab === 'details' && (
              <button
                onClick={() => setEditing(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'details'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Package className="w-5 h-5 inline-block mr-2" />
            Detalhes
            {activeTab === 'details' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'chat'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MessageSquare className="w-5 h-5 inline-block mr-2" />
            Chat
            {activeTab === 'chat' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="p-6 space-y-8">
          {/* Status and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              {editing ? (
                <select
                  value={formData.status_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, status_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {availableStatuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                  style={getStatusStyle(getCurrentStatus())}
                >
                  {getCurrentStatus()?.name || 'Sem Status'}
                </span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data de Entrega</label>
              {editing ? (
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{format(new Date(order.delivery_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Criado em</label>
              <p className="text-gray-900 dark:text-white">{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-500" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nome</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.client_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">E-mail</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.client_email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.client_phone}</p>
                </div>
              </div>
              {order.client_company && (
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Empresa</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.client_company}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-500" />
              Informações do Serviço
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Serviço</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.service}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Descrição</p>
                {editing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Descrição do projeto..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{order.description || 'Nenhuma descrição fornecida'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <File className="w-5 h-5 mr-2 text-orange-500" />
              Arquivos ({files.length})
            </h3>
            
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
              }`}
            >
              <input {...getInputProps()} />
              {uploadingFiles ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <p className="text-gray-600">Enviando arquivos...</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Máximo 50MB por arquivo</p>
                </div>
              )}
            </div>

            {/* Files List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.file_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.file_size)} • {format(new Date(file.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadFile(file.file_path, file.file_name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id, file.file_path)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History Section */}
          {history.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-orange-500" />
                Histórico de Alterações
              </h3>
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.field_name === 'status' && 'Status alterado'}
                          {entry.field_name === 'description' && 'Descrição alterada'}
                          {entry.field_name === 'delivery_date' && 'Data de entrega alterada'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(entry.changed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="text-red-600 line-through">{entry.old_value}</span>
                        {' → '}
                        <span className="text-green-600 font-medium">{entry.new_value}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Alterado por: {entry.changer_email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {editing && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Salvar Alterações
              </button>
            </div>
          )}
            </div>
          ) : (
            <div className="p-6">
              <OrderChat orderId={order.id} currentUserId={currentUserId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;