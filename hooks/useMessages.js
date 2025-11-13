import { useState, useEffect } from 'react';
import { 
  getConversationMessages, 
  sendTextMessage, 
  sendImageMessage, 
  sharePost,
  markMessagesAsRead 
} from '../services/messageService';
import { supabase } from '../lib/supabase';

export const useMessages = (conversationId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (conversationId && userId) {
      loadMessages();
      markAsRead();
      subscribeToNewMessages();
    }
  }, [conversationId, userId]);

  const loadMessages = async () => {
    const result = await getConversationMessages(conversationId);
    if (result.success) {
      setMessages(result.data);
    }
    setLoading(false);
  };

  const markAsRead = async () => {
    if (!userId) return;
    await markMessagesAsRead(conversationId, userId);
  };

  const sendText = async (text) => {
    if (!text.trim()) return { success: false };

    setSending(true);
    const result = await sendTextMessage(conversationId, userId, text);
    setSending(false);

    if (result.success) {
      // Le message sera ajouté via le subscription
      return { success: true };
    }
    
    return result;
  };

  const sendImage = async (imageUri) => {
    setSending(true);
    const result = await sendImageMessage(conversationId, userId, imageUri);
    setSending(false);

    return result;
  };

  const sendPostShare = async (postId) => {
    setSending(true);
    const result = await sharePost(conversationId, userId, postId);
    setSending(false);

    return result;
  };

  /**
   * S'abonner aux nouveaux messages en temps réel
   */
  const subscribeToNewMessages = () => {
    if (!conversationId || !userId) return null;
    
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Charger le message complet avec les relations
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:sender_id (
                id,
                username,
                avatar_url,
                first_name,
                last_name,
                show_full_name
              ),
              post:post_id (
                id,
                image_url,
                description,
                user_id,
                profiles:user_id (
                  username,
                  avatar_url
                )
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
            
            // Marquer comme lu si c'est un message reçu
            if (data.sender_id !== userId) {
              await markMessagesAsRead(conversationId, userId);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Mettre à jour le statut "read"
          setMessages(prev =>
            prev.map(msg =>
              msg.id === payload.new.id ? { ...msg, read: payload.new.read } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    messages,
    loading,
    sending,
    sendText,
    sendImage,
    sendPostShare,
    refresh: loadMessages,
  };
};