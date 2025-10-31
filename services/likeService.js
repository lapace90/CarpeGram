import { supabase } from '../lib/supabase'

/**
 * Vérifie si l'utilisateur a liké un post
 */
export const checkIfLiked = async (postId, userId) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { success: true, liked: !!data };
  } catch (error) {
    console.error('Check if liked error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Like un post
 */
export const likePost = async (postId, userId) => {
  try {
    // Vérifier si déjà liké
    const checkResult = await checkIfLiked(postId, userId);
    if (checkResult.liked) {
      return { success: true, message: 'Already liked' };
    }

    // Créer le like
    const { error } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: userId,
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Like post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Unlike un post
 */
export const unlikePost = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Unlike post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère le nombre de likes d'un post
 */
export const getLikesCount = async (postId) => {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;

    return { success: true, count };
  } catch (error) {
    console.error('Get likes count error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère tous les utilisateurs qui ont liké un post
 */
export const getPostLikes = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        user_id,
        created_at,
        profiles:user_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get post likes error:', error);
    return { success: false, error: error.message };
  }
};