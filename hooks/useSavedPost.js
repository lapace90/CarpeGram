import { useState, useEffect } from 'react';
import { checkIfPostSaved, savePost, unsavePost } from '../services/savedPostsService';

export const useSavedPost = (postId, userId) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postId && userId) {
      checkSavedStatus();
    }
  }, [postId, userId]);

  const checkSavedStatus = async () => {
    const result = await checkIfPostSaved(userId, postId);
    if (result.success) {
      setIsSaved(result.data);
    }
  };

  const toggleSave = async () => {
    if (loading || !userId || !postId) return;

    setLoading(true);
    const previousState = isSaved;

    // Optimistic update
    setIsSaved(!previousState);

    try {
      let result;
      if (previousState) {
        result = await unsavePost(userId, postId);
      } else {
        result = await savePost(userId, postId);
      }

      if (!result.success) {
        setIsSaved(previousState);
      }
    } catch (error) {
      console.error('Toggle save error:', error);
      setIsSaved(previousState);
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, toggleSave, loading };
};