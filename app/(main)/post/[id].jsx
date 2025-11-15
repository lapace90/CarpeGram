import { View, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import PostDetail from '../../../components/post/PostDetail';

const PostDetailPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    // Get current user
    const { user } = useAuth();
    setUser(user);

    // Fetch post
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          show_full_name
        )
      `)
      .eq('id', id)
      .single();

    if (!error && data) {
      setPost(data);
    }
    
    setLoading(false);
  };

  if (loading || !post) {
    return <View style={styles.loading} />;
  }

  return (
    <PostDetail
      visible={true}
      onClose={() => router.back()}
      post={post}
      currentUserId={user?.id}
      onDelete={() => router.back()}
    />
  );
};

export default PostDetailPage;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: 'white',
  },
});