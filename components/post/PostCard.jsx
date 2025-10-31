import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native'
import React, { useRef, useState } from 'react'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { useLike } from '../../hooks/useLike'
import CommentsModal from './CommentsModal'

const PostCard = ({ post, currentUserId, onPress }) => {
  const {
    id,
    image_url,
    description,
    fish_species,
    fish_weight,
    bait,
    spot,
    privacy,
    likes_count,
    comments_count,
    created_at,
    profiles,
  } = post;

  // States
  const [showComments, setShowComments] = useState(false);

  // Animation pour le like
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Hook pour le like
  const { liked, likesCount, toggleLike } = useLike(id, likes_count, currentUserId);

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Display name logic
  const displayName = profiles?.show_full_name && profiles?.first_name
    ? `${profiles.first_name} ${profiles.last_name || ''}`
    : `@${profiles?.username || 'unknown'}`;

  // Animation du like
  const handleLike = () => {
    // Animation bounce
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    toggleLike();
  };

  return (
    <>
      <Pressable style={styles.card} onPress={onPress}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {profiles?.avatar_url ? (
              <Image
                source={{ uri: profiles.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="user" size={20} color={theme.colors.textLight} />
              </View>
            )}
            <View>
              <Text style={styles.username}>{displayName}</Text>
              <Text style={styles.timestamp}>{formatDate(created_at)}</Text>
            </View>
          </View>
          
          {/* Privacy indicator */}
          <View style={styles.privacyBadge}>
            <Icon 
              name={privacy === 'public' ? 'unlock' : privacy === 'followers' ? 'user' : 'heart'} 
              size={14} 
              color={theme.colors.textLight} 
            />
          </View>
        </View>

        {/* Post Image */}
        <Image
          source={{ uri: image_url }}
          style={styles.postImage}
          resizeMode="cover"
        />

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <Icon 
                name="heart" 
                size={24} 
                strokeWidth={1.8} 
                color={liked ? theme.colors.rose : theme.colors.text}
                fill={liked ? theme.colors.rose : 'transparent'}
              />
            </Animated.View>
            <Text style={[styles.actionText, liked && styles.actionTextLiked]}>
              {likesCount}
            </Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => setShowComments(true)}
          >
            <Icon name="comment" size={24} strokeWidth={1.8} color={theme.colors.text} />
            <Text style={styles.actionText}>{comments_count || 0}</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Icon name="share" size={24} strokeWidth={1.8} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Description */}
        <View style={styles.content}>
          <Text style={styles.description} numberOfLines={3}>
            <Text style={styles.usernameInline}>@{profiles?.username || 'unknown'}</Text>
            {' '}{description}
          </Text>
        </View>

        {/* Fish Details */}
        {(fish_species || fish_weight || bait || spot) && (
          <View style={styles.fishDetails}>
            {fish_species && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>🐟</Text>
                <Text style={styles.detailText}>{fish_species}</Text>
              </View>
            )}
            {fish_weight && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>⚖️</Text>
                <Text style={styles.detailText}>{fish_weight} kg</Text>
              </View>
            )}
            {bait && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>🎣</Text>
                <Text style={styles.detailText}>{bait}</Text>
              </View>
            )}
            {spot && (
              <View style={styles.detailItem}>
                <Icon name="location" size={14} color={theme.colors.primary} />
                <Text style={styles.detailText}>{spot}</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>

      {/* Comments Modal */}
      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={id}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  privacyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: '100%',
    height: hp(40),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: hp(1.6),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  actionTextLiked: {
    color: theme.colors.rose,
    fontWeight: theme.fonts.semiBold,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  description: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    lineHeight: hp(2.4),
  },
  usernameInline: {
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  fishDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.gray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
  },
  detailLabel: {
    fontSize: hp(1.6),
  },
  detailText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
});