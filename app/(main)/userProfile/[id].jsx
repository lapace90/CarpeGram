import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../../components/ScreenWrapper'
import { theme } from '../../../constants/theme'
import { hp, wp } from '../../../helpers/common'
import { supabase } from '../../../lib/supabase'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Icon from '../../../assets/icons'
import { getUserProfile } from '../../../services/userService'
import { fetchUserPosts } from '../../../services/postService'
import PostsGrid from '../../../components/post/PostsGrid'
import PostDetail from '../../../components/post/PostDetail'
import FollowButton from '../../../components/FollowButton'
import { useFollow } from '../../../hooks/useFollow'
import FollowersModal from '../../../components/FollowersModal'
import FollowingModal from '../../../components/FollowingModal'
import UserProfileMenu from '../../../components/UserProfileMenu'

const UserProfile = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { isFollowing, followersCount, loading: followLoading, toggleFollow } = useFollow(
    currentUser?.id,
    id,
    profile?.followers_count
  );

  useEffect(() => {
    loadUserProfile();
  }, [id]);

  const loadUserProfile = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const profileResult = await getUserProfile(id);
    if (profileResult.success) {
      setProfile(profileResult.data);
    }

    const postsResult = await fetchUserPosts(id);
    if (postsResult.success) {
      setPosts(postsResult.data || []);
    }

    setLoading(false);
  };

  const handleMenuAction = async (action) => {
    if (action === 'unfollow' || action === 'block') {
      // Recharger le profil pour mettre à jour le bouton Follow/Following
      await loadUserProfile();
    }
  };

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const displayName = profile?.show_full_name && profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`
    : profile?.username;

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!profile) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.center}>
          <Icon name="user" size={60} color={theme.colors.textLight} />
          <Text style={styles.errorText}>User not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>@{profile.username}</Text>
          {currentUser && currentUser.id !== profile.id ? (
            <Pressable
              style={styles.menuBtn}
              onPress={() => setShowMenu(true)}
            >
              <Icon name="threeDotsHorizontal" size={24} color={theme.colors.text} />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatar}>
                  <Icon name="user" size={60} color={theme.colors.primary} />
                </View>
              )}
            </View>

            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>

            {profile.angler_since && (
              <Text style={styles.userBadge}>
                🎣 Angler since {profile.angler_since}
              </Text>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{posts.length}</Text>
                <Text style={styles.statLabel}>Catches</Text>
              </View>

              {/* Followers - Cliquable */}
              <Pressable
                style={styles.statBox}
                onPress={() => setShowFollowers(true)}
              >
                <Text style={styles.statNumber}>{followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </Pressable>

              {/* Following - Cliquable */}
              <Pressable
                style={styles.statBox}
                onPress={() => setShowFollowing(true)}
              >
                <Text style={styles.statNumber}>{profile.following_count || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </Pressable>
            </View>

            {/* Follow Button - Seulement si on ne suit PAS encore */}
            {currentUser && currentUser.id !== profile.id && !isFollowing && (
              <View style={styles.actionButtons}>
                <FollowButton
                  isFollowing={false}
                  onPress={toggleFollow}
                  loading={followLoading}
                  size="large"
                  style={styles.followButton}
                />
              </View>
            )}
          </View>

          {/* Bio */}
          {profile.bio && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="edit" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}

          {/* Location */}
          {profile.location && (
            <View style={styles.locationContainer}>
              <Icon name="location" size={18} color={theme.colors.textLight} />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          )}

          {/* Posts Grid */}
          <View style={styles.postsHeader}>
            <Icon name="image" size={22} color={theme.colors.primary} />
            <Text style={styles.postsTitle}>Catches</Text>
          </View>

          <PostsGrid
            posts={posts}
            loading={false}
            columns={3}
            gap={2}
            showStats={true}
            showSpecies={true}
            onPostPress={handlePostPress}
            emptyTitle="No catches yet"
            emptyText="This angler hasn't shared any catches"
            emptyIcon="image"
          />

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Post Detail Modal */}
        <PostDetail
          visible={showPostDetail}
          onClose={() => setShowPostDetail(false)}
          post={selectedPost}
          currentUserId={currentUser?.id}
        />

        {/* Followers Modal */}
        <FollowersModal
          visible={showFollowers}
          onClose={() => setShowFollowers(false)}
          userId={id}
          currentUserId={currentUser?.id}
        />

        {/* Following Modal */}
        <FollowingModal
          visible={showFollowing}
          onClose={() => setShowFollowing(false)}
          userId={id}
          currentUserId={currentUser?.id}
        />

        {/* User Profile Menu */}
        {currentUser && currentUser.id !== profile.id && (
          <UserProfileMenu
            visible={showMenu}
            onClose={() => setShowMenu(false)}
            userId={currentUser.id}
            targetUserId={id}
            targetUsername={profile?.username}
            isFollowing={isFollowing}
            onActionComplete={handleMenuAction}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  errorText: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textLight,
    marginTop: 15,
  },
  backLink: {
    fontSize: hp(1.8),
    color: theme.colors.primary,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  backBtn: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: 12,
  },
  username: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginTop: 4,
  },
  userBadge: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 20,
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: wp(5),
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  bioText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    lineHeight: hp(2.5),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: wp(5),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  locationText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: wp(5),
    paddingVertical: 16,
    backgroundColor: theme.colors.gray,
  },
  postsTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  menuBtn: {
    padding: 8,
  },
});