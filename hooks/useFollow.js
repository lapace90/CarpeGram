import { useState, useEffect } from 'react';
import { followUser, unfollowUser, checkIfFollowing } from '../services/followService';
import handleError from '../lib/errorHandler';

export const useFollow = (currentUserId, targetUserId, initialFollowersCount) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId) {
      checkUserFollow();
    }
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    setFollowersCount(initialFollowersCount || 0);
  }, [initialFollowersCount]);

  const checkUserFollow = async () => {
    const result = await checkIfFollowing(currentUserId, targetUserId);
    if (result.success) {
      setIsFollowing(result.isFollowing);
    }
  };

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId || loading || currentUserId === targetUserId) return;

    const previousFollowing = isFollowing;
    const previousCount = followersCount;

    // Optimistic update
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);

    setLoading(true);

    const result = isFollowing
      ? await unfollowUser(currentUserId, targetUserId)
      : await followUser(currentUserId, targetUserId);

    setLoading(false);

    if (!result.success) {
      // Rollback on error
      setIsFollowing(previousFollowing);
      setFollowersCount(previousCount);
      handleError(result, 'Follow');
    }
  };

  return {
    isFollowing,
    followersCount,
    loading,
    toggleFollow,
  };
};