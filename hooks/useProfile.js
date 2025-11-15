import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/userService';

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    const result = await getUserProfile(userId);
    if (result.success) {
      setProfile(result.data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates) => {
    const result = await updateUserProfile(userId, updates);
    if (result.success) {
      await loadProfile();
    }
    return result;
  };

  return { profile, loading, updateProfile, refresh: loadProfile };
};