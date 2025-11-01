import { View, Text, StyleSheet, Pressable, Alert } from 'react-native'
import React from 'react'
import { theme } from '../../constants/theme'
import { commonStyles } from '../../constants/commonStyles'
import { hp } from '../../helpers/common'
import Icon from '../../assets/icons'
import Avatar from '../Avatar'

const CommentItem = ({ 
  id, 
  text, 
  created_at, 
  user_id, 
  profiles,
  currentUserId,
  onDelete 
}) => {
  const isOwnComment = user_id === currentUserId;
  
  const displayName = profiles?.show_full_name && profiles?.first_name
    ? `${profiles.first_name} ${profiles.last_name || ''}`
    : profiles?.username || 'Unknown';

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
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
    <View style={[commonStyles.flexRow, styles.container]}>
      <Avatar profile={profiles} size={32} />

      <View style={styles.content}>
        <View style={[commonStyles.flexRow, styles.header]}>
          <Text style={[commonStyles.textSemiBold, styles.username]}>
            {displayName}
          </Text>
          <Text style={[commonStyles.textLight, styles.timestamp]}>
            {formatTimeAgo(created_at)}
          </Text>
        </View>
        <Text style={styles.text}>{text}</Text>
      </View>

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
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
  },
  timestamp: {
    fontSize: hp(1.4),
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