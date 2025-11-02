import { supabase } from '../lib/supabase'

/**
 * ========================================
 * CLOSE FRIENDS
 * ========================================
 */

/**
 * Vérifie si un user est dans les close friends
 */
export const checkIfCloseFriend = async (userId, friendId) => {
  try {
    const { data, error } = await supabase
      .from('user_relationships')
      .select('is_close_friend')
      .eq('follower_id', userId)
      .eq('following_id', friendId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { success: true, isCloseFriend: data?.is_close_friend || false };
  } catch (error) {
    console.error('Check close friend error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Ajouter aux close friends
 */
export const addToCloseFriends = async (userId, friendId) => {
  try {
    const { error } = await supabase
      .from('user_relationships')
      .update({ is_close_friend: true })
      .eq('follower_id', userId)
      .eq('following_id', friendId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Add to close friends error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retirer des close friends
 */
export const removeFromCloseFriends = async (userId, friendId) => {
  try {
    const { error } = await supabase
      .from('user_relationships')
      .update({ is_close_friend: false })
      .eq('follower_id', userId)
      .eq('following_id', friendId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Remove from close friends error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle close friend (ajouter ou retirer)
 */
export const toggleCloseFriend = async (userId, friendId) => {
  try {
    const checkResult = await checkIfCloseFriend(userId, friendId);
    
    if (!checkResult.success) {
      throw new Error(checkResult.error);
    }

    const isCurrentlyCloseFriend = checkResult.isCloseFriend;

    if (isCurrentlyCloseFriend) {
      return await removeFromCloseFriends(userId, friendId);
    } else {
      return await addToCloseFriends(userId, friendId);
    }
  } catch (error) {
    console.error('Toggle close friend error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ========================================
 * BLOCK
 * ========================================
 */

/**
 * Vérifie si un user est bloqué
 */
export const checkIfBlocked = async (blockerId, blockedId) => {
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { success: true, isBlocked: !!data };
  } catch (error) {
    console.error('Check if blocked error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Bloquer un utilisateur
 * Note: Le trigger SQL va automatiquement unfollow dans les 2 sens
 */
export const blockUser = async (blockerId, blockedId) => {
  try {
    // Vérifier si déjà bloqué
    const checkResult = await checkIfBlocked(blockerId, blockedId);
    if (checkResult.isBlocked) {
      return { success: true, message: 'Already blocked' };
    }

    // Bloquer
    const { error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });

    if (error) throw error;

    // Le trigger SQL va automatiquement supprimer les relations de follow
    return { success: true };
  } catch (error) {
    console.error('Block user error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Débloquer un utilisateur
 */
export const unblockUser = async (blockerId, blockedId) => {
  try {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Unblock user error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère la liste des users bloqués
 */
export const getBlockedUsers = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_id, created_at')
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Récupérer les profiles des users bloqués
    if (data && data.length > 0) {
      const blockedIds = data.map(b => b.blocked_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, first_name, last_name, show_full_name')
        .in('id', blockedIds);

      if (profilesError) throw profilesError;

      const blockedWithProfiles = data.map(block => ({
        ...block,
        profile: profiles?.find(p => p.id === block.blocked_id)
      }));

      return { success: true, data: blockedWithProfiles };
    }

    return { success: true, data: [] };
  } catch (error) {
    console.error('Get blocked users error:', error);
    return { success: false, error: error.message };
  }
};