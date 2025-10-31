import { View, Text, StyleSheet, Modal, FlatList, Pressable, Image, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { getPostLikes } from '../../services/likeService'

const LikesModal = ({ visible, onClose, postId }) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && postId) {
      loadLikes();
    }
  }, [visible, postId]);

  const loadLikes = async () => {
    setLoading(true);
    const result = await getPostLikes(postId);
    
    if (result.success) {
      setLikes(result.data || []);
    }
    
    setLoading(false);
  };

  const renderLikeItem = ({ item }) => {
    const profile = item.profiles;
    const displayName = profile?.show_full_name && profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`
      : profile?.username || 'Unknown';

    return (
      <Pressable 
        style={styles.likeItem}
        onPress={() => {
          // TODO: Navigate to user profile (future feature)
          console.log('Navigate to profile:', profile?.id);
        }}
      >
        {/* Avatar */}
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Icon name="user" size={20} color={theme.colors.textLight} />
          </View>
        )}

        {/* User info */}
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.username}>@{profile?.username || 'unknown'}</Text>
        </View>

        {/* Arrow icon */}
        <Icon 
          name="arrowLeft" 
          size={18} 
          color={theme.colors.textLight} 
          style={{ transform: [{ rotate: '180deg' }] }} 
        />
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="heart" size={60} strokeWidth={1.5} color={theme.colors.textLight} />
      <Text style={styles.emptyTitle}>No likes yet</Text>
      <Text style={styles.emptyText}>Be the first to like this post! ❤️</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Likes ({likes.length})</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Likes List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={likes}
            renderItem={renderLikeItem}
            keyExtractor={(item) => item.user_id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={!loading && renderEmpty()}
          />
        )}
      </View>
    </Modal>
  );
};

export default LikesModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  username: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
    gap: 12,
  },
  emptyTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: 10,
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
});