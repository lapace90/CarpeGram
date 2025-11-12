import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import Avatar from './Avatar';
import { useRouter } from 'expo-router';

const ConversationItem = ({ conversation }) => {
  const router = useRouter();
  const { otherUser, lastMessage, unreadCount, id } = conversation;

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  const getLastMessagePreview = () => {
    if (!lastMessage) return 'Start a conversation';
    
    switch (lastMessage.type) {
      case 'image':
        return '📷 Photo';
      case 'post_share':
        return '🎣 Shared a post';
      default:
        return lastMessage.content;
    }
  };

  const displayName = otherUser?.show_full_name && otherUser?.first_name
    ? `${otherUser.first_name} ${otherUser.last_name || ''}`
    : `@${otherUser?.username || 'User'}`;

  return (
    <Pressable
      style={[styles.container, unreadCount > 0 && styles.unread]}
      onPress={() => router.push(`/chat/${id}`)}
    >
      <Avatar profile={otherUser} size={56} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{displayName}</Text>
          {lastMessage && (
            <Text style={styles.time}>{formatTimeAgo(lastMessage.created_at)}</Text>
          )}
        </View>

        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.lastMessage,
              unreadCount > 0 && styles.lastMessageUnread
            ]}
            numberOfLines={1}
          >
            {getLastMessagePreview()}
          </Text>
          
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default ConversationItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '40',
  },
  unread: {
    backgroundColor: theme.colors.primary + '05',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  time: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  lastMessageUnread: {
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});