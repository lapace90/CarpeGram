import { View, StyleSheet, ActivityIndicator } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { usePost } from '../../../hooks/usePost';
import PostDetail from '../../../components/post/PostDetail';
import ScreenWrapper from '../../../components/common/ScreenWrapper';

const PostDetailPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { post, loading, refresh } = usePost(id);

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!post) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.loading}>
          <Text>Post not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <PostDetail
      visible={true}
      onClose={() => router.back()}
      post={post}
      currentUserId={user?.id}
      onUpdate={refresh}
      onDelete={() => router.back()}
    />
  );
};

export default PostDetailPage;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});