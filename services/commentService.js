import { supabase } from '../lib/supabase'
import { saveCommentMentions } from './mentionService'

/**
 * Récupère tous les commentaires d'un post
 */
export const getPostComments = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
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
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get comments error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Ajoute un commentaire à un post
 */
export const createComment = async (postId, userId, text) => {
  try {
    if (!text || text.trim().length === 0) {
      return { success: false, error: 'Comment cannot be empty' };
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        text: text.trim(),
      })
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
      .single();

    if (error) throw error;

     // Sauvegarder les mentions
    await saveCommentMentions(data.id, userId, text);

    return { success: true, data };
  } catch (error) {
    console.error('Create comment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime un commentaire
 */
export const deleteComment = async (commentId, userId) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete comment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère le nombre de commentaires d'un post
 */
export const getCommentsCount = async (postId) => {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;

    return { success: true, count };
  } catch (error) {
    console.error('Get comments count error:', error);
    return { success: false, error: error.message };
  }
};