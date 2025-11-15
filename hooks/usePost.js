import { useState, useEffect } from 'react';
import { getPostById } from '../services/postService';

export const usePost = (postId) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    const result = await getPostById(postId);
    if (result.success) {
      setPost(result.data);
    }
    setLoading(false);
  };

  return { post, loading, refresh: loadPost };
};