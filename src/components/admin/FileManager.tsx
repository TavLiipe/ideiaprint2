import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  Folder,
  Image,
  FileText,
  Archive,
  Eye,
  Share2,
  Grid,
  List
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FileItem {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: 'cliente' | 'interno';
  uploaded_by: string;
  created_at: string;
  order?: {
    client_name: string;
    service: string;
  };
}

const FileManager = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [files, searchTerm, categoryFilter, typeFilter]);

  const fetchFiles = async () => {
    try {
      const { data } = await supabase
        .from('order_files')
        .select(`
          *,
          orders (
            client_name,
            service
          )
        `)
        .order('created_at', { ascending: false });

      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const filterFiles = () => {
    let filtered = files;

    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.order?.client_name && file.order.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (file.order?.service && file.order.service.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(file => file.category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(file => {
        const type = file.file_type.split('/')[0];
        return type === typeFilter;
      });
    }

    setFilteredFiles(filtered);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setUploadingFiles(true);
    
    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `general/${Date.now()}-${file.name}`;
        
        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('order-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save file record to database
        const { error: dbError } = await supabase
          .from('order_files')
          .insert([{
            order_id: null, // General file, not associated with specific order
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type,
            category: 'interno',
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
    maxSize: 100 * 1024 * 1024 // 100MB
  });

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

  const deleteFile = async (fileId: string, filePath: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.split('/')[0];
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'application':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'video':
        return <File className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    return category === 'cliente' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const getCategoryText = (category: string) => {
    return category === 'cliente' ? 'Cliente' : 'Interno';
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedFiles.size} arquivo(s)?`)) return;

    try {
      const filesToDelete = files.filter(file => selectedFiles.has(file.id));
      
      for (const file of filesToDelete) {
        await supabase.storage
          .from('order-files')
          .remove([file.file_path]);

        await supabase
          .from('order_files')
          .delete()
          .eq('id', file.id);
      }

      setSelectedFiles(new Set());
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.file_size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Arquivos</h1>
          <p className="text-gray-600 mt-1">
            {files.length} arquivos • {formatFileSize(totalSize)} total
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
          {selectedFiles.size > 0 && (
            <button
              onClick={deleteSelectedFiles}
              className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir ({selectedFiles.size})
            </button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
        }`}
      >
        <input {...getInputProps()} />
        {uploadingFiles ? (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-gray-600">Enviando arquivos...</p>
          </div>
        ) : (
          <div>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">
              {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p className="text-sm text-gray-500">Máximo 100MB por arquivo</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Todas as Categorias</option>
            <option value="cliente">Cliente</option>
            <option value="interno">Interno</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="image">Imagens</option>
            <option value="application">Documentos</option>
            <option value="video">Vídeos</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            {filteredFiles.length} de {files.length} arquivos
          </div>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-100">
          <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum arquivo encontrado</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Faça upload de arquivos para começar'
            }
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div 
              key={file.id} 
              className={`bg-white rounded-xl p-6 shadow-lg border transition-all duration-200 hover:shadow-xl ${
                selectedFiles.has(file.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-shrink-0">
                  {getFileIcon(file.file_type)}
                </div>
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 truncate" title={file.file_name}>
                {file.file_name}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tamanho:</span>
                  <span className="text-gray-900">{formatFileSize(file.file_size)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Categoria:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                    {getCategoryText(file.category)}
                  </span>
                </div>
                
                {file.order && (
                  <div className="text-sm">
                    <span className="text-gray-500">Cliente:</span>
                    <span className="text-gray-900 ml-1">{file.order.client_name}</span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  {format(new Date(file.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadFile(file.file_path, file.file_name)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Baixar
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
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
                        } else {
                          setSelectedFiles(new Set());
                        }
                      }}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arquivo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{file.file_name}</div>
                          <div className="text-sm text-gray-500">{file.file_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                        {getCategoryText(file.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {file.order?.client_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(file.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => downloadFile(file.file_path, file.file_name)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id, file.file_path)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;