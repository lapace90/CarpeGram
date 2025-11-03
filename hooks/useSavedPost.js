import { useState, useEffect } from 'react';
import { savePost, unsavePost, checkIfSaved } from '../services/savedPostsService';
import handleError from '../lib/errorHandler';

export const useSavedPost = (postId, userId) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Vérifier le statut saved au montage
  useEffect(() => {
    let isMounted = true;

    const checkUserSaved = async () => {
      if (!userId || !postId) {
        setChecking(false);
        return;
      }

      setChecking(true);
      const result = await checkIfSaved(userId, postId);
      
      if (isMounted && result.success) {
        setIsSaved(result.isSaved);
      }
      
      if (isMounted) {
        setChecking(false);
      }
    };

    checkUserSaved();

    return () => {
      isMounted = false;
    };
  }, [postId, userId]);

  const toggleSave = async () => {
    if (!userId || loading || checking) return;

    const previousSaved = isSaved;

    // Optimistic update
    setIsSaved(!isSaved);
    setLoading(true);

    const result = isSaved 
      ? await unsavePost(userId, postId)
      : await savePost(userId, postId);

    setLoading(false);

    if (!result.success) {
      // Rollback on error
      setIsSaved(previousSaved);
      handleError(result, 'Save');
    }

    return result.success;
  };

  return {
    isSaved,
    loading: loading || checking,
    toggleSave,
  };
};