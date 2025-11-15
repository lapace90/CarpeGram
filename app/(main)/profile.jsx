import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
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
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'

const Profile = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading, refresh } = useProfile(user?.id);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  const handleAvatarChange = async () => {
    setUploadingAvatar(true);
    await pickAndUploadAvatar(user.id, refresh);
    setUploadingAvatar(false);
  }

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  }

  const handlePostUpdate = () => {
    refreshAllTabs();
    setShowPostDetail(false);
  }

  const handlePostDelete = () => {
    refreshAllTabs();
    setShowPostDetail(false);
  }

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const displayName = profile?.show_full_name && profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`
    : `@${profile?.username || 'unknown'}`;

  return (
    <ScreenWrapper bg="white">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header avec menu */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Pressable onPress={() => setShowMenu(true)}>
            <Icon name="threeDotsHorizontal" size={hp(3.4)} strokeWidth={2} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Avatar et infos */}
        <View style={styles.profileSection}>
          <Pressable onPress={handleAvatarChange} style={styles.avatarContainer}>
            <Image
              source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              <Icon name="camera" size={20} strokeWidth={2.5} color="white" />
            </View>
          </Pressable>

          <Text style={styles.name}>{displayName}</Text>
          {profile?.show_full_name && profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}

          {profile?.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{postsCount || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <Pressable style={styles.statItem} onPress={() => setShowFollowers(true)}>
              <Text style={styles.statNumber}>{profile?.followers_count || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </Pressable>
            <Pressable style={styles.statItem} onPress={() => setShowFollowing(true)}>
              <Text style={styles.statNumber}>{profile?.following_count || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </Pressable>
          </View>

          {/* Edit Profile Button */}
          <Pressable
            style={styles.editButton}
            onPress={() => router.push('/editProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={switchTab}
          postsCount={postsCount}
          sharedCount={sharedCount}
          savedCount={savedCount}
        />

        {/* Content Grid */}
        <PostsGrid
          posts={currentData}
          loading={tabsLoading}
          onPostPress={handlePostPress}
        />
      </ScrollView>

      {/* Modals */}
      {selectedPost && (
        <PostDetail
          visible={showPostDetail}
          onClose={() => setShowPostDetail(false)}
          post={selectedPost}
          currentUserId={user?.id}
          onUpdate={handlePostUpdate}
          onDelete={handlePostDelete}
        />
      )}

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
        onUpdate={refresh}
      />
    </ScreenWrapper>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  profileSection: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: hp(2),
  },
  avatar: {
    height: hp(14),
    width: hp(14),
    borderRadius: theme.radius.xxl * 1.8,
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
  },
  name: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    marginTop: 4,
  },
  bio: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: hp(1.5),
    paddingHorizontal: wp(5),
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: hp(2),
    paddingHorizontal: wp(10),
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginTop: 4,
  },
  editButton: {
    marginTop: hp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(10),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  editButtonText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
})