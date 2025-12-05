import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import Avatar from '../Avatar';
import { useRouter } from 'expo-router';

const WATER_TYPE_ICONS = {
  lake: '🏞️',
  river: '🏞️',
  pond: '🌊',
  canal: '🚣',
  sea: '🌊',
};

const SpotDetailModal = ({ 
  visible, 
  onClose, 
  spot, 
  currentUserId,
  onDelete,
  onNavigate,
}) => {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!spot) return null;

  const isOwner = currentUserId === spot.user_id;
  const waterTypeIcon = WATER_TYPE_ICONS[spot.water_type] || '📍';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    Linking.openURL(url);
    if (onNavigate) onNavigate(spot);
  };

  const handleViewProfile = () => {
    onClose();
    router.push(`/userProfile/${spot.user_id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Spot',
      'Are you sure you want to delete this spot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const success = await onDelete(spot.id);
            setDeleting(false);
            if (success) {
              Alert.alert('Success', 'Spot deleted successfully');
              onClose();
            }
          },
        },
      ]
    );
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share feature coming soon!');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.waterType}>{waterTypeIcon}</Text>
                <Text style={styles.title} numberOfLines={2}>{spot.name}</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10}>
                <Icon name="delete" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            {/* Creator Info */}
            {spot.profiles && (
              <Pressable style={styles.creatorRow} onPress={handleViewProfile}>
                <Avatar uri={spot.profiles.avatar_url} size={hp(4.5)} />
                <View style={styles.creatorInfo}>
                  <Text style={styles.creatorName}>
                    {spot.profiles.username}
                  </Text>
                  <Text style={styles.createdAt}>
                    Added {formatDate(spot.created_at)}
                  </Text>
                </View>
                <Icon name="arrowRight" size={20} color={theme.colors.textLight} />
              </Pressable>
            )}

            {/* Description */}
            {spot.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{spot.description}</Text>
              </View>
            )}

            {/* Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              
              <View style={styles.detailRow}>
                <Icon name="location" size={20} color={theme.colors.primary} />
                <Text style={styles.detailText}>
                  {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>💧</Text>
                <Text style={styles.detailText}>
                  {spot.water_type?.charAt(0).toUpperCase() + spot.water_type?.slice(1) || 'Unknown'}
                </Text>
              </View>

              {spot.fish_types && spot.fish_types.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>🐟</Text>
                  <Text style={styles.detailText}>
                    {spot.fish_types.join(', ')}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Icon 
                  name={spot.privacy === 'public' ? 'unlock' : 'lock'} 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.detailText}>
                  {spot.privacy?.charAt(0).toUpperCase() + spot.privacy?.slice(1) || 'Public'}
                </Text>
              </View>
            </View>

            {/* Rating (if available) */}
            {spot.rating_count > 0 && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>
                  {spot.rating_avg?.toFixed(1)} ({spot.rating_count} ratings)
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Pressable style={styles.actionButton} onPress={handleNavigate}>
                <Icon name="location" size={22} color={theme.colors.primary} />
                <Text style={styles.actionText}>Navigate</Text>
              </Pressable>

              <Pressable style={styles.actionButton} onPress={handleShare}>
                <Icon name="share" size={22} color={theme.colors.primary} />
                <Text style={styles.actionText}>Share</Text>
              </Pressable>

              {isOwner && (
                <Pressable 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color={theme.colors.rose} />
                  ) : (
                    <>
                      <Icon name="delete" size={22} color={theme.colors.rose} />
                      <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SpotDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: wp(5),
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(2),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: wp(2),
  },
  waterType: {
    fontSize: hp(3),
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    flex: 1,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    padding: wp(3),
    borderRadius: theme.radius.xl,
    marginBottom: hp(2),
  },
  creatorInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  creatorName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  createdAt: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: 2,
  },
  section: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  description: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    lineHeight: hp(2.4),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
    gap: wp(2),
  },
  detailIcon: {
    fontSize: hp(2),
    width: 24,
    textAlign: 'center',
  },
  detailText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(2),
  },
  ratingIcon: {
    fontSize: hp(2),
  },
  ratingText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray,
    marginTop: hp(1),
  },
  actionButton: {
    alignItems: 'center',
    padding: wp(3),
  },
  actionText: {
    fontSize: hp(1.5),
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: theme.fonts.medium,
  },
  deleteButton: {},
  deleteText: {
    color: theme.colors.rose,
  },
});