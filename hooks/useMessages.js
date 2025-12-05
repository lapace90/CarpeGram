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
      const unsubscribe = subscribeToNewMessages();
      return unsubscribe;
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
    if (!conversationId || !userId) return () => {};
    
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
          // Charger le message complet avec les relations de base
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
                user_id
              ),
              event:event_id (
                id,
                title,
                description,
                event_date,
                creator_id
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            // Enrichir avec le profil du post/event si nécessaire
            const enrichedMessage = await enrichSingleMessage(data);
            
            setMessages(prev => [...prev, enrichedMessage]);
            
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

  /**
   * Enrichir un seul message avec les profils de l'auteur du post et créateur d'event
   */
  const enrichSingleMessage = async (message) => {
    const userIds = [];
    
    if (message.post?.user_id) {
      userIds.push(message.post.user_id);
    }
    if (message.event?.creator_id) {
      userIds.push(message.event.creator_id);
    }

    if (userIds.length === 0) {
      return message;
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, show_full_name')
      .in('id', userIds);

    const profileMap = {};
    (profiles || []).forEach(p => {
      profileMap[p.id] = p;
    });

    const enriched = { ...message };
    
    if (message.post?.user_id && profileMap[message.post.user_id]) {
      enriched.post = {
        ...message.post,
        profiles: profileMap[message.post.user_id]
      };
    }
    
    if (message.event?.creator_id && profileMap[message.event.creator_id]) {
      enriched.event = {
        ...message.event,
        creator: profileMap[message.event.creator_id]
      };
    }
    
    return enriched;
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
