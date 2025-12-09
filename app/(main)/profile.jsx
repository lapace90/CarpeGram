import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/common/ScreenWrapper'
import { useTheme } from '../../contexts/ThemeContext'
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
  const { theme } = useTheme();
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
    refreshSavedTab,
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
      <ScreenWrapper bg={theme.colors.card}>
        <View style={styles.center}>
          <Text style={{ color: theme.colors.text }}>Loading...</Text>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper bg={theme.colors.card}>
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header avec gradient */}
          <View style={[styles.headerGradient, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { fontWeight: theme.fonts.bold }]}>
                @{profile?.username}
              </Text>
              <Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
                <Icon name="threeDotsHorizontal" size={20} color={theme.colors.card} />
              </Pressable>
            </View>

            {/* Avatar qui chevauche */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: `${profile.avatar_url}?t=${Date.now()}` }}
                    style={[styles.avatar, { borderColor: theme.colors.card, shadowColor: theme.colors.dark }]}
                  />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: theme.colors.card, borderColor: theme.colors.card, shadowColor: theme.colors.dark }]}>
                    <Icon name="user" size={50} color={theme.colors.primary} />
                  </View>
                )}
                <Pressable 
                  style={[styles.cameraButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.card }]} 
                  onPress={handleAvatarChange}
                >
                  <Icon name="camera" size={14} color={theme.colors.card} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {profile?.show_full_name && profile?.first_name && (
              <Text style={[styles.fullName, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                {profile.first_name} {profile.last_name || ''}
              </Text>
            )}

            {profile?.angler_since && (
              <View style={[styles.anglerBadge, { backgroundColor: theme.colors.primary + '15', borderRadius: theme.radius.xxl }]}>
                <Text style={[styles.anglerBadgeText, { color: theme.colors.primary, fontWeight: theme.fonts.semiBold }]}>
                  🎣 Angler since {profile.angler_since}
                </Text>
              </View>
            )}
          </View>

          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.rose + '20', borderRadius: theme.radius.lg }]}>
              <Text style={[styles.statNumber, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                {postsCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>Catches</Text>
            </View>

            <Pressable 
              style={[styles.statCard, { backgroundColor: theme.colors.primary + '20', borderRadius: theme.radius.lg }]}
              onPress={() => setShowFollowers(true)}
            >
              <Text style={[styles.statNumber, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                {profile?.followers_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>Followers</Text>
            </Pressable>

            <Pressable 
              style={[styles.statCard, { backgroundColor: theme.colors.accent + '20', borderRadius: theme.radius.lg }]}
              onPress={() => setShowFollowing(true)}
            >
              <Text style={[styles.statNumber, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                {profile?.following_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>Following</Text>
            </Pressable>
          </View>

          {/* Bio & Location */}
          {(profile?.bio || profile?.location) && (
            <View style={[styles.detailsCard, { backgroundColor: theme.colors.gray, borderRadius: theme.radius.lg }]}>
              {profile?.bio && (
                <View style={[styles.bioSection, profile?.location && { marginBottom: hp(1) }]}>
                  <View style={styles.sectionHeader}>
                    <Icon name="edit" size={16} color={theme.colors.primary} />
                    <Text style={[styles.sectionHeaderText, { fontWeight: theme.fonts.semiBold, color: theme.colors.primary }]}>
                      Bio
                    </Text>
                  </View>
                  <Text style={[styles.bioText, { color: theme.colors.text }]}>{profile.bio}</Text>
                </View>
              )}
              
              {profile?.location && (
                <View style={[styles.locationSection, profile?.bio && { paddingTop: hp(0.5) }]}>
                  <Icon name="location" size={16} color={theme.colors.primary} />
                  <Text style={[styles.locationText, { color: theme.colors.text }]}>{profile.location}</Text>
                </View>
              )}
            </View>
          )}

          {/* Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabPress={switchTab}
            showSaved={true}
          />

          {/* Grille pour TOUS les tabs */}
          <PostsGrid
            posts={currentData}
            loading={tabsLoading}
            columns={3}
            gap={2}
            showStats={true}
            showSpecies={activeTab !== 'shared'}
            showRepostBadge={activeTab === 'shared'}
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header

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
    color: 'white',
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
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
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
  },
  anglerBadge: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
    marginTop: hp(0.5),
  },
  anglerBadgeText: {
    fontSize: hp(1.4),
  },
  
  // Stats Cards
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    gap: wp(2.5),
    marginBottom: hp(1.5),
  },
  statCard: {
    flex: 1,
    padding: hp(1.5),
    alignItems: 'center',
    gap: hp(0.3),
  },
  statNumber: {
    fontSize: hp(2.2),
  },
  statLabel: {
    fontSize: hp(1.3),
  },
  
  // Details Card
  detailsCard: {
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
    padding: hp(1.5),
  },
  bioSection: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: hp(0.5),
  },
  sectionHeaderText: {
    fontSize: hp(1.5),
  },
  bioText: {
    fontSize: hp(1.5),
    lineHeight: hp(2),
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: hp(1.5),
  },
});