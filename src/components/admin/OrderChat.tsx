import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, FileText, Image as ImageIcon, Download, Trash2, Bell, BellOff } from 'lucide-react';
import { useOrderChat } from '../../hooks/useOrderChat';
import { useOrderFollowers } from '../../hooks/useOrderFollowers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDropzone } from 'react-dropzone';

interface OrderChatProps {
  orderId: string;
  currentUserId: string;
}

const OrderChat: React.FC<OrderChatProps> = ({ orderId, currentUserId }) => {
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    error,
    sendMessage,
    getAttachmentUrl,
    deleteMessage,
  } = useOrderChat(orderId);

  const {
    isFollowing,
    notificationsEnabled,
    followOrder,
    unfollowOrder,
    toggleNotifications,
  } = useOrderFollowers(orderId);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    },
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxSize: 10485760,
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && selectedFiles.length === 0) return;

    setSending(true);

    const result = await sendMessage(messageText, selectedFiles);

    if (result.success) {
      setMessageText('');
      setSelectedFiles([]);
      scrollToBottom();
    } else {
      alert(result.error || 'Erro ao enviar mensagem');
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
      await deleteMessage(messageId);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowOrder();
    } else {
      await followOrder();
    }
  };

  const getUserColor = (userId: string): string => {
    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
      'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
      'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
      'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700',
      'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    ];

    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 dark:text-gray-400">Carregando chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Chat do Pedido
        </h3>
        <div className="flex items-center gap-2">
          {isFollowing && (
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={notificationsEnabled ? 'Desativar notificações' : 'Ativar notificações'}
            >
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-orange-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
          <button
            onClick={handleFollowToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isFollowing
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isFollowing ? 'Seguindo' : 'Seguir'}
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        {...getRootProps()}
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${
          isDragActive ? 'bg-orange-50 dark:bg-orange-900/10 border-2 border-dashed border-orange-400' : ''
        }`}
      >
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-orange-50/90 dark:bg-orange-900/20 backdrop-blur-sm z-10">
            <div className="text-center">
              <Paperclip className="w-12 h-12 text-orange-500 mx-auto mb-2" />
              <p className="text-lg font-medium text-orange-700 dark:text-orange-400">
                Solte os arquivos aqui
              </p>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium mb-2">Nenhuma mensagem ainda</p>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem neste pedido</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.user_id === currentUserId;
            const colorClass = getUserColor(message.user_id);

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
                      : colorClass
                  } border rounded-lg p-3 shadow-sm`}
                >
                  {/* User Info */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {message.user_name}
                    </span>
                    {isOwnMessage && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        title="Excluir mensagem"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Message Text */}
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {message.message}
                  </p>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <AttachmentPreview
                          key={attachment.id}
                          attachment={attachment}
                          getAttachmentUrl={getAttachmentUrl}
                          getFileIcon={getFileIcon}
                          formatFileSize={formatFileSize}
                        />
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center justify-end mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                    {message.is_edited && (
                      <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">(editado)</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-orange-500" />
                ) : (
                  <FileText className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end gap-2">
          <input {...getInputProps()} />
          <label className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedFiles((prev) => [...prev, ...files]);
              }}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />
          </label>

          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 max-h-32"
            rows={2}
          />

          <button
            onClick={handleSendMessage}
            disabled={sending || (!messageText.trim() && selectedFiles.length === 0)}
            className="p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface AttachmentPreviewProps {
  attachment: any;
  getAttachmentUrl: (path: string) => Promise<string | null>;
  getFileIcon: (type: string) => JSX.Element;
  formatFileSize: (bytes: number) => string;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  getAttachmentUrl,
  getFileIcon,
  formatFileSize,
}) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUrl();
  }, [attachment]);

  const loadUrl = async () => {
    const signedUrl = await getAttachmentUrl(attachment.file_path);
    setUrl(signedUrl);
  };

  const handleDownload = async () => {
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.file_name;
    link.click();
  };

  return (
    <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 rounded p-2">
      {attachment.file_type.startsWith('image/') && url ? (
        <img
          src={url}
          alt={attachment.file_name}
          className="w-16 h-16 object-cover rounded"
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
          {getFileIcon(attachment.file_type)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
          {attachment.file_name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(attachment.file_size)}
        </p>
      </div>
      <button
        onClick={handleDownload}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        title="Baixar arquivo"
      >
        <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default OrderChat;
