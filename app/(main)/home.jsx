import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, BackHandler, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useIsFocused } from '@react-navigation/native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useTheme } from '../../contexts/ThemeContext'
import { commonStyles } from '../../constants/commonStyles'
import { hp, wp } from '../../helpers/common'
import { useAuth } from '../../contexts/AuthContext'
import { fetchFeedPosts } from '../../services/postService'
import PostCard from '../../components/post/PostCard'
import Icon from '../../assets/icons'
import { useRouter } from 'expo-router'
import EmptyState from '../../components/EmptyState'
import BubblesLoader from '../../components/animations/BubblesLoader'
import { useNotifications } from '../../hooks/useNotifications'
import WeatherWidget from '../../components/weather/WeatherWidget';

const Home = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { user } = useAuth(); 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { unreadCount } = useNotifications(user?.id);

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  useEffect(() => {
    if (!isFocused) return;

    const backAction = () => {
      Alert.alert(
        'Exit Carpegram',
        'Are you sure you want to quit?',
        [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel'
          },
          {
            text: 'Exit',
            onPress: () => BackHandler.exitApp()
          }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isFocused]);

  const loadPosts = async () => {
    setLoading(true);
    const result = await fetchFeedPosts(user?.id);

    if (result.success) {
      setPosts(result.data || []);
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
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
      <View style={[
        styles.headerGradient, 
        { 
          backgroundColor: theme.colors.primary,
          borderBottomLeftRadius: theme.radius.xl,
          borderBottomRightRadius: theme.radius.xl,
          shadowColor: theme.colors.dark,
        }
      ]}>
        <View style={[commonStyles.flexRowBetween, styles.header]}>
          <View style={styles.logoSection}>
            <Text style={[styles.logo, { fontWeight: theme.fonts.extraBold }]}>Carpegram</Text>
            <Text style={styles.logoEmoji}>🎣</Text>
          </View>
          <View style={[commonStyles.flexRow, styles.headerActions]}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/notifications')}
            >
              <Icon name="heart" size={26} strokeWidth={2} color={theme.colors.card} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.colors.rose, borderColor: theme.colors.primary }]}>
                  <Text style={[styles.badgeText, { fontWeight: theme.fonts.bold }]}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/events')}
            >
              <Icon name="calendar" size={26} strokeWidth={2} color={theme.colors.card} />
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/messages')}
            >
              <Icon name="send" size={26} strokeWidth={2} color={theme.colors.card} />
            </Pressable>
          </View>
        </View>
      </View>
      <WeatherWidget />
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.gray + '10'}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <BubblesLoader size={80} color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textLight, fontWeight: theme.fonts.medium }]}>
            Loading your feed...
          </Text>
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
    paddingTop: hp(1),
    paddingBottom: hp(2),
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
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: hp(1.2),
  },
  listContainer: {
    paddingTop: 0,
    paddingHorizontal: wp(4),
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(10),
  },
  loadingText: {
    fontSize: hp(1.8),
    marginTop: hp(2),
  },
});