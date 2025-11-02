import { supabase } from '../lib/supabase'

/**
 * Signaler un utilisateur
 */
export const reportUser = async (reporterId, reportedUserId, reason) => {
  try {
    if (!reason || reason.trim().length < 10) {
      return { success: false, error: 'Reason must be at least 10 characters' };
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason: reason.trim(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Report user error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les reports d'un utilisateur (ses propres signalements)
 */
export const getUserReports = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id,
        reported_user_id,
        reason,
        status,
        created_at,
        profiles:reported_user_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
      .eq('reporter_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get user reports error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Vérifie si un user a déjà signalé un autre user
 */
export const checkIfAlreadyReported = async (reporterId, reportedUserId) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', reporterId)
      .eq('reported_user_id', reportedUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { success: true, alreadyReported: !!data };
  } catch (error) {
    console.error('Check if already reported error:', error);
    return { success: false, error: error.message };
  }
};