import { useState, useEffect } from 'react';
import { likePost, unlikePost, checkIfLiked } from '../services/likeService';

export const useLike = (postId, initialLikesCount, userId) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && postId) {
      checkUserLike();
    }
  }, [postId, userId]);

  useEffect(() => {
    setLikesCount(initialLikesCount || 0);
  }, [initialLikesCount]);

  const checkUserLike = async () => {
    const result = await checkIfLiked(postId, userId);
    if (result.success) {
      setLiked(result.liked);
    }
  };

  const toggleLike = async () => {
    if (!userId || loading) return;

    const previousLiked = liked;
    const previousCount = likesCount;

    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    setLoading(true);

    const result = liked 
      ? await unlikePost(postId, userId)
      : await likePost(postId, userId);

    setLoading(false);

    if (!result.success) {
      setLiked(previousLiked);
      setLikesCount(previousCount);
      console.error('Toggle like failed:', result.error);
    }
  };

  return {
    liked,
    likesCount,
    loading,
    toggleLike,
  };
};