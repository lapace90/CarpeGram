import { useState, useEffect } from 'react';
import { getPostComments, createComment, deleteComment } from '../services/commentService';
import { Alert } from 'react-native';

export const useComments = (postId, initialCommentsCount) => {
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount || 0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    const result = await getPostComments(postId);
    
    if (result.success) {
      setComments(result.data);
      setCommentsCount(result.data.length);
    }
    
    setLoading(false);
  };

  const addComment = async (userId, text) => {
    if (!text || text.trim().length === 0) {
      Alert.alert('Error', 'Please enter a comment');
      return false;
    }

    setSubmitting(true);

    const result = await createComment(postId, userId, text);

    setSubmitting(false);

    if (result.success) {
      // Ajouter le nouveau commentaire à la liste
      setComments([...comments, result.data]);
      setCommentsCount(commentsCount + 1);
      return true;
    } else {
      Alert.alert('Error', result.error || 'Failed to add comment');
      return false;
    }
  };

  const removeComment = async (commentId, userId) => {
    // Optimistic update
    const previousComments = [...comments];
    const previousCount = commentsCount;

    setComments(comments.filter(c => c.id !== commentId));
    setCommentsCount(commentsCount - 1);

    const result = await deleteComment(commentId, userId);

    if (!result.success) {
      // Rollback
      setComments(previousComments);
      setCommentsCount(previousCount);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  return {
    comments,
    commentsCount,
    loading,
    submitting,
    loadComments,
    addComment,
    removeComment,
  };
};