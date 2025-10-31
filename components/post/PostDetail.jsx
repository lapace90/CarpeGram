import { View, Text, StyleSheet, Modal, ScrollView, Image, Pressable, Animated, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { useLike } from '../../hooks/useLike'
import CommentsModal from './CommentsModal'
import LikesModal from './LikesModal'

const PostDetail = ({ visible, onClose, post, currentUserId, onDelete }) => {
  // Hooks DOIVENT être appelés avant tout return conditionnel
  const [showComments, setShowComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Hook like avec valeurs sûres
  const { liked, likesCount, toggleLike } = useLike(
    post?.id || null, 
    post?.likes_count || 0, 
    currentUserId
  );

  // Return conditionnel APRÈS les hooks
  if (!post) return null;

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
    user_id,
  } = post;

  // Check if it's user's own post
  const isOwnPost = currentUserId === user_id;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Display name
  const displayName = profiles?.show_full_name && profiles?.first_name
    ? `${profiles.first_name} ${profiles.last_name || ''}`
    : `@${profiles?.username || 'unknown'}`;

  // Handle like with animation
  const handleLike = () => {
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

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete && onDelete(id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.headerButton} onPress={onClose}>
              <Icon name="arrowLeft" size={24} color={theme.colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Post Details</Text>
            {isOwnPost && (
              <Pressable style={styles.headerButton} onPress={handleDelete}>
                <Icon name="delete" size={24} color={theme.colors.rose} />
              </Pressable>
            )}
            {!isOwnPost && <View style={styles.headerButton} />}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.userSection}>
              {profiles?.avatar_url ? (
                <Image source={{ uri: profiles.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="user" size={24} color={theme.colors.textLight} />
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.displayName}>{displayName}</Text>
                <Text style={styles.timestamp}>{formatDate(created_at)}</Text>
              </View>
              {privacy !== 'public' && (
                <View style={styles.privacyBadge}>
                  <Icon 
                    name={privacy === 'followers' ? 'user' : 'heart'} 
                    size={14} 
                    color={theme.colors.textLight} 
                  />
                </View>
              )}
            </View>

            {/* Image */}
            <Image source={{ uri: image_url }} style={styles.image} resizeMode="cover" />

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable style={styles.actionButton} onPress={handleLike}>
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  <Icon 
                    name="heart" 
                    size={28} 
                    strokeWidth={1.8} 
                    color={liked ? theme.colors.rose : theme.colors.text}
                    fill={liked ? theme.colors.rose : 'transparent'}
                  />
                </Animated.View>
              </Pressable>
              
              <Pressable style={styles.actionButton} onPress={() => setShowComments(true)}>
                <Icon name="comment" size={28} strokeWidth={1.8} color={theme.colors.text} />
              </Pressable>
              
              <Pressable style={styles.actionButton}>
                <Icon name="share" size={28} strokeWidth={1.8} color={theme.colors.text} />
              </Pressable>
            </View>

            {/* Likes & Comments Count (cliquables) */}
            <View style={styles.stats}>
              <Pressable onPress={() => setShowLikes(true)}>
                <Text style={styles.statsText}>
                  <Text style={styles.statsNumber}>{likesCount}</Text> {likesCount === 1 ? 'like' : 'likes'}
                </Text>
              </Pressable>
              
              <Pressable onPress={() => setShowComments(true)}>
                <Text style={styles.statsText}>
                  <Text style={styles.statsNumber}>{comments_count || 0}</Text> {comments_count === 1 ? 'comment' : 'comments'}
                </Text>
              </Pressable>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>
                <Text style={styles.username}>@{profiles?.username || 'unknown'}</Text>
                {' '}{description}
              </Text>
            </View>

            {/* Fish Details */}
            {(fish_species || fish_weight || bait || spot) && (
              <View style={styles.fishSection}>
                <Text style={styles.sectionTitle}>Catch Details</Text>
                <View style={styles.fishDetails}>
                  {fish_species && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>🐟 Species</Text>
                      <Text style={styles.detailValue}>{fish_species}</Text>
                    </View>
                  )}
                  {fish_weight && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>⚖️ Weight</Text>
                      <Text style={styles.detailValue}>{fish_weight} kg</Text>
                    </View>
                  )}
                  {bait && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>🎣 Bait</Text>
                      <Text style={styles.detailValue}>{bait}</Text>
                    </View>
                  )}
                  {spot && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📍 Location</Text>
                      <Text style={styles.detailValue}>{spot}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* View Comments Button */}
            <Pressable 
              style={styles.viewCommentsButton}
              onPress={() => setShowComments(true)}
            >
              <Icon name="comment" size={20} color={theme.colors.primary} />
              <Text style={styles.viewCommentsText}>
                View all {comments_count || 0} comments
              </Text>
              <Icon 
                name="arrowLeft" 
                size={16} 
                color={theme.colors.primary} 
                style={{ transform: [{ rotate: '180deg' }] }} 
              />
            </Pressable>

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Comments Modal */}
      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={id}
        currentUserId={currentUserId}
      />

      {/* Likes Modal */}
      <LikesModal
        visible={showLikes}
        onClose={() => setShowLikes(false)}
        postId={id}
      />
    </>
  );
};

export default PostDetail;

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
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  privacyBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: hp(45),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    padding: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statsText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
  statsNumber: {
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  description: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    lineHeight: hp(2.5),
  },
  username: {
    fontWeight: theme.fonts.semiBold,
  },
  fishSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.gray,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: theme.radius.lg,
  },
  sectionTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  fishDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
  detailValue: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  viewCommentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
  },
  viewCommentsText: {
    flex: 1,
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.primary,
  },
});