import { supabase } from '../lib/supabase'

/**
 * Check if user has saved a post
 */
export const checkIfSaved = async (userId, postId) => {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { success: true, isSaved: !!data };
  } catch (error) {
    console.error('Check if saved error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save a post
 */
export const savePost = async (userId, postId) => {
  try {
    // Check if already saved
    const checkResult = await checkIfSaved(userId, postId);
    if (checkResult.isSaved) {
      return { success: true, message: 'Already saved' };
    }

    // Save post
    const { error } = await supabase
      .from('saved_posts')
      .insert({
        user_id: userId,
        post_id: postId,
      });

    if (error) throw error;

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
 * Get user's saved posts with full post data
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

    // Flatten data: add saved info to posts
    const savedPostsWithData = (data || []).map(saved => ({
      ...saved.posts,
      saved_id: saved.id,
      saved_at: saved.created_at,
    }));

    return { success: true, data: savedPostsWithData };
  } catch (error) {
    console.error('Get user saved posts error:', error);
    return { success: false, error: error.message };
  }
};