import { supabase } from '../lib/supabase';

/**
 * Créer un event
 */
export const createEvent = async (creatorId, title, description, eventDate, endDate, location, maxParticipants = null) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .insert({
                creator_id: creatorId,
                title,
                description,
                event_date: eventDate,
                end_date: endDate, // ← AJOUTÉ
                location,           // ← AJOUTÉ
                max_participants: maxParticipants,
            })
            .select(`
        *,
        creator:creator_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
            .single();

        if (error) {
            console.error('Create event error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Create event error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Récupérer un event par ID
 */
export const getEventById = async (eventId, currentUserId = null) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select(`
        *,
        creator:creator_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
            .eq('id', eventId)
            .single();

        if (error) {
            console.error('Get event error:', error);
            return { success: false, error: error.message };
        }

        // Vérifier si l'utilisateur participe
        if (currentUserId) {
            const { data: participation } = await supabase
                .from('event_participants')
                .select('id')
                .eq('event_id', eventId)
                .eq('user_id', currentUserId)
                .single();

            data.is_participant = !!participation;
        }

        return { success: true, data };
    } catch (error) {
        console.error('Get event error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Récupérer les events à venir
 */
export const getUpcomingEvents = async (limit = 20, offset = 0) => {
    try {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('events')
            .select(`
        *,
        creator:creator_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
            .gte('event_date', now)
            .order('event_date', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Get upcoming events error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Get upcoming events error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Récupérer les events créés par un utilisateur
 */
export const getUserEvents = async (userId, limit = 20) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select(`
        *,
        creator:creator_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
            .eq('creator_id', userId)
            .order('event_date', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Get user events error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Get user events error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Récupérer les events auxquels un utilisateur participe
 */
export const getUserParticipatingEvents = async (userId, limit = 20) => {
    try {
        const { data, error } = await supabase
            .from('event_participants')
            .select(`
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
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Get participating events error:', error);
            return { success: false, error: error.message };
        }

        // Flatten la structure
        const events = data.map(item => item.event).filter(e => e !== null);

        return { success: true, data: events };
    } catch (error) {
        console.error('Get participating events error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Rejoindre un event
 */
export const joinEvent = async (eventId, userId) => {
    try {
        // Vérifier si l'event est complet
        const { data: event } = await supabase
            .from('events')
            .select('max_participants, participants_count')
            .eq('id', eventId)
            .single();

        if (event?.max_participants && event.participants_count >= event.max_participants) {
            return { success: false, error: 'Event is full' };
        }

        const { data, error } = await supabase
            .from('event_participants')
            .insert({
                event_id: eventId,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Join event error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Join event error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Quitter un event
 */
export const leaveEvent = async (eventId, userId) => {
    try {
        const { error } = await supabase
            .from('event_participants')
            .delete()
            .eq('event_id', eventId)
            .eq('user_id', userId);

        if (error) {
            console.error('Leave event error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Leave event error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Récupérer les participants d'un event
 */
export const getEventParticipants = async (eventId, limit = 50) => {
    try {
        const { data, error } = await supabase
            .from('event_participants')
            .select(`
        created_at,
        user:user_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('Get event participants error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Get event participants error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Mettre à jour un event
 */
export const updateEvent = async (eventId, updates) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', eventId)
            .select(`
        *,
        creator:creator_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
            .single();

        if (error) {
            console.error('Update event error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Update event error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Supprimer un event
 */
export const deleteEvent = async (eventId) => {
    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) {
            console.error('Delete event error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete event error:', error);
        return { success: false, error: error.message };
    }
};