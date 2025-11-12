import { supabase } from '../lib/supabase'
import { savePostHashtags } from './hashtagService'
import { savePostMentions } from './mentionService'

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

    // 3. Sauvegarder les hashtags et mentions
    if (description) {
      await savePostHashtags(data.id, description);
      await savePostMentions(data.id, user_id, description);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Create post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime un post
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
 * Récupère les posts ET les reposts pour le feed
 */
export const fetchFeedPosts = async (userId, limit = 20, offset = 0) => {
  try {
    if (!userId) {
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
      return { success: true, data: data || [] };
    }

    // 1. Récupérer les posts normaux (les RLS policies gèrent les permissions)
    const { data: posts, error: postsError } = await supabase
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) throw postsError;

    // 2. Récupérer les reposts (aussi filtrés par RLS)
    const { data: reposts, error: repostsError } = await supabase
      .from('reposts')
      .select(`
        id,
        user_id,
        post_id,
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
          *,
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
      .order('created_at', { ascending: false });

    if (repostsError) throw repostsError;

    // 3. Transformer les reposts 
    const transformedReposts = (reposts || []).map(repost => ({
      ...repost.posts,
      is_repost: true,
      repost_id: repost.id,
      repost_user_id: repost.user_id,     
      repost_comment: repost.comment,
      repost_privacy: repost.privacy,     
      reposted_at: repost.created_at,
      repost_profiles: repost.profiles,    // Profil de celui qui a reposté
      original_profiles: repost.posts.profiles, // Profil de l'auteur original
    }));

    // 4. Merger et trier par date
    const allPosts = [
      ...(posts || []).map(p => ({ ...p, sort_date: p.created_at })),
      ...transformedReposts.map(r => ({ ...r, sort_date: r.reposted_at }))
    ].sort((a, b) => new Date(b.sort_date) - new Date(a.sort_date));

    return { success: true, data: allPosts };
  } catch (error) {
    console.error('Fetch feed error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Met à jour un post existant
 */
export const updatePost = async (postId, userId, updates) => {
  try {
    const { error } = await supabase
      .from('posts')
      .update({
        description: updates.description,
        fish_species: updates.fish_species || null,
        fish_weight: updates.fish_weight ? parseFloat(updates.fish_weight) : null,
        bait: updates.bait || null,
        spot: updates.spot || null,
        privacy: updates.privacy,
      })
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Update post error:', error);
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Fetch user posts error:', error);
    return { success: false, error: error.message };
  }
};