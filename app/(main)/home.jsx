import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { commonStyles } from '../../constants/commonStyles'
import { hp, wp } from '../../helpers/common'
import { supabase } from '../../lib/supabase'
import { fetchFeedPosts } from '../../services/postService'
import PostCard from '../../components/post/PostCard'
import Icon from '../../assets/icons'
import { useRouter } from 'expo-router'
import EmptyState from '../../components/EmptyState'

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
        console.log('Post clicked:', item.id);
      }}
    />
  );

  const renderHeader = () => (
    <View style={[commonStyles.flexRowBetween, styles.header]}>
      <Text style={styles.logo}>Carpegram 🎣</Text>
      <View style={[commonStyles.flexRow, styles.headerActions]}>
        <Pressable style={styles.iconButton}>
          <Icon name="heart" size={26} strokeWidth={1.8} color={theme.colors.text} />
        </Pressable>
        <Pressable style={styles.iconButton}>
          <Icon name="send" size={26} strokeWidth={1.8} color={theme.colors.text} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          !loading && (
            <EmptyState 
              iconName="image"
              title="No posts yet"
              message="Be the first to share your catch!"
              buttonText="Create Post"
              onButtonPress={() => router.push('/newPost')}
            />
          )
        }
      />
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: wp(4),
  },
  header: {
    paddingVertical: hp(2),
    marginBottom: 10,
  },
  logo: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  headerActions: {
    gap: 15,
  },
  iconButton: {
    padding: 6,
  },
});