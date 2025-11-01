import { supabase } from '../lib/supabase'

/**
 * Upload une image vers le storage Supabase
 */
const uploadPostImage = async (userId, imageUri) => {
  try {
    const fileExt = imageUri.split('.').pop().toLowerCase();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Crée un post dans la database
 */
export const createPost = async (postData) => {
  try {
    const {
      user_id,
      image_uri,
      description,
      fish_species,
      fish_weight,
      bait,
      spot,
      privacy,
    } = postData;

    // 1. Upload image
    const uploadResult = await uploadPostImage(user_id, image_uri);

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    // 2. Insert post dans la database
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id,
        image_url: uploadResult.url,
        description,
        fish_species,
        fish_weight,
        bait,
        spot,
        privacy,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Create post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime un post (future feature)
 */
export const deletePost = async (postId, userId) => {
  try {
    // 1. Récupérer l'image URL du post
    const { data: post } = await supabase
      .from('posts')
      .select('image_url')
      .eq('id', postId)
      .eq('user_id', userId)
      .single();

    if (!post) throw new Error('Post not found');

    // 2. Supprimer l'image du storage
    const fileName = post.image_url.split('/').pop();
    await supabase.storage
      .from('posts')
      .remove([`${userId}/${fileName}`]);

    // 3. Supprimer le post de la database
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les posts pour le feed (future feature)
 */
export const fetchPosts = async (userId, limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        ),
        likes:likes(count),
        comments:comments(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Fetch posts error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les posts pour le feed (Home)
 * Inclut les posts publics + les posts des gens qu'on suit
 */
export const fetchFeedPosts = async (userId, limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('posts')
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
      .eq('privacy', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Fetch feed error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les posts d'un utilisateur spécifique (Profile)
 */
export const fetchUserPosts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Fetch user posts error:', error);
    return { success: false, error: error.message };
  }
};
/**
 * Récupère les posts d'un utilisateur avec limit optionnel
 * Utilisé pour afficher les posts sur le profil d'un user
 */
export const getUserPosts = async (userId, limit = null) => {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get user posts error:', error);
    return { success: false, error: error.message };
  }
};