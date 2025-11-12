import { supabase } from '../lib/supabase';
import { extractMentions, isValidUsername } from '../helpers/textParser';

/**
 * Sauvegarde les mentions d'un post
 * @param {string} postId - L'ID du post
 * @param {string} userId - L'ID de l'utilisateur qui mentionne
 * @param {string} text - Le texte contenant les mentions
 */
export const savePostMentions = async (postId, userId, text) => {
  try {
    const usernames = extractMentions(text);
    
    if (usernames.length === 0) {
      return { success: true };
    }
    
    // Filtrer les usernames valides
    const validUsernames = usernames.filter(isValidUsername);
    
    if (validUsernames.length === 0) {
      return { success: true };
    }
    
    // Récupérer les IDs des utilisateurs mentionnés
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', validUsernames.map(u => u.toLowerCase()));
    
    if (usersError) {
      console.error('Get mentioned users error:', usersError);
      return { success: false, error: usersError.message };
    }
    
    if (!users || users.length === 0) {
      return { success: true }; // Aucun utilisateur trouvé
    }
    
    // Créer les mentions
    const mentions = users.map(user => ({
      post_id: postId,
      comment_id: null,
      mentioned_user_id: user.id,
      mentioning_user_id: userId
    }));
    
    const { error: mentionsError } = await supabase
      .from('mentions')
      .insert(mentions);
    
    if (mentionsError) {
      console.error('Insert mentions error:', mentionsError);
      return { success: false, error: mentionsError.message };
    }
    
    return { success: true, mentionedUsers: users };
  } catch (error) {
    console.error('Save post mentions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sauvegarde les mentions d'un commentaire
 * @param {string} commentId - L'ID du commentaire
 * @param {string} userId - L'ID de l'utilisateur qui mentionne
 * @param {string} text - Le texte contenant les mentions
 */
export const saveCommentMentions = async (commentId, userId, text) => {
  try {
    const usernames = extractMentions(text);
    
    if (usernames.length === 0) {
      return { success: true };
    }
    
    // Filtrer les usernames valides
    const validUsernames = usernames.filter(isValidUsername);
    
    if (validUsernames.length === 0) {
      return { success: true };
    }
    
    // Récupérer les IDs des utilisateurs mentionnés
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', validUsernames.map(u => u.toLowerCase()));
    
    if (usersError) {
      console.error('Get mentioned users error:', usersError);
      return { success: false, error: usersError.message };
    }
    
    if (!users || users.length === 0) {
      return { success: true }; // Aucun utilisateur trouvé
    }
    
    // Créer les mentions
    const mentions = users.map(user => ({
      post_id: null,
      comment_id: commentId,
      mentioned_user_id: user.id,
      mentioning_user_id: userId
    }));
    
    const { error: mentionsError } = await supabase
      .from('mentions')
      .insert(mentions);
    
    if (mentionsError) {
      console.error('Insert mentions error:', mentionsError);
      return { success: false, error: mentionsError.message };
    }
    
    return { success: true, mentionedUsers: users };
  } catch (error) {
    console.error('Save comment mentions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les mentions d'un utilisateur
 * @param {string} userId - L'ID de l'utilisateur
 */
export const getUserMentions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('mentions')
      .select(`
        id,
        created_at,
        mentioning_user:mentioning_user_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        ),
        posts:post_id (
          id,
          image_url,
          description,
          created_at
        ),
        comments:comment_id (
          id,
          text,
          post_id,
          created_at
        )
      `)
      .eq('mentioned_user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get user mentions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime les mentions d'un post
 * @param {string} postId - L'ID du post
 */
export const deletePostMentions = async (postId) => {
  try {
    const { error } = await supabase
      .from('mentions')
      .delete()
      .eq('post_id', postId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Delete post mentions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime les mentions d'un commentaire
 * @param {string} commentId - L'ID du commentaire
 */
export const deleteCommentMentions = async (commentId) => {
  try {
    const { error } = await supabase
      .from('mentions')
      .delete()
      .eq('comment_id', commentId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Delete comment mentions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Vérifie si un username existe
 * @param {string} username - Le username à vérifier (sans le @)
 */
export const checkUsernameExists = async (username) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    
    if (error) throw error;
    
    return { success: true, exists: !!data, user: data };
  } catch (error) {
    console.error('Check username exists error:', error);
    return { success: false, error: error.message };
  }
};