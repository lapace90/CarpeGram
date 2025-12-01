import { supabase } from '../lib/supabase';

export const mapService = {
  // Récupérer tous les éléments de la carte
  async getMapData(bounds) {
    try {
      const [spots, stores, users] = await Promise.all([
        this.getSpotsInArea(bounds),
        this.getStoresInArea(bounds),
        this.getUsersInArea(bounds),
      ]);

      return { 
        success: true, 
        data: { spots: spots.data, stores: stores.data, users: users.data }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getSpotsInArea(bounds) {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select(`
          *,
          profiles!spots_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .gte('latitude', bounds.southWest.latitude)
        .lte('latitude', bounds.northEast.latitude)
        .gte('longitude', bounds.southWest.longitude)
        .lte('longitude', bounds.northEast.longitude);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

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
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getUsersInArea(bounds) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          *,
          profiles!user_locations_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .gte('latitude', bounds.southWest.latitude)
        .lte('latitude', bounds.northEast.latitude)
        .gte('longitude', bounds.southWest.longitude)
        .lte('longitude', bounds.northEast.longitude);

      // Vérifier si on suit chaque utilisateur
      if (data && user) {
        const userIds = data.map(u => u.user_id);
        const { data: relationships } = await supabase
          .from('user_relationships')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds);

        const followingIds = relationships?.map(r => r.following_id) || [];
        
        // Masquer le nom si on ne suit pas
        const processedData = data.map(u => ({
          ...u,
          profiles: {
            ...u.profiles,
            username: followingIds.includes(u.user_id) ? u.profiles.username : 'Pêcheur Carpegram'
          }
        }));

        return { data: processedData, error: null };
      }

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

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
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

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
      return { success: false, error: error.message };
    }
  },

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
      return { success: false, error: error.message };
    }
  },

  async deleteSpot(spotId) {
    try {
      const { error } = await supabase
        .from('spots')
        .delete()
        .eq('id', spotId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};