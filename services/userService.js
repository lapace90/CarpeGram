import { supabase } from '../lib/supabase'

/**
 * Recherche des utilisateurs par username ou nom
 */
export const searchUsers = async (query, currentUserId, limit = 20) => {
  try {
    if (!query || query.trim().length === 0) {
      return { success: true, data: [] };
    }

    const searchTerm = query.trim().toLowerCase();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, show_full_name, followers_count, posts_count')
      .or(`username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .neq('id', currentUserId) // Exclure soi-même
      .order('followers_count', { ascending: false }) // Les + populaires en premier
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Search users error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère des utilisateurs suggérés (découverte)
 */
export const getSuggestedUsers = async (currentUserId, limit = 10) => {
  try {
    // Récupérer des users aléatoires qu'on ne suit pas encore
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, show_full_name, followers_count, posts_count')
      .neq('id', currentUserId) // Exclure soi-même
      .order('posts_count', { ascending: false }) // Users actifs en premier
      .limit(limit * 3); // Prendre plus pour filtrer ensuite

    if (error) throw error;

    // Récupérer les IDs des users qu'on suit déjà
    const { data: following } = await supabase
      .from('user_relationships')
      .select('following_id')
      .eq('follower_id', currentUserId);

    const followingIds = following?.map(f => f.following_id) || [];

    // Filtrer les users qu'on ne suit pas encore
    const suggested = (data || [])
      .filter(user => !followingIds.includes(user.id))
      .slice(0, limit);

    return { success: true, data: suggested };
  } catch (error) {
    console.error('Get suggested users error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les utilisateurs populaires (top followers)
 */
export const getPopularUsers = async (currentUserId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, show_full_name, followers_count, posts_count')
      .neq('id', currentUserId)
      .gt('followers_count', 0) // Au moins 1 follower
      .order('followers_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get popular users error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère un profil utilisateur par ID
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère des utilisateurs récents (nouveaux inscrits)
 */
export const getNewUsers = async (currentUserId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, show_full_name, followers_count, posts_count, created_at')
      .neq('id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get new users error:', error);
    return { success: false, error: error.message };
  }
};