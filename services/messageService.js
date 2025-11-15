import { supabase } from '../lib/supabase';
import { uploadImage } from './imageService';

/**
 * Récupérer les messages d'une conversation
 */
export const getConversationMessages = async (conversationId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        ),
        post:post_id (
          id,
          image_url,
          description,
          user_id,
          profiles:user_id (
            username,
            avatar_url
          ),
          event:event_id (
            *,
            creator:creator_id (
              id,
              username,
              avatar_url,
              first_name,
              last_name,
              show_full_name
            )
          )
        ),
        event:event_id (
          *,
          creator:creator_id (
            id,
            username,
            avatar_url,
            first_name,
            last_name,
            show_full_name
          )
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get conversation messages error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Partager un event dans une conversation
 */
export const sendEventMessage = async (conversationId, senderId, eventId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        type: 'event_share',
        event_id: eventId
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Send event message error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un message texte
 */
export const sendTextMessage = async (conversationId, senderId, content) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        type: 'text',
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Send text message error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un message image
 */
export const sendImageMessage = async (conversationId, senderId, imageUri) => {
  try {
    // Upload l'image
    const uploadResult = await uploadImage(imageUri, 'messages');
    if (!uploadResult.success) {
      throw new Error('Image upload failed');
    }

    // Créer le message avec l'URL de l'image
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        type: 'image',
        content: uploadResult.url
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Send image message error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Partager un post dans une conversation
 */
export const sharePost = async (conversationId, senderId, postId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        type: 'post_share',
        post_id: postId,
        content: null
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Share post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Marquer tous les messages d'une conversation comme lus
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('read', false)
      .neq('sender_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return { success: false, error: error.message };
  }
};

export const getConversationById = async (conversationId, currentUserId) => {
  try {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    const otherUserId = conversation.user1_id === currentUserId 
      ? conversation.user2_id 
      : conversation.user1_id;

    const { data: otherUser, error: userError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, show_full_name')
      .eq('id', otherUserId)
      .single();

    if (userError) throw userError;

    return { success: true, data: { conversation, otherUser } };
  } catch (error) {
    console.error('Get conversation error:', error);
    return { success: false, error: error.message };
  }
};