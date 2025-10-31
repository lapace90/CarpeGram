import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'
import Icon from '../../assets/icons'
import Button from '../../components/Button'
import { pickAndUploadAvatar } from '../../services/imageService'
import { fetchUserPosts } from '../../services/postService'
import PostsGrid from '../../components/post/PostsGrid'
import PostDetail from '../../components/post/PostDetail'

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    setLoading(true);

    // Get auth user
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    // Get profile data
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Get user posts
      const postsResult = await fetchUserPosts(user.id);
      if (postsResult.success) {
        setPosts(postsResult.data || []);
      }
    }

    setLoading(false);
  }

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/welcome');
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

  const handleDeletePost = async (postId) => {
    // Refresh posts after deletion
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Pressable style={styles.editButton} onPress={() => router.push('/editProfile')}>
              <Icon name="edit" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Profile picture & name */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: `${profile.avatar_url}?t=${Date.now()}` }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar}>
                <Icon name="user" size={60} color={theme.colors.primary} />
              </View>
            )}
            <Pressable style={styles.cameraButton} onPress={handleAvatarChange}>
              <Icon name="camera" size={18} color="white" />
            </Pressable>
          </View>

          <Text style={styles.username}>
            @{profile?.username || 'username'}
          </Text>

          {profile?.show_full_name && profile?.first_name && (
            <Text style={styles.fullName}>
              {profile.first_name} {profile.last_name}
            </Text>
          )}

          <Text style={styles.userBadge}>
            🎣 Angler since {profile?.angler_since || '2010'}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Catches</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile?.followers_count || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile?.following_count || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Bio section */}
        {profile?.bio && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="edit" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <Text style={styles.bioText}>
              {profile.bio}
            </Text>
          </View>
        )}

        {/* Location */}
        {profile?.location && (
          <View style={styles.locationContainer}>
            <Icon name="location" size={18} color={theme.colors.textLight} />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        )}

        {/* Posts Grid Header */}
        <View style={styles.postsHeader}>
          <Icon name="image" size={22} color={theme.colors.primary} />
          <Text style={styles.postsTitle}>My Catches</Text>
        </View>

        {/* Posts Grid (limited to 9) */}
        <PostsGrid
          posts={posts}
          loading={false}
          limit={9}
          columns={3}
          gap={2}
          showStats={true}
          showSpecies={true}
          onPostPress={handlePostPress}
          emptyTitle="No catches yet"
          emptyText="Share your first catch! 🎣"
          onEmptyPress={() => router.push('/newPost')}
        />

        {/* See All Button (if more than 9 posts) */}
        {posts.length > 9 && (
          <Pressable
            style={styles.seeAllButton}
            onPress={() => router.push('/postsGallery')}
          >
            <Icon name="image" size={20} color={theme.colors.primary} />
            <Text style={styles.seeAllText}>See all {posts.length} posts</Text>
            <Icon
              name="arrowLeft"
              size={18}
              color={theme.colors.primary}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </Pressable>
        )}

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <Pressable style={styles.actionButton}>
            <Icon name="maps" size={22} color={theme.colors.primary} />
            <Text style={styles.actionText}>Favorite Spots</Text>
            <Icon name="arrowLeft" size={18} color={theme.colors.textLight} style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/postsGallery')}
          >
            <Icon name="image" size={22} color={theme.colors.primary} />
            <Text style={styles.actionText}>My Catches Gallery</Text>
            <Icon name="arrowLeft" size={18} color={theme.colors.textLight} style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>
        </View>

        {/* Logout button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={onLogout}
            buttonStyle={styles.logoutButton}
            textStyle={styles.logoutText}
            hasShadow={false}
          />
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Post Detail Modal */}
      <PostDetail
        visible={showPostDetail}
        onClose={() => setShowPostDetail(false)}
        post={selectedPost}
        currentUserId={user?.id}
        onDelete={handleDeletePost}
      />
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
    alignItems: 'center'
  },
  header: {
    height: hp(20),
    backgroundColor: theme.colors.primary,
    position: 'relative',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 194, 47, 0.9)',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  headerTitle: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  editButton: {
    position: 'absolute',
    top: hp(2),
    right: wp(5),
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: hp(3),
    paddingHorizontal: wp(5),
  },
  avatarContainer: {
    marginTop: -hp(6),
    position: 'relative',
  },
  avatar: {
    width: hp(14),
    height: hp(14),
    borderRadius: hp(7),
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  username: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: hp(2),
  },
  fullName: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginTop: 2,
  },
  userBadge: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: hp(3),
    gap: wp(10),
  },
  statBox: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  section: {
    marginTop: hp(3),
    paddingHorizontal: wp(5),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  bioText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    lineHeight: hp(2.8),
    backgroundColor: theme.colors.gray,
    padding: 15,
    borderRadius: theme.radius.lg,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: hp(2),
    paddingHorizontal: wp(5),
  },
  locationText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: wp(5),
    marginTop: hp(3),
    marginBottom: 15,
  },
  postsTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: wp(5),
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
  },
  seeAllText: {
    flex: 1,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.primary,
  },
  actionsSection: {
    marginTop: hp(2),
    paddingHorizontal: wp(5),
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 15,
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
  },
  actionText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    flex: 1,
  },
  logoutSection: {
    marginTop: hp(4),
    paddingHorizontal: wp(5),
  },
  logoutButton: {
    backgroundColor: theme.colors.rose,
  },
  logoutText: {
    color: 'white',
  },
})