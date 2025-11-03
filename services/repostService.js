import { supabase } from '../lib/supabase'

/**
 * Check if user has already reposted a post
 */
export const checkIfReposted = async (userId, postId) => {
  try {
    const { data, error } = await supabase
      .from('reposts')
      .select('id, privacy')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { 
      success: true, 
      isReposted: !!data,
      privacy: data?.privacy 
    };
  } catch (error) {
    console.error('Check if reposted error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a repost with privacy setting
 */
export const createRepost = async (userId, postId, privacy = 'public') => {
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
 * Update repost privacy
 */
export const updateRepostPrivacy = async (userId, postId, newPrivacy) => {
  try {
    const { error } = await supabase
      .from('reposts')
      .update({ privacy: newPrivacy })
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Update repost privacy error:', error);
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
        privacy,
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

    // Flatten data: add repost info to posts
    const repostsWithPosts = (data || []).map(repost => ({
      ...repost.posts,
      repost_id: repost.id,
      repost_privacy: repost.privacy,
      reposted_at: repost.created_at,
    }));

    return { success: true, data: repostsWithPosts };
  } catch (error) {
    console.error('Get user reposts error:', error);
    return { success: false, error: error.message };
  }
};