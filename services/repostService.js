import { supabase } from '../lib/supabase'

/**
 * Check if user has already reposted a post
 */
export const checkIfReposted = async (userId, postId) => {
  try {
    const { data, error } = await supabase
      .from('reposts')
      .select('id, privacy, comment')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      success: true,
      isReposted: !!data,
      privacy: data?.privacy,
      comment: data?.comment
    };
  } catch (error) {
    console.error('Check if reposted error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a repost with privacy setting and optional comment
 */
export const createRepost = async (userId, postId, privacy = 'public', comment = null) => {
  try {
    // Check if already reposted
    const checkResult = await checkIfReposted(userId, postId);
    if (checkResult.isReposted) {
      return { success: true, message: 'Already reposted' };
    }

    // Create repost
    const { data, error } = await supabase
      .from('reposts')
      .insert({
        user_id: userId,
        post_id: postId,
        privacy: privacy,
        comment: comment ? comment.trim() : null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Create repost error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a repost
 */
export const deleteRepost = async (userId, postId) => {
  try {
    const { error } = await supabase
      .from('reposts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete repost error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update repost privacy or comment
 */
export const updateRepost = async (userId, postId, updates) => {
  try {
    const { error } = await supabase
      .from('reposts')
      .update(updates)
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Update repost error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's reposts with full post data
 */
export const getUserReposts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('reposts')
      .select(`
        id,
        user_id,
        privacy,
        comment,
        created_at,
        profiles:user_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        ),
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

    // Flatten data: add repost info to posts
    const repostsWithPosts = (data || []).map(repost => ({
      ...repost.posts,
      is_repost: true,
      repost_id: repost.id,
      repost_user_id: repost.user_id,
      repost_comment: repost.comment,
      repost_privacy: repost.privacy,
      reposted_at: repost.created_at,
      repost_profiles: repost.profiles,        // TON profil (celui qui reposte)
      original_profiles: repost.posts.profiles, // Profil de l'auteur original
    }));

    return { success: true, data: repostsWithPosts };
  } catch (error) {
    console.error('Get user reposts error:', error);
    return { success: false, error: error.message };
  }
};