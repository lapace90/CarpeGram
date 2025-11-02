import { View, Text, StyleSheet, Modal, FlatList, Pressable, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import Icon from '../assets/icons'
import { getFollowing } from '../services/followService'
import UserCard from './UserCard'

const FollowingModal = ({ visible, onClose, userId, currentUserId }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      loadFollowing();
    }
  }, [visible, userId]);

  const loadFollowing = async () => {
    setLoading(true);
    const result = await getFollowing(userId);
    
    if (result.success) {
      setFollowing(result.data || []);
    }
    
    setLoading(false);
  };

  const renderFollowing = ({ item }) => {
    const profile = item.profiles;
    if (!profile) return null;

    return (
      <UserCard
        user={profile}
        currentUserId={currentUserId}
        showFollowButton={currentUserId !== profile.id && currentUserId !== userId}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="user" size={60} strokeWidth={1.5} color={theme.colors.textLight} />
      <Text style={styles.emptyTitle}>Not following anyone yet</Text>
      <Text style={styles.emptyText}>When this account follows people, they'll appear here 👥</Text>
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
          <Text style={styles.title}>Following</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Following List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={following}
            renderItem={renderFollowing}
            keyExtractor={(item) => item.following_id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={!loading && renderEmpty()}
          />
        )}
      </View>
    </Modal>
  );
};

export default FollowingModal;

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
    paddingHorizontal: wp(10),
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
    textAlign: 'center',
  },
});