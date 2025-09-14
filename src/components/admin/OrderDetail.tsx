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
  CheckCircle
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

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onClose, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [formData, setFormData] = useState({
    status: order.status,
    description: order.description || '',
    delivery_date: order.delivery_date
  });

  useEffect(() => {
    fetchFiles();
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

  const onDrop = async (acceptedFiles: File[]) => {
    setUploadingFiles(true);
    
    try {
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
            uploaded_by: '00000000-0000-0000-0000-000000000000' // Placeholder ID
          }]);

        if (dbError) throw dbError;
      }

      await fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
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
      const { error } = await supabase
        .from('orders')
        .update({
          status: formData.status,
          description: formData.description,
          delivery_date: formData.delivery_date
        })
        .eq('id', order.id);

      if (error) throw error;

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detalhes do Pedido</h2>
            <p className="text-sm text-gray-500">ID: {order.id.slice(0, 8)}</p>
          </div>
          <div className="flex items-center space-x-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Status and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              {editing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="em_producao">Em Produção</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Entrega</label>
              {editing ? (
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              ) : (
                <p className="text-gray-900">{format(new Date(order.delivery_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Criado em</label>
              <p className="text-gray-900">{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-500" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium text-gray-900">{order.client_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="font-medium text-gray-900">{order.client_email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium text-gray-900">{order.client_phone}</p>
                </div>
              </div>
              {order.client_company && (
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Empresa</p>
                    <p className="font-medium text-gray-900">{order.client_company}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-500" />
              Informações do Serviço
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Serviço</p>
                <p className="font-medium text-gray-900">{order.service}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Descrição</p>
                {editing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Descrição do projeto..."
                  />
                ) : (
                  <p className="text-gray-900">{order.description || 'Nenhuma descrição fornecida'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <File className="w-5 h-5 mr-2 text-orange-500" />
              Arquivos ({files.length})
            </h3>
            
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
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
                  <p className="text-gray-600 mb-2">
                    {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
                  </p>
                  <p className="text-sm text-gray-500">Máximo 50MB por arquivo</p>
                </div>
              )}
            </div>

            {/* Files List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{file.file_name}</p>
                        <p className="text-sm text-gray-500">
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

          {/* Actions */}
          {editing && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
      </div>
    </div>
  );
};

export default OrderDetail;