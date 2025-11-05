import { useState, useEffect } from 'react';
import { createRepost, deleteRepost, checkIfReposted } from '../services/repostService';
import handleError from '../lib/errorHandler';

export const useRepost = (postId, userId) => {
  const [isReposted, setIsReposted] = useState(false);
  const [repostData, setRepostData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

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
        if (result.isReposted) {
          setRepostData({
            privacy: result.privacy,
            comment: result.comment
          });
        }
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

  const toggleRepost = async (privacy = 'public', comment = null) => {
    if (!userId || loading || checking) return;

    const previousReposted = isReposted;
    const previousData = repostData;

    // Optimistic update
    setIsReposted(!isReposted);
    if (!isReposted) {
      setRepostData({ privacy, comment });
    }
    setLoading(true);

    const result = isReposted 
      ? await deleteRepost(userId, postId)
      : await createRepost(userId, postId, privacy, comment);

    setLoading(false);

    if (!result.success) {
      // Rollback on error
      setIsReposted(previousReposted);
      setRepostData(previousData);
      handleError(result, 'Repost');
    }

    return result.success;
  };

  return {
    isReposted,
    repostData,
    loading: loading || checking,
    toggleRepost,
  };
};