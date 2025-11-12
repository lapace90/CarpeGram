import { supabase } from '../lib/supabase';
import { extractHashtags, isValidHashtag } from '../helpers/textParser';

/**
 * Crée ou met à jour les hashtags d'un post
 * @param {string} postId - L'ID du post
 * @param {string} text - Le texte contenant les hashtags
 */
export const savePostHashtags = async (postId, text) => {
  try {
    const hashtags = extractHashtags(text);
    
    if (hashtags.length === 0) {
      return { success: true };
    }
    
    // Filtrer les hashtags valides
    const validHashtags = hashtags.filter(isValidHashtag);
    
    if (validHashtags.length === 0) {
      return { success: true };
    }
    
    // Pour chaque hashtag, l'insérer ou incrémenter son compteur
    for (const tag of validHashtags) {
      // Upsert le hashtag
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .upsert(
          { tag: tag.toLowerCase() },
          { 
            onConflict: 'tag',
            ignoreDuplicates: false 
          }
        )
        .select()
        .single();
      
      if (hashtagError) {
        console.error('Hashtag upsert error:', hashtagError);
        continue;
      }
      
      // Lier le hashtag au post
      await supabase
        .from('post_hashtags')
        .upsert(
          {
            post_id: postId,
            hashtag_id: hashtagData.id
          },
          {
            onConflict: 'post_id,hashtag_id',
            ignoreDuplicates: true
          }
        );
    }
    
    return { success: true };
  } catch (error) {
    console.error('Save post hashtags error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Recherche des posts par hashtag
 * @param {string} tag - Le hashtag à rechercher (sans le #)
 * @param {string} currentUserId - L'ID de l'utilisateur actuel (pour les RLS)
 */
export const searchPostsByHashtag = async (tag, currentUserId) => {
  try {
    // Récupérer le hashtag
    const { data: hashtagData, error: hashtagError } = await supabase
      .from('hashtags')
      .select('id')
      .eq('tag', tag.toLowerCase())
      .single();
    
    if (hashtagError || !hashtagData) {
      return { success: true, data: [] };
    }
    
    // Récupérer les posts liés à ce hashtag
    const { data, error } = await supabase
      .from('post_hashtags')
      .select(`
        posts:post_id (
          id,
          user_id,
          image_url,
          description,
          fish_species,
          fish_weight,
          bait,
          spot,
          privacy,
          likes_count,
          comments_count,
          created_at,
          profiles:user_id (
            id,
            username,
            avatar_url,
            first_name,
            last_name,
            show_full_name
          )
        )
      `)
      .eq('hashtag_id', hashtagData.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Flatten les résultats
    const posts = (data || [])
      .map(item => item.posts)
      .filter(post => post !== null);
    
    return { success: true, data: posts };
  } catch (error) {
    console.error('Search posts by hashtag error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les hashtags tendance (les plus utilisés)
 * @param {number} limit - Nombre de hashtags à retourner
 */
export const getTrendingHashtags = async (limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('hashtags')
      .select('tag, usage_count')
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Recherche des hashtags par texte
 * @param {string} query - Le texte de recherche
 * @param {number} limit - Nombre de résultats
 */
export const searchHashtags = async (query, limit = 20) => {
  try {
    if (!query || query.trim().length === 0) {
      return { success: true, data: [] };
    }
    
    const searchTerm = query.toLowerCase().replace('#', '');
    
    const { data, error } = await supabase
      .from('hashtags')
      .select('tag, usage_count')
      .ilike('tag', `%${searchTerm}%`)
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Search hashtags error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime les hashtags d'un post
 * @param {string} postId - L'ID du post
 */
export const deletePostHashtags = async (postId) => {
  try {
    const { error } = await supabase
      .from('post_hashtags')
      .delete()
      .eq('post_id', postId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Delete post hashtags error:', error);
    return { success: false, error: error.message };
  }
};