import { supabase } from '../lib/supabase';
import { uploadImage } from './imageService';

/**
 * Récupérer les messages d'une conversation
 * On récupère les données de base puis on enrichit manuellement
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
          user_id
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Enrichir avec les profils et events
    const enrichedData = await enrichMessages(data || []);

    return { success: true, data: enrichedData };
  } catch (error) {
    console.error('Get conversation messages error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Enrichir les messages avec les profils et events
 */
const enrichMessages = async (messages) => {
  // Collecter les IDs nécessaires
  const userIds = new Set();
  const eventIds = new Set();
  
  messages.forEach(msg => {
    if (msg.post?.user_id) {
      userIds.add(msg.post.user_id);
    }
    if (msg.event_id) {
      eventIds.add(msg.event_id);
    }
  });

  // Récupérer les profils
  let profileMap = {};
  if (userIds.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, show_full_name')
      .in('id', Array.from(userIds));
    
    (profiles || []).forEach(p => {
      profileMap[p.id] = p;
    });
  }

  // Récupérer les events
  let eventMap = {};
  if (eventIds.size > 0) {
    const { data: events } = await supabase
      .from('events')
      .select('id, title, description, event_date, end_date, location, creator_id')
      .in('id', Array.from(eventIds));
    
    // Aussi récupérer les créateurs d'events
    const creatorIds = (events || []).map(e => e.creator_id).filter(Boolean);
    if (creatorIds.length > 0) {
      const { data: creators } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, first_name, last_name, show_full_name')
        .in('id', creatorIds);
      
      (creators || []).forEach(c => {
        profileMap[c.id] = c;
      });
    }
    
    (events || []).forEach(e => {
      eventMap[e.id] = {
        ...e,
        creator: profileMap[e.creator_id] || null
      };
    });
  }

  // Enrichir les messages
  return messages.map(msg => {
    const enriched = { ...msg };
    
    if (msg.post?.user_id && profileMap[msg.post.user_id]) {
      enriched.post = {
        ...msg.post,
        profiles: profileMap[msg.post.user_id]
      };
    }
    
    if (msg.event_id && eventMap[msg.event_id]) {
      enriched.event = eventMap[msg.event_id];
    }
    
    return enriched;
  });
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

/**
 * Récupérer une conversation par ID avec l'autre utilisateur
 */
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