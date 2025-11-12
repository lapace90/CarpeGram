import { supabase } from '../lib/supabase';

/**
 * Obtenir ou créer une conversation entre deux users
 */
export const getOrCreateConversation = async (currentUserId, otherUserId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_or_create_conversation', {
        p_user1_id: currentUserId,
        p_user2_id: otherUserId
      });

    if (error) throw error;

    return { success: true, conversationId: data };
  } catch (error) {
    console.error('Get or create conversation error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Compter les messages non lus totaux de l'utilisateur
 */
export const getTotalUnreadCount = async (userId) => {
  try {
    // Récupérer toutes les conversations de l'user
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (convError) throw convError;

    const conversationIds = conversations.map(c => c.id);

    // Compter tous les messages non lus dans ces conversations
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('read', false)
      .neq('sender_id', userId);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Get total unread count error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupérer toutes les conversations de l'utilisateur
 */
export const getUserConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        user1_id,
        user2_id,
        last_message_at,
        created_at
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Pour chaque conversation, récupérer l'autre user et le dernier message
    const conversationsWithDetails = await Promise.all(
      (data || []).map(async (conv) => {
        const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

        // Récupérer le profil de l'autre user
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, first_name, last_name, show_full_name')
          .eq('id', otherUserId)
          .single();

        // Récupérer le dernier message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, type, created_at, sender_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Compter les messages non lus
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .neq('sender_id', userId);

        return {
          ...conv,
          otherUser: profile,
          lastMessage,
          unreadCount: unreadCount || 0
        };
      })
    );

    return { success: true, data: conversationsWithDetails };
  } catch (error) {
    console.error('Get user conversations error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprimer une conversation (et tous ses messages en cascade)
 */
export const deleteConversation = async (conversationId) => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete conversation error:', error);
    return { success: false, error: error.message };
  }
};