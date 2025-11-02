import { useState, useEffect } from 'react';
import { likePost, unlikePost, checkIfLiked } from '../services/likeService';
import handleError from '../lib/errorHandler';

export const useLike = (postId, initialLikesCount, userId) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Vérifier le statut du like au montage et quand userId/postId change
  useEffect(() => {
    let isMounted = true;

    const checkUserLike = async () => {
      if (!userId || !postId) {
        setChecking(false);
        return;
      }

      setChecking(true);
      const result = await checkIfLiked(postId, userId);
      
      if (isMounted && result.success) {
        setLiked(result.liked);
      }
      
      if (isMounted) {
        setChecking(false);
      }
    };

    checkUserLike();

    return () => {
      isMounted = false;
    };
  }, [postId, userId]);

  // Synchroniser le compteur quand il change
  useEffect(() => {
    setLikesCount(initialLikesCount || 0);
  }, [initialLikesCount]);

  const toggleLike = async () => {
    if (!userId || loading || checking) return;

    const previousLiked = liked;
    const previousCount = likesCount;

    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    setLoading(true);

    const result = liked 
      ? await unlikePost(postId, userId)
      : await likePost(postId, userId);

    setLoading(false);

    if (!result.success) {
      // Rollback on error
      setLiked(previousLiked);
      setLikesCount(previousCount);
      handleError(result, 'Like');
    }
  };

  return {
    liked,
    likesCount,
    loading: loading || checking,
    toggleLike,
  };
};