import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { hp } from '../helpers/common';
import Avatar from './Avatar';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

const NotificationItem = ({ notification, onPress }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { type, actor, post, read, created_at } = notification;

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
  };

  const getNotificationText = () => {
    const displayName = actor?.show_full_name && actor?.first_name
      ? `${actor.first_name} ${actor.last_name || ''}`
      : `@${actor?.username || 'Someone'}`;

    switch (type) {
      case 'like':
        return `${displayName} liked your post`;
      case 'comment':
        return `${displayName} commented on your post`;
      case 'follow':
        return `${displayName} started following you`;
      case 'repost':
        return `${displayName} reposted your post`;
      case 'mention':
        return `${displayName} mentioned you`;
      default:
        return `${displayName} interacted with you`;
    }
  };

  const getNotificationIcon = () => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'repost':
        return '🔄';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  };

  const handlePress = () => {
    onPress(notification.id);

    if (type === 'follow') {
      router.push(`/userProfile/${actor.id}`);
    } else if (post?.id) {
      router.push(`/post/${post.id}`);
    }
  };

  return (
    <Pressable
      style={[
        styles.container, 
        { borderBottomColor: theme.colors.gray + '40' },
        !read && { backgroundColor: theme.colors.primary + '08' }
      ]}
      onPress={handlePress}
    >
      <Avatar profile={actor} size={48} />

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            {getNotificationText()}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textLight }]}>
            {formatTimeAgo(created_at)}
          </Text>
        </View>

        {post?.image_url && (
          <Image
            source={{ uri: post.image_url }}
            style={[styles.postThumbnail, { borderRadius: theme.radius.md }]}
          />
        )}
      </View>

      {!read && (
        <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
      )}

      <View style={[styles.iconBadge, { shadowColor: theme.colors.dark }]}>
        <Text style={styles.icon}>{getNotificationIcon()}</Text>
      </View>
    </Pressable>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: hp(1.7),
    lineHeight: hp(2.2),
  },
  time: {
    fontSize: hp(1.4),
  },
  postThumbnail: {
    width: 50,
    height: 50,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 16,
    right: 12,
  },
  iconBadge: {
    position: 'absolute',
    bottom: 8,
    left: 40,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: hp(1.4),
  },
});