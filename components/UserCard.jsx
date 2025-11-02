import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import Icon from '../assets/icons'
import { useRouter } from 'expo-router'
import FollowButton from './FollowButton'
import { useFollow } from '../hooks/useFollow'

const UserCard = ({ user, currentUserId, showFollowButton = true }) => {
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
    router.push( `/userProfile/${user.id}` );
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Avatar */}
      {user.avatar_url ? (
        <Image
          source={{ uri: user.avatar_url }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Icon name="user" size={28} color={theme.colors.textLight} />
        </View>
      )}

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.displayName} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.username} numberOfLines={1}>
          @{user.username}
        </Text>
        {/* Stats */}
        <View style={styles.stats}>
          <Text style={styles.statText}>
            {user.posts_count || 0} posts
          </Text>
          <Text style={styles.statDot}>•</Text>
          <Text style={styles.statText}>
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

export default UserCard;

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
    borderColor: theme.colors.gray,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.gray,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  username: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  statDot: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
});