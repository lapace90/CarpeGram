import { supabase } from '../lib/supabase';

export const mapService = {
  /**
   * Récupérer toutes les données de la carte
   */
  async getMapData(bounds) {
    try {
      const [spots, stores, users, events] = await Promise.all([
        this.getSpotsInArea(bounds),
        this.getStoresInArea(bounds),
        this.getUsersInArea(bounds),
        this.getEventsInArea(bounds),
      ]);

      return { 
        success: true, 
        data: { 
          spots: spots.data, 
          stores: stores.data, 
          users: users.data,
          events: events.data,
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  /**
   * Récupérer les spots dans une zone
   */
  async getSpotsInArea(bounds) {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select(`
          *,
          profiles!spots_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .gte('latitude', bounds.southWest.latitude)
        .lte('latitude', bounds.northEast.latitude)
        .gte('longitude', bounds.southWest.longitude)
        .lte('longitude', bounds.northEast.longitude);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get spots error:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les magasins dans une zone
   */
  async getStoresInArea(bounds) {
    try {
      const { data, error } = await supabase
        .from('fishing_stores')
        .select('*')
        .gte('latitude', bounds.southWest.latitude)
        .lte('latitude', bounds.northEast.latitude)
        .gte('longitude', bounds.southWest.longitude)
        .lte('longitude', bounds.northEast.longitude);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get stores error:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les utilisateurs dans une zone (avec gestion privacy et relations)
   */
  async getUsersInArea(bounds) {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          *,
          profiles!user_locations_user_id_fkey (
            id,
            username,
            avatar_url,
            first_name,
            last_name,
            show_full_name
          )
        `)
        .eq('sharing_enabled', true)
        .gte('latitude', bounds.southWest.latitude)
        .lte('latitude', bounds.northEast.latitude)
        .gte('longitude', bounds.southWest.longitude)
        .lte('longitude', bounds.northEast.longitude);

      if (error) throw error;

      // Déterminer les relations pour chaque utilisateur
      if (data && currentUser) {
        const userIds = data.map(u => u.user_id).filter(id => id !== currentUser.id);
        
        // Récupérer les relations avec ces users
        const { data: relationships } = await supabase
          .from('user_relationships')
          .select('following_id, is_close_friend')
          .eq('follower_id', currentUser.id)
          .in('following_id', userIds);

        // Créer un map des relations
        const relationshipMap = {};
        relationships?.forEach(r => {
          relationshipMap[r.following_id] = {
            isFollowing: true,
            isCloseFriend: r.is_close_friend || false,
          };
        });
        
        // Ajouter les infos de relation à chaque user
        const processedData = data
          .filter(u => u.user_id !== currentUser.id) // Exclure soi-même
          .map(u => {
            const relation = relationshipMap[u.user_id] || { isFollowing: false, isCloseFriend: false };
            
            return {
              ...u,
              // Infos de relation pour le marker
              isCloseFriend: relation.isCloseFriend,
              isFollowing: relation.isFollowing,
              isAnonymous: !relation.isFollowing,
              // Masquer le username si on ne suit pas
              profiles: {
                ...u.profiles,
                username: relation.isFollowing 
                  ? u.profiles.username 
                  : 'Carpegram Angler',
                // Masquer aussi le vrai nom
                first_name: relation.isFollowing ? u.profiles.first_name : null,
                last_name: relation.isFollowing ? u.profiles.last_name : null,
                // Masquer l'avatar pour les anonymes
                avatar_url: relation.isFollowing ? u.profiles.avatar_url : null,
              }
            };
          });

        return { data: processedData, error: null };
      }

      // Si pas connecté, tout le monde est anonyme
      const anonymousData = (data || []).map(u => ({
        ...u,
        isCloseFriend: false,
        isFollowing: false,
        isAnonymous: true,
        profiles: {
          ...u.profiles,
          username: 'Carpegram Angler',
          first_name: null,
          last_name: null,
          avatar_url: null,
        }
      }));

      return { data: anonymousData, error: null };
    } catch (error) {
      console.error('Get users error:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les events dans une zone
   */
  async getEventsInArea(bounds) {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          event_date,
          end_date,
          location,
          latitude,
          longitude,
          participants_count,
          max_participants,
          creator:creator_id (
            id,
            username,
            avatar_url
          )
        `)
        .gte('event_date', now)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', bounds.southWest.latitude)
        .lte('latitude', bounds.northEast.latitude)
        .gte('longitude', bounds.southWest.longitude)
        .lte('longitude', bounds.northEast.longitude)
        .order('event_date', { ascending: true })
        .limit(50);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get events error:', error);
      return { data: [], error };
    }
  },

  /**
   * Créer un nouveau spot
   */
  async createSpot(spotData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('spots')
        .insert({
          user_id: user.id,
          ...spotData
        })
        .select(`
          *,
          profiles!spots_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Create spot error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mettre à jour sa position
   */
  async updateUserLocation(location) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update location error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Activer/désactiver le partage de position
   */
  async toggleLocationSharing(enabled, shareWith = 'followers') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          sharing_enabled: enabled,
          share_with: shareWith,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Toggle sharing error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Supprimer un spot
   */
  async deleteSpot(spotId) {
    try {
      const { error } = await supabase
        .from('spots')
        .delete()
        .eq('id', spotId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete spot error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mettre à jour un spot
   */
  async updateSpot(spotId, updates) {
    try {
      const { data, error } = await supabase
        .from('spots')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', spotId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update spot error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Récupérer les spots d'un utilisateur
   */
  async getUserSpots(userId) {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get user spots error:', error);
      return { success: false, error: error.message };
    }
  },
};