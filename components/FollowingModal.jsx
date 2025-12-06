import { View, Text, StyleSheet, Modal, FlatList, Pressable, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { hp, wp } from '../helpers/common'
import Icon from '../assets/icons'
import { getFollowing } from '../services/followService'
import UserCard from './UserCard'

const FollowingModal = ({ visible, onClose, userId, currentUserId }) => {
  const { theme } = useTheme();
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
      <Text style={[styles.emptyTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
        Not following anyone yet
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textLight }]}>
        When this account follows people, they'll appear here 👥
      </Text>
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
        <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
          <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            Following
          </Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

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
  },
  title: {
    fontSize: hp(2.2),
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
    marginTop: 10,
  },
  emptyText: {
    fontSize: hp(1.8),
    textAlign: 'center',
  },
});