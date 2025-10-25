import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  message: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export const useOrderChat = (orderId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Inicializa chat
  useEffect(() => {
    if (!orderId) return;

    fetchMessages();
    const subscription = setupRealtimeSubscription();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [orderId]);

  // Fetch inicial de mensagens
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('order_messages')
        .select(`*, attachments:message_attachments(*)`)
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages(data || []);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  // Configura Realtime
  const setupRealtimeSubscription = () => {
    if (channel) supabase.removeChannel(channel);

    const newChannel = supabase
      .channel(`order-chat:${orderId}`, { config: { broadcast: { self: false } } })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;

          // Atualiza mensagens sem duplicar
          setMessages((prev) => {
            if (prev.find(msg => msg.id === newMessage.id)) return prev;
            return [...prev, { ...newMessage, attachments: [] }];
          });

          // Busca attachments
          const { data: attachments } = await supabase
            .from('message_attachments')
            .select('*')
            .eq('message_id', newMessage.id);

          if (attachments) {
            setMessages((prev) =>
              prev.map(msg =>
                msg.id === newMessage.id ? { ...msg, attachments } : msg
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map(msg =>
              msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const deletedMessage = payload.old as ChatMessage;
          setMessages((prev) => prev.filter(msg => msg.id !== deletedMessage.id));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Conectado ao canal order-chat:${orderId}`);
        }
      });

    setChannel(newChannel);
    return newChannel;
  };

  // Envia mensagem
  const sendMessage = async (messageText: string, files?: File[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Usuário não autenticado' };

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('full_name, username')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: messageData, error: messageError } = await supabase
        .from('order_messages')
        .insert({
          order_id: orderId,
          user_id: user.id,
          user_name: userRole?.full_name || userRole?.username || user.email?.split('@')[0] || 'Usuário',
          user_email: user.email || '',
          message: messageText,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      const newMessage: ChatMessage = { ...messageData, attachments: [], is_edited: false };

      setMessages((prev) => [...prev, newMessage]); // mostra imediatamente

      // Upload de arquivos
      if (files?.length) {
        await uploadAttachments(newMessage.id, files);
        const { data: attachments } = await supabase
          .from('message_attachments')
          .select('*')
          .eq('message_id', newMessage.id);

        setMessages((prev) =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, attachments: attachments || [] } : msg
          )
        );
      }

      return { success: true };
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      return { success: false, error: 'Erro ao enviar mensagem' };
    }
  };

  // Upload de anexos
  const uploadAttachments = async (messageId: string, files: File[]) => {
    const promises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${orderId}/${messageId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('message_attachments')
        .insert({
          message_id: messageId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
        });
      if (dbError) throw dbError;
    });

    await Promise.all(promises);
  };

  // Recupera URL do attachment
  const getAttachmentUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(filePath, 3600);
      return data?.signedUrl || null;
    } catch (err) {
      console.error('Erro ao gerar URL do arquivo:', err);
      return null;
    }
  };

  // Deleta mensagem
  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.from('order_messages')
        .delete()
        .eq('id', messageId);
      if (error) throw error;
      setMessages((prev) => prev.filter(msg => msg.id !== messageId));
      return true;
    } catch (err) {
      console.error('Erro ao deletar mensagem:', err);
      return false;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    getAttachmentUrl,
    deleteMessage,
    refetch: fetchMessages,
  };
};
