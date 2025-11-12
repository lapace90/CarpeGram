import { supabase } from '../lib/supabase';

/**
 * Récupère les notifications d'un utilisateur
 */
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:actor_id (
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
          description
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Compte les notifications non lues
 */
export const getUnreadCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Get unread count error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Marque une notification comme lue
 */
export const markAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Mark as read error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Marque toutes les notifications comme lues
 */
export const markAllAsRead = async (userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Mark all as read error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime une notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);
    return { success: false, error: error.message };
  }
};