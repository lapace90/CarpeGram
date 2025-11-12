import { useState, useEffect } from 'react';
import { getUserConversations, getTotalUnreadCount } from '../services/conversationService';
import { supabase } from '../lib/supabase';

export const useConversations = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadConversations();
      loadUnreadCount();
      subscribeToMessages();
    }
  }, [userId]);

  const loadConversations = async () => {
    const result = await getUserConversations(userId);
    if (result.success) {
      setConversations(result.data);
    }
    setLoading(false);
  };

  const loadUnreadCount = async () => {
    const result = await getTotalUnreadCount(userId);
    if (result.success) {
      setTotalUnreadCount(result.count);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadConversations();
    await loadUnreadCount();
    setRefreshing(false);
  };

  /**
   * S'abonner aux nouveaux messages pour rafraîchir la liste
   */
  const subscribeToMessages = () => {
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          // Rafraîchir la liste quand un message arrive
          await loadConversations();
          await loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    conversations,
    totalUnreadCount,
    loading,
    refreshing,
    refresh,
  };
};