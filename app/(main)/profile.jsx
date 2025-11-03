import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'
import Icon from '../../assets/icons'
import { pickAndUploadAvatar } from '../../services/imageService'
import PostsGrid from '../../components/post/PostsGrid'
import PostDetail from '../../components/post/PostDetail'
import FollowersModal from '../../components/FollowersModal'
import FollowingModal from '../../components/FollowingModal'
import ProfileMenu from '../../components/ProfileMenu'
import ProfileTabs from '../../components/ProfileTabs'
import { useProfileTabs } from '../../hooks/useProfileTabs'

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const {
    activeTab,
    loading: tabsLoading,
    currentData,
    postsCount,
    sharedCount,
    savedCount,
    switchTab,
    refreshAllTabs,
  } = useProfileTabs(user?.id, true);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
    }

    setLoading(false);
  }

  const handleAvatarChange = async () => {
    setLoading(true);
    await pickAndUploadAvatar(user.id, () => {
      getUserData();
    });
    setLoading(false);
  }

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handleDeletePost = async () => {
    await refreshAllTabs();
    await getUserData();
  };

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header avec username */}
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>@{profile?.username}</Text>
              <Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
                <Icon name="threeDotsHorizontal" size={20} color="white" />
              </Pressable>
            </View>

            {/* Avatar qui chevauche */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: `${profile.avatar_url}?t=${Date.now()}` }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Icon name="user" size={50} color={theme.colors.primary} />
                  </View>
                )}
                <Pressable style={styles.cameraButton} onPress={handleAvatarChange}>
                  <Icon name="camera" size={14} color="white" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Info Section - Plus compact */}
          <View style={styles.infoSection}>
            {profile?.show_full_name && profile?.first_name && (
              <Text style={styles.fullName}>
                {profile.first_name} {profile.last_name || ''}
              </Text>
            )}

            {profile?.angler_since && (
              <View style={styles.anglerBadge}>
                <Text style={styles.anglerBadgeText}>
                  🎣 Angler since {profile.angler_since}
                </Text>
              </View>
            )}
          </View>

          {/* Stats Cards - Plus compactes */}
          <View style={styles.statsSection}>
            {/* Catches */}
            <View style={[styles.statCard, { backgroundColor: '#f0a14120' }]}>
              {/* <View style={[styles.statIcon, { backgroundColor: '#FF6B6B' }]}>
                <Icon name="image" size={18} color="white" />
              </View> */}
              <Text style={styles.statNumber}>{postsCount}</Text>
              <Text style={styles.statLabel}>Catches</Text>
            </View>

            {/* Followers */}
            <Pressable 
              style={[styles.statCard, { backgroundColor: '#4ECDC420' }]}
              onPress={() => setShowFollowers(true)}
            >
              {/* <View style={[styles.statIcon, { backgroundColor: '#4ECDC4' }]}>
                <Icon name="heart" size={18} color="white" />
              </View> */}
              <Text style={styles.statNumber}>{profile?.followers_count || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </Pressable>

            {/* Following */}
            <Pressable 
              style={[styles.statCard, { backgroundColor: '#29ea2620' }]}
              onPress={() => setShowFollowing(true)}
            >
              {/* <View style={[styles.statIcon, { backgroundColor: '#95E1D3' }]}>
                <Icon name="user" size={18} color="white" />
              </View> */}
              <Text style={styles.statNumber}>{profile?.following_count || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </Pressable>
          </View>

          {/* Bio & Location */}
          {(profile?.bio || profile?.location) && (
            <View style={styles.detailsCard}>
              {profile?.bio && (
                <View style={[styles.bioSection, profile?.location && { marginBottom: hp(1) }]}>
                  <View style={styles.sectionHeader}>
                    <Icon name="edit" size={16} color={theme.colors.primary} />
                    <Text style={styles.sectionHeaderText}>Bio</Text>
                  </View>
                  <Text style={styles.bioText}>{profile.bio}</Text>
                </View>
              )}
              
              {profile?.location && (
                <View style={[styles.locationSection, profile?.bio && { paddingTop: hp(0.5) }]}>
                  <Icon name="location" size={16} color={theme.colors.primary} />
                  <Text style={styles.locationText}>{profile.location}</Text>
                </View>
              )}
            </View>
          )}

          {/* Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabPress={switchTab}
            showSaved={true}
            // postsCount={postsCount}
            // sharedCount={sharedCount}
            // savedCount={savedCount}
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
                : activeTab === 'shared'
                ? "No shared catches"
                : "No saved catches"
            }
            emptyText={
              activeTab === 'posts'
                ? "Share your first catch!"
                : activeTab === 'shared'
                ? "Share catches from other anglers"
                : "Save catches to view them later"
            }
            emptyIcon="image"
            showButton={activeTab === 'posts'}
            buttonText="Share First Catch"
            onButtonPress={() => router.push('/newPost')}
          />

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Modals */}
        <PostDetail
          visible={showPostDetail}
          onClose={() => setShowPostDetail(false)}
          post={selectedPost}
          currentUserId={user?.id}
          onDelete={handleDeletePost}
        />

        <FollowersModal
          visible={showFollowers}
          onClose={() => setShowFollowers(false)}
          userId={user?.id}
          currentUserId={user?.id}
        />

        <FollowingModal
          visible={showFollowing}
          onClose={() => setShowFollowing(false)}
          userId={user?.id}
          currentUserId={user?.id}
        />

        <ProfileMenu
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          profile={profile}
          onUpdate={getUserData}
        />
      </View>
    </ScreenWrapper>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header - Plus compact
  headerGradient: {
    backgroundColor: theme.colors.primary,
    // paddingBottom: hp(1),
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
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  // Avatar - Plus petit
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
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  
  // Info - Plus compact
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
  
  // Stats Cards - Plus compactes
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
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.3),
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
  
  // Details Card - Plus compacte
  detailsCard: {
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
  },
  bioSection: {
    // marginBottom appliqué conditionnellement
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: hp(0.5),
  },
  sectionHeaderText: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
  bioText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    lineHeight: hp(2),
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
  },
});