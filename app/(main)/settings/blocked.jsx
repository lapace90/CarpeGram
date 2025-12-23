import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useRouter } from 'expo-router';
import Icon from '../../../assets/icons';
import BackButton from '../../../components/common/BackButton';
import Avatar from '../../../components/common/Avatar';
import EmptyState from '../../../components/common/EmptyState';
import { useAuth } from '../../../contexts/AuthContext';
import { getBlockedUsers, unblockUser } from '../../../services/relationshipService';

const BlockedUsers = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    const result = await getBlockedUsers(user.id);
    if (result.success) {
      setBlockedUsers(result.data);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBlockedUsers();
    setRefreshing(false);
  };

  const handleUnblock = (blockedUser) => {
    Alert.alert(
      'Unblock User',
      `Unblock @${blockedUser.profile?.username}? They will be able to follow you and see your posts again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            const result = await unblockUser(user.id, blockedUser.blocked_id);
            
            if (result.success) {
              setBlockedUsers(prev => 
                prev.filter(u => u.blocked_id !== blockedUser.blocked_id)
              );
              Alert.alert('Success', 'User unblocked');
            } else {
              Alert.alert('Error', result.error || 'Failed to unblock user');
            }
          },
        },
      ]
    );
  };

  const renderBlockedUser = ({ item }) => {
    const profile = item.profile;
    if (!profile) return null;

    const displayName = profile.show_full_name && profile.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`
      : `@${profile.username}`;

    return (
      <View style={styles.userItem}>
        <Pressable
          style={styles.userInfo}
          onPress={() => router.push(`/userProfile/${profile.id}`)}
        >
          <Avatar profile={profile} size={48} />
          <View style={styles.userDetails}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.unblockButton}
          onPress={() => handleUnblock(item)}
        >
          <Text style={styles.unblockText}>Unblock</Text>
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton router={router} to="/settings" />
            <Text style={styles.title}>Blocked Users</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} to="/settings" />
          <Text style={styles.title}>Blocked Users</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Icon name="info" size={18} color={theme.colors.textLight} />
          <Text style={styles.infoText}>
            Blocked users can't follow you, see your posts, or message you
          </Text>
        </View>

        {/* Blocked Users List */}
        <FlatList
          data={blockedUsers}
          renderItem={renderBlockedUser}
          keyExtractor={(item) => item.blocked_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <EmptyState
              icon="lock"
              title="No Blocked Users"
              subtitle="Users you block will appear here"
            />
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default BlockedUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    marginHorizontal: wp(5),
    marginTop: hp(2),
    backgroundColor: theme.colors.gray + '40',
    borderRadius: theme.radius.md,
  },
  infoText: {
    flex: 1,
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2),
  },
  listContent: {
    padding: wp(5),
    paddingTop: hp(2),
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: theme.radius.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userDetails: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  username: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  unblockButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  unblockText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
});