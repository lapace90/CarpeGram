import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import { searchPostsByHashtag } from '../../services/hashtagService';
import PostCard from '../../components/post/PostCard';
import { supabase } from '../../lib/supabase';
import BubblesLoader from '../../components/animations/BubblesLoader';
import EmptyState from '../../components/EmptyState';

const HashtagScreen = () => {
  const { tag } = useLocalSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, [tag]);

  const loadData = async () => {
    setLoading(true);
    
    // Get current user
    const { user } = useAuth();
    setUser(user);
    
    // Load posts for this hashtag
    const result = await searchPostsByHashtag(tag, user?.id);
    
    if (result.success) {
      setPosts(result.data || []);
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      currentUserId={user?.id}
      onUpdate={onRefresh}
    />
  );

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrowLeft" size={26} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>#{tag}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <BubblesLoader />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrowLeft" size={26} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>#{tag}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Posts count */}
      {posts.length > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </Text>
        </View>
      )}

      {/* Posts list */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="No posts found"
            subtitle={`No posts with #${tag} yet`}
          />
        }
      />
    </ScreenWrapper>
  );
};

export default HashtagScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  countContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  countText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  listContent: {
    paddingBottom: hp(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});