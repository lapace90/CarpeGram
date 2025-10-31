import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native'
import React from 'react'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'

const CommentItem = ({ comment, currentUserId, onDelete }) => {
  const { id, text, created_at, profiles, user_id } = comment;

  const isOwnComment = currentUserId === user_id;

  // Display name logic
  const displayName = profiles?.show_full_name && profiles?.first_name
    ? `${profiles.first_name} ${profiles.last_name || ''}`
    : `@${profiles?.username || 'unknown'}`;

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(id, user_id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      {profiles?.avatar_url ? (
        <Image
          source={{ uri: profiles.avatar_url }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Icon name="user" size={16} color={theme.colors.textLight} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>{displayName}</Text>
          <Text style={styles.timestamp}>{formatTimeAgo(created_at)}</Text>
        </View>
        <Text style={styles.text}>{text}</Text>
      </View>

      {/* Delete button (only for own comments) */}
      {isOwnComment && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="delete" size={18} color={theme.colors.rose} />
        </Pressable>
      )}
    </View>
  );
};

export default CommentItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  text: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    lineHeight: hp(2.2),
  },
  deleteButton: {
    padding: 4,
  },
});