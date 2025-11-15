import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../../components/ScreenWrapper'
import { theme } from '../../../constants/theme'
import { hp, wp } from '../../../helpers/common'
import { supabase } from '../../../lib/supabase'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Icon from '../../../assets/icons'
import { getUserProfile } from '../../../services/userService'
import PostsGrid from '../../../components/post/PostsGrid'
import PostDetail from '../../../components/post/PostDetail'
import FollowButton from '../../../components/FollowButton'
import { useFollow } from '../../../hooks/useFollow'
import FollowersModal from '../../../components/FollowersModal'
import FollowingModal from '../../../components/FollowingModal'
import UserProfileMenu from '../../../components/UserProfileMenu'
import ProfileTabs from '../../../components/ProfileTabs'
import { useProfileTabs } from '../../../hooks/useProfileTabs'
import MessageButton from '../../../components/MessageButton';

const UserProfile = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
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

  const {
    activeTab,
    loading: tabsLoading,
    currentData,
    postsCount,
    sharedCount,
    switchTab,
  } = useProfileTabs(id, false);

  useEffect(() => {
    loadUserProfile();
  }, [id]);

  const loadUserProfile = async () => {
    setLoading(true);

    const { user } = useAuth();
    setCurrentUser(user);

    const profileResult = await getUserProfile(id);
    if (profileResult.success) {
      setProfile(profileResult.data);
    }

    setLoading(false);
  };

  const handleMenuAction = async (action) => {
    if (action === 'unfollow' || action === 'block') {
      await loadUserProfile();
    }
  };

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

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
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header avec username et back button */}
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Icon name="arrowLeft" size={22} color="white" />
              </Pressable>
              <Text style={styles.headerTitle}>@{profile?.username}</Text>
              {currentUser && currentUser.id !== profile.id ? (
                <Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
                  <Icon name="threeDotsHorizontal" size={20} color="white" />
                </Pressable>
              ) : (
                <View style={{ width: 40 }} />
              )}
            </View>

            {/* Avatar qui chevauche */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {profile.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Icon name="user" size={50} color={theme.colors.primary} />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {profile?.show_full_name && profile?.first_name && (
              <Text style={styles.fullName}>
                {profile.first_name} {profile.last_name || ''}
              </Text>
            )}

            {/* Actions (Follow + Message) - Si ce n'est pas son propre profil */}
            {currentUser && currentUser.id !== profile.id && (
              <View style={styles.actionsRow}>
                {/* ← AJOUTE CETTE CONDITION */}
                {!isFollowing && (
                  <FollowButton
                    isFollowing={isFollowing}
                    onPress={toggleFollow}
                    loading={followLoading}
                    size="medium"
                  />
                )}

                <MessageButton
                  currentUserId={currentUser?.id}
                  otherUserId={profile.id}
                  variant="full"
                />
              </View>
            )}

            {/* Angler Badge - Affiché si: pas de current user, son propre profil, ou si on suit déjà */}
            {(!currentUser || currentUser.id === profile.id || isFollowing) && profile?.angler_since && (
              <View style={styles.anglerBadge}>
                <Text style={styles.anglerBadgeText}>
                  🎣 Angler since {profile.angler_since}
                </Text>
              </View>
            )}
          </View>

          {/* Stats Cards - Sans icônes */}
          <View style={styles.statsSection}>
            {/* Catches */}
            <View style={[styles.statCard, { backgroundColor: '#FF6B6B20' }]}>
              <Text style={styles.statNumber}>{postsCount}</Text>
              <Text style={styles.statLabel}>Catches</Text>
            </View>

            {/* Followers */}
            <Pressable
              style={[styles.statCard, { backgroundColor: '#4ECDC420' }]}
              onPress={() => setShowFollowers(true)}
            >
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </Pressable>

            {/* Following */}
            <Pressable
              style={[styles.statCard, { backgroundColor: '#95E1D320' }]}
              onPress={() => setShowFollowing(true)}
            >
              <Text style={styles.statNumber}>{profile?.following_count || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </Pressable>
          </View>

          {/* Bio & Location - Mieux encadrée */}
          {(profile?.bio || profile?.location) && (
            <View style={styles.detailsCard}>
              {profile?.bio && (
                <View style={styles.bioSection}>
                  <View style={styles.bioHeader}>
                    <View style={styles.bioIconBadge}>
                      <Icon name="edit" size={14} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.bioHeaderText}>About</Text>
                  </View>
                  <Text style={styles.bioText}>{profile.bio}</Text>
                </View>
              )}

              {profile?.location && (
                <View style={[styles.locationSection, profile?.bio && { marginTop: hp(1.5) }]}>
                  <View style={styles.locationIconBadge}>
                    <Icon name="location" size={14} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.locationText}>{profile.location}</Text>
                </View>
              )}
            </View>
          )}

          {/* Tabs - Sans Saved */}
          <ProfileTabs
            activeTab={activeTab}
            onTabPress={switchTab}
            showSaved={false}
          // postsCount={postsCount}
          // sharedCount={sharedCount}
          />

          {/* Posts Grid */}
          <PostsGrid
            posts={currentData}
            loading={tabsLoading}
            columns={3}
            gap={2}
            showStats={true}
            showSpecies={true}
            onPostPress={handlePostPress}
            emptyTitle={
              activeTab === 'posts'
                ? "No catches yet"
                : "No shared catches"
            }
            emptyText={
              activeTab === 'posts'
                ? "This angler hasn't shared any catches"
                : "This angler hasn't shared any catches from others"
            }
            emptyIcon="image"
          />

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Modals */}
        <PostDetail
          visible={showPostDetail}
          onClose={() => setShowPostDetail(false)}
          post={selectedPost}
          currentUserId={currentUser?.id}
        />

        <FollowersModal
          visible={showFollowers}
          onClose={() => setShowFollowers(false)}
          userId={id}
          currentUserId={currentUser?.id}
        />

        <FollowingModal
          visible={showFollowing}
          onClose={() => setShowFollowing(false)}
          userId={id}
          currentUserId={currentUser?.id}
        />

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
    backgroundColor: 'white',
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

  // Header
  headerGradient: {
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: hp(16),
    height: hp(16),
    borderRadius: hp(12),
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  // Info
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(1.5),
  },
  fullName: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: hp(1),
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  anglerBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
    borderRadius: theme.radius.xxl,
    marginTop: hp(0.5),
  },
  anglerBadgeText: {
    fontSize: hp(1.4),
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },

  // Stats Cards - Sans icônes
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    gap: wp(2.5),
    marginBottom: hp(1.5),
  },
  statCard: {
    flex: 1,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    alignItems: 'center',
    gap: hp(0.3),
  },
  statNumber: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },

  // Details Card - Mieux encadrée
  detailsCard: {
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
    backgroundColor: 'white',
    borderRadius: theme.radius.xl,
    padding: hp(2),
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '20',
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bioSection: {
    // marginBottom conditionnel
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: hp(1),
  },
  bioIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioHeaderText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  bioText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    lineHeight: hp(2.1),
    paddingLeft: 36, // Aligné avec le texte du header
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
});