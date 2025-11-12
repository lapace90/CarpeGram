import { useState, useEffect } from 'react';
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notificationService';
import { supabase } from '../lib/supabase';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadUnreadCount();
      subscribeToNotifications();
    }
  }, [userId]);

  const loadNotifications = async () => {
    const result = await getUserNotifications(userId);
    if (result.success) {
      setNotifications(result.data);
    }
    setLoading(false);
  };

  const loadUnreadCount = async () => {
    const result = await getUnreadCount(userId);
    if (result.success) {
      setUnreadCount(result.count);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    await loadUnreadCount();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    const result = await markAsRead(notificationId);
    if (!result.success) {
      // Rollback si erreur
      await loadNotifications();
      await loadUnreadCount();
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    const result = await markAllAsRead(userId);
    if (!result.success) {
      // Rollback si erreur
      await loadNotifications();
      await loadUnreadCount();
    }
  };

  /**
   * S'abonner aux nouvelles notifications en temps réel
   */
  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Ajouter la nouvelle notification
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    notifications,
    unreadCount,
    loading,
    refreshing,
    refresh,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  };
};