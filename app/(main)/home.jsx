import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { supabase } from '../../lib/supabase'
import { fetchFeedPosts } from '../../services/postService'
import PostCard from '../../components/post/PostCard'
import Icon from '../../assets/icons'
import { useRouter } from 'expo-router'

const Home = () => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserAndPosts();
  }, []);

  const getUserAndPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    await loadPosts(user?.id);
  };

  const loadPosts = async (userId) => {
    setLoading(true);
    const result = await fetchFeedPosts(userId);
    
    if (result.success) {
      setPosts(result.data || []);
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts(user?.id);
    setRefreshing(false);
  };

  const renderPost = ({ item }) => (
    <PostCard 
      post={item}
      currentUserId={user?.id}
      onPress={() => {
        // Navigate to post details (future feature)
        console.log('Post clicked:', item.id);
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.logo}>Carpegram 🎣</Text>
      <View style={styles.headerActions}>
        <Pressable style={styles.iconButton}>
          <Icon name="heart" size={26} strokeWidth={1.8} color={theme.colors.text} />
        </Pressable>
        <Pressable style={styles.iconButton}>
          <Icon name="send" size={26} strokeWidth={1.8} color={theme.colors.text} />
        </Pressable>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="image" size={80} strokeWidth={1.5} color={theme.colors.textLight} />
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptyText}>
        Be the first to share your catch! 🎣
      </Text>
      <Pressable 
        style={styles.createButton}
        onPress={() => router.push('/newPost')}
      >
        <Icon name="plus" size={20} color="white" />
        <Text style={styles.createButtonText}>Create Post</Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenWrapper bg="white">
      {renderHeader()}
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={!loading && renderEmpty()}
        onEndReachedThreshold={0.5}
      />
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  logo: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: wp(5),
    paddingTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(15),
    gap: 12,
  },
  emptyTitle: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: 10,
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: wp(10),
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    marginTop: 10,
  },
  createButtonText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
})