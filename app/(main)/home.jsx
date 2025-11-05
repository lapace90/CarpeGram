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
import BubblesLoader from '../../components/animations/BubblesLoader'

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
      onUpdate={onRefresh}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerGradient}>
        <View style={[commonStyles.flexRowBetween, styles.header]}>
          <View style={styles.logoSection}>
            <Text style={styles.logo}>Carpegram</Text>
            <Text style={styles.logoEmoji}>🎣</Text>
          </View>
          <View style={[commonStyles.flexRow, styles.headerActions]}>
            <Pressable style={styles.iconButton}>
              <Icon name="heart" size={26} strokeWidth={2} color="white" />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Icon name="send" size={26} strokeWidth={2} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  // ✅ AJOUTE CE LOADING SCREEN ICI
  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.gray + '10'}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <BubblesLoader size={80} color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your feed...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.gray + '10'}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => `${item.is_repost ? 'repost' : 'post'}-${item.id}`}
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
          <EmptyState 
            iconName="image"
            title="No catches yet"
            message="Follow other anglers to see their catches!"
          />
        }
      />
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: hp(1),
  },
  headerGradient: {
    backgroundColor: theme.colors.primary,
    paddingTop: hp(1),
    paddingBottom: hp(2),
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    paddingHorizontal: wp(5),
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.extraBold,
    color: 'white',
    letterSpacing: 0.5,
  },
  logoEmoji: {
    fontSize: hp(2.8),
  },
  headerActions: {
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  listContainer: {
    paddingTop: 0,
    paddingHorizontal: wp(4),
    paddingBottom: 20,
  },
  // ✅ AJOUTE CES STYLES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(10),
  },
  loadingText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginTop: hp(2),
    fontWeight: theme.fonts.medium,
  },
});