import { supabase } from '../lib/supabase'

/**
 * Vérifie si l'utilisateur suit un autre utilisateur
 */
export const checkIfFollowing = async (followerId, followingId) => {
  try {
    const { data, error } = await supabase
      .from('user_relationships')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { success: true, isFollowing: !!data };
  } catch (error) {
    console.error('Check if following error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Suivre un utilisateur
 */
export const followUser = async (followerId, followingId) => {
  try {
    // Vérifier si déjà suivi
    const checkResult = await checkIfFollowing(followerId, followingId);
    if (checkResult.isFollowing) {
      return { success: true, message: 'Already following' };
    }

    // Créer la relation
    const { error } = await supabase
      .from('user_relationships')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        is_close_friend: false,
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Follow user error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Ne plus suivre un utilisateur
 */
export const unfollowUser = async (followerId, followingId) => {
  try {
    const { error } = await supabase
      .from('user_relationships')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Unfollow user error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère la liste des followers d'un utilisateur
 */
export const getFollowers = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_relationships')
      .select(`
        follower_id,
        created_at,
        profiles:follower_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name,
          followers_count
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get followers error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère la liste des utilisateurs suivis
 */
export const getFollowing = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_relationships')
      .select(`
        following_id,
        created_at,
        profiles:following_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name,
          followers_count
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get following error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère le nombre de followers et following
 * (Utilise les compteurs dans profiles qui sont mis à jour par triggers)
 */
export const getFollowCounts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('followers_count, following_count')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { 
      success: true, 
      followersCount: data.followers_count || 0,
      followingCount: data.following_count || 0
    };
  } catch (error) {
    console.error('Get follow counts error:', error);
    return { success: false, error: error.message };
  }
};