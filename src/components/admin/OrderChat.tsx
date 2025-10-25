import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, FileText, Image as ImageIcon, Download, Trash2, Bell, BellOff } from 'lucide-react';
import { useOrderChat } from '../../hooks/useOrderChat';
import { useOrderFollowers } from '../../hooks/useOrderFollowers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';

interface OrderChatProps {
  orderId: string;
  currentUserId: string;
}

interface Employee {
  user_id: string;
  username: string;
  full_name: string;
}

const OrderChat: React.FC<OrderChatProps> = ({ orderId, currentUserId }) => {
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

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

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (mentionSearch) {
      const filtered = employees.filter(emp =>
        emp.full_name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
        emp.username.toLowerCase().includes(mentionSearch.toLowerCase())
      );
      setFilteredEmployees(filtered);
      setSelectedMentionIndex(0);
    } else {
      setFilteredEmployees(employees);
    }
  }, [mentionSearch, employees]);

  const fetchEmployees = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('user_id, username, full_name')
        .eq('is_active', true)
        .order('full_name');

      if (data) {
        setEmployees(data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setMessageText(value);
    setCursorPosition(cursorPos);

    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      const hasSpace = textAfterAt.includes(' ');

      if (!hasSpace) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (employee: Employee) => {
    const textBeforeCursor = messageText.slice(0, cursorPosition);
    const textAfterCursor = messageText.slice(cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    const newText =
      messageText.slice(0, atIndex) +
      `@${employee.username} ` +
      textAfterCursor;

    setMessageText(newText);
    setShowMentions(false);
    setMentionSearch('');

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = atIndex + employee.username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev =>
          prev < filteredEmployees.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredEmployees[selectedMentionIndex]) {
          insertMention(filteredEmployees[selectedMentionIndex]);
        }
        return;
      } else if (e.key === 'Escape') {
        setShowMentions(false);
        setMentionSearch('');
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
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
      'bg-blue-50 dark:bg-blue-950/50',
      'bg-green-50 dark:bg-green-950/50',
      'bg-amber-50 dark:bg-amber-950/50',
      'bg-rose-50 dark:bg-rose-950/50',
      'bg-cyan-50 dark:bg-cyan-950/50',
    ];

    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderMessageWithMentions = (text: string, isOwnMessage: boolean) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      parts.push(
        <span
          key={match.index}
          className={`font-semibold ${
            isOwnMessage
              ? 'text-orange-100 bg-orange-600/30'
              : 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
          } px-1 rounded`}
        >
          {match[0]}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
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
            const initials = getUserInitials(message.user_name);

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isOwnMessage
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900'
                  }`}
                >
                  {initials}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {/* User Name and Time */}
                  <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {message.user_name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                    </span>
                    {message.is_edited && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">(editado)</span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`relative group ${
                      isOwnMessage
                        ? 'bg-orange-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                    } rounded-2xl px-4 py-2 shadow-sm`}
                  >
                    {/* Delete Button */}
                    {isOwnMessage && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg"
                        title="Excluir mensagem"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    {/* Message Text */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {renderMessageWithMentions(message.message, isOwnMessage)}
                    </p>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment) => (
                          <AttachmentPreview
                            key={attachment.id}
                            attachment={attachment}
                            getAttachmentUrl={getAttachmentUrl}
                            getFileIcon={getFileIcon}
                            formatFileSize={formatFileSize}
                            isOwnMessage={isOwnMessage}
                          />
                        ))}
                      </div>
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

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextChange}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem... (use @ para mencionar)"
              className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 max-h-32"
              rows={2}
            />

            {showMentions && filteredEmployees.length > 0 && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                {filteredEmployees.map((employee, index) => (
                  <button
                    key={employee.user_id}
                    onClick={() => insertMention(employee)}
                    className={`w-full text-left px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${
                      index === selectedMentionIndex
                        ? 'bg-orange-50 dark:bg-orange-900/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-semibold">
                        {employee.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {employee.full_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          @{employee.username}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

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
  isOwnMessage: boolean;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  getAttachmentUrl,
  getFileIcon,
  formatFileSize,
  isOwnMessage,
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
    <div className={`flex items-center gap-2 rounded-lg p-2 ${
      isOwnMessage
        ? 'bg-orange-600/20'
        : 'bg-gray-100 dark:bg-gray-700/50'
    }`}>
      {attachment.file_type.startsWith('image/') && url ? (
        <img
          src={url}
          alt={attachment.file_name}
          className="w-16 h-16 object-cover rounded-lg"
        />
      ) : (
        <div className={`w-16 h-16 flex items-center justify-center rounded-lg ${
          isOwnMessage
            ? 'bg-orange-600/30'
            : 'bg-gray-200 dark:bg-gray-600'
        }`}>
          {getFileIcon(attachment.file_type)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${
          isOwnMessage
            ? 'text-white'
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {attachment.file_name}
        </p>
        <p className={`text-xs ${
          isOwnMessage
            ? 'text-orange-100'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {formatFileSize(attachment.file_size)}
        </p>
      </div>
      <button
        onClick={handleDownload}
        className={`p-1.5 rounded-lg transition-colors ${
          isOwnMessage
            ? 'hover:bg-orange-600/30 text-white'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
        }`}
        title="Baixar arquivo"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
};

export default OrderChat;
