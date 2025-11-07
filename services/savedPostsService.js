import { supabase } from '../lib/supabase';

/**
 * Check if a post is saved by the user
 */
export const checkIfPostSaved = async (userId, postId) => {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (error) throw error;

    return { success: true, data: !!data };
  } catch (error) {
    console.error('Check saved post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save a post
 */
export const savePost = async (userId, postId) => {
  try {
    const { error } = await supabase
      .from('saved_posts')
      .insert({
        user_id: userId,
        post_id: postId,
      });

    // Ignore duplicate errors (already saved)
    if (error && error.code !== '23505') {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Save post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Unsave a post
 */
export const unsavePost = async (userId, postId) => {
  try {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Unsave post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's saved posts
 */
export const getUserSavedPosts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`
        id,
        created_at,
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const savedPosts = (data || [])
      .filter(item => item.posts)
      .map(item => item.posts);

    return { success: true, data: savedPosts };
  } catch (error) {
    console.error('Get saved posts error:', error);
    return { success: false, error: error.message };
  }
};