import { useState, useEffect } from 'react';
import { createRepost, deleteRepost, checkIfReposted } from '../services/repostService';
import handleError from '../lib/errorHandler';

export const useRepost = (postId, userId) => {
  const [isReposted, setIsReposted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Vérifier le statut du repost au montage
  useEffect(() => {
    let isMounted = true;

    const checkUserRepost = async () => {
      if (!userId || !postId) {
        setChecking(false);
        return;
      }

      setChecking(true);
      const result = await checkIfReposted(userId, postId);
      
      if (isMounted && result.success) {
        setIsReposted(result.isReposted);
      }
      
      if (isMounted) {
        setChecking(false);
      }
    };

    checkUserRepost();

    return () => {
      isMounted = false;
    };
  }, [postId, userId]);

  const toggleRepost = async (privacy = 'public') => {
    if (!userId || loading || checking) return;

    const previousReposted = isReposted;

    // Optimistic update
    setIsReposted(!isReposted);
    setLoading(true);

    const result = isReposted 
      ? await deleteRepost(userId, postId)
      : await createRepost(userId, postId, privacy);

    setLoading(false);

    if (!result.success) {
      // Rollback on error
      setIsReposted(previousReposted);
      handleError(result, 'Repost');
    }

    return result.success;
  };

  return {
    isReposted,
    loading: loading || checking,
    toggleRepost,
  };
};