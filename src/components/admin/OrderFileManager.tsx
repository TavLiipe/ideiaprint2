import React, { useState, useEffect } from 'react';
import { Upload, File, Trash2, Download, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface OrderFile {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}

interface OrderFileManagerProps {
  orderId: string;
}

export default function OrderFileManager({ orderId }: OrderFileManagerProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [orderId]);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('order_files')
        .select('*')
        .eq('order_id', orderId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !user) return;

    setUploading(true);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${orderId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('order-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('order_files')
          .insert({
            order_id: orderId,
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: user.id,
          });

        if (dbError) throw dbError;
      }

      await loadFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Erro ao fazer upload dos arquivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const downloadFile = async (file: OrderFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('order-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Erro ao baixar o arquivo');
    }
  };

  const deleteFile = async (file: OrderFile) => {
    if (!confirm(`Tem certeza que deseja excluir ${file.file_name}?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('order-files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('order_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Erro ao excluir o arquivo');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return <div className="text-center py-4">Carregando arquivos...</div>;
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-sm text-gray-500 mb-4">
          PDF, PNG, JPG, XLSX ou qualquer outro formato
        </p>
        <input
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          {uploading ? 'Fazendo upload...' : 'Selecionar Arquivos'}
        </label>
      </div>

      {files.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Nenhum arquivo enviado ainda
        </p>
      ) : (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 mb-2">
            Arquivos ({files.length})
          </h3>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="text-gray-500">
                  {getFileIcon(file.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {file.file_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => downloadFile(file)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Baixar arquivo"
                >
                  <Download className="w-5 h-5" />
                </button>
                {user?.id === file.uploaded_by && (
                  <button
                    onClick={() => deleteFile(file)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir arquivo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
