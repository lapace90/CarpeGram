import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Image } from 'expo-image'
import React, { memo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { hp, wp } from '../helpers/common'
import Icon from '../assets/icons'
import { useRouter } from 'expo-router'
import FollowButton from './FollowButton'
import { useFollow } from '../hooks/useFollow'

const UserCard = ({ user, currentUserId, showFollowButton = true }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { isFollowing, followersCount, loading, toggleFollow } = useFollow(
    currentUserId,
    user?.id,
    user?.followers_count
  );

  if (!user) return null;

  const displayName = user.show_full_name && user.first_name
    ? `${user.first_name} ${user.last_name || ''}`
    : user.username;

  const handlePress = () => {
    router.push(`/userProfile/${user.id}`);
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Avatar */}
      {user.avatar_url ? (
        <Image
          source={{ uri: user.avatar_url }}
          style={[styles.avatar, { borderColor: theme.colors.gray }]}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.gray, borderColor: theme.colors.gray }]}>
          <Icon name="user" size={28} color={theme.colors.textLight} />
        </View>
      )}

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.displayName, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={[styles.username, { color: theme.colors.textLight }]} numberOfLines={1}>
          @{user.username}
        </Text>
        {/* Stats */}
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.colors.textLight }]}>
            {user.posts_count || 0} posts
          </Text>
          <Text style={[styles.statDot, { color: theme.colors.textLight }]}>•</Text>
          <Text style={[styles.statText, { color: theme.colors.textLight }]}>
            {followersCount} followers
          </Text>
        </View>
      </View>

      {/* Follow Button */}
      {showFollowButton && currentUserId !== user.id && (
        <FollowButton
          isFollowing={isFollowing}
          onPress={toggleFollow}
          loading={loading}
          size="small"
        />
      )}
    </Pressable>
  );
};

export default memo(UserCard);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: 12,
    gap: 12,
    backgroundColor: 'white',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: hp(2),
  },
  username: {
    fontSize: hp(1.6),
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statText: {
    fontSize: hp(1.5),
  },
  statDot: {
    fontSize: hp(1.5),
  },
});