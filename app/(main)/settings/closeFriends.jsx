import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useRouter } from 'expo-router';
import Icon from '../../../assets/icons';
import BackButton from '../../../components/BackButton';
import Avatar from '../../../components/Avatar';
import EmptyState from '../../../components/EmptyState';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { removeFromCloseFriends } from '../../../services/relationshipService';

const CloseFriends = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [closeFriends, setCloseFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCloseFriends();
  }, []);

  const loadCloseFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('user_relationships')
        .select(`
          following_id,
          created_at,
          profiles:following_id (
            id,
            username,
            avatar_url,
            first_name,
            last_name,
            show_full_name,
            posts_count,
            followers_count
          )
        `)
        .eq('follower_id', user.id)
        .eq('is_close_friend', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCloseFriends(data || []);
    } catch (error) {
      console.error('Load close friends error:', error);
      Alert.alert('Error', 'Failed to load close friends');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCloseFriends();
    setRefreshing(false);
  };

  const handleRemoveFromCloseFriends = (friend) => {
    const profile = friend.profiles;
    
    Alert.alert(
      'Remove from Close Friends',
      `Remove @${profile?.username} from your close friends list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await removeFromCloseFriends(user.id, friend.following_id);
            
            if (result.success) {
              setCloseFriends(prev => 
                prev.filter(f => f.following_id !== friend.following_id)
              );
              Alert.alert('Success', 'Removed from close friends');
            } else {
              Alert.alert('Error', result.error || 'Failed to remove from close friends');
            }
          },
        },
      ]
    );
  };

  const renderCloseFriend = ({ item }) => {
    const profile = item.profiles;
    if (!profile) return null;

    const displayName = profile.show_full_name && profile.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`
      : `@${profile.username}`;

    return (
      <View style={styles.friendItem}>
        <Pressable
          style={styles.friendInfo}
          onPress={() => router.push(`/userProfile/${profile.id}`)}
        >
          <Avatar profile={profile} size={48} />
          <View style={styles.friendDetails}>
            <View style={styles.friendHeader}>
              <Text style={styles.displayName}>{displayName}</Text>
              <Icon name="heart" size={16} color={theme.colors.rose} fill={theme.colors.rose} />
            </View>
            <Text style={styles.username}>@{profile.username}</Text>
            <View style={styles.stats}>
              <Text style={styles.statText}>
                {profile.posts_count || 0} posts
              </Text>
              <Text style={styles.statDot}>•</Text>
              <Text style={styles.statText}>
                {profile.followers_count || 0} followers
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemoveFromCloseFriends(item)}
        >
          <Icon name="close" size={20} color={theme.colors.rose} />
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.title}>Close Friends</Text>
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
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.title}>Close Friends</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Icon name="heart" size={18} color={theme.colors.rose} fill={theme.colors.rose} />
          <Text style={styles.infoText}>
            Share posts with only your close friends. They'll see a special badge on these posts.
          </Text>
        </View>

        {/* Count */}
        {closeFriends.length > 0 && (
          <View style={styles.countBox}>
            <Text style={styles.countText}>
              {closeFriends.length} {closeFriends.length === 1 ? 'friend' : 'friends'}
            </Text>
          </View>
        )}

        {/* Close Friends List */}
        <FlatList
          data={closeFriends}
          renderItem={renderCloseFriend}
          keyExtractor={(item) => item.following_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <EmptyState
              icon="heart"
              title="No Close Friends Yet"
              subtitle="Add close friends from user profiles to share private content with them"
            />
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default CloseFriends;

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
    backgroundColor: theme.colors.rose + '08',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.rose + '20',
  },
  infoText: {
    flex: 1,
    fontSize: hp(1.5),
    color: theme.colors.text,
    lineHeight: hp(2),
  },
  countBox: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  countText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
  },
  listContent: {
    padding: wp(5),
    paddingTop: hp(1),
  },
  friendItem: {
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
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  friendDetails: {
    flex: 1,
    gap: 4,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  statDot: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.rose + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
});