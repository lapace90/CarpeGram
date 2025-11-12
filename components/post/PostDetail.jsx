import { View, Text, StyleSheet, Modal, ScrollView, Pressable, Animated } from 'react-native'
import { Image } from 'expo-image'
import React, { useState, useRef } from 'react'
import { theme } from '../../constants/theme'
import { commonStyles } from '../../constants/commonStyles'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { useLike } from '../../hooks/useLike'
import { useRepost } from '../../hooks/useRepost'
import { useSavedPost } from '../../hooks/useSavedPost'
import Avatar from '../Avatar'
import CommentsModal from './CommentsModal'
import LikesModal from './LikesModal'
import RepostModal from '../RepostModal'
import RippleContainer from '../animations/RippleEffect'
import PostMenu from './PostMenu'
import EditPostModal from './EditPostModal'
import RichText from '../RichText';

const PostDetail = ({ visible, onClose, post, currentUserId, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

  const { liked, likesCount, toggleLike } = useLike(
    post?.id,
    post?.likes_count,
    currentUserId
  );
  const { isReposted, toggleRepost } = useRepost(post?.id, currentUserId);
  const { isSaved, toggleSave } = useSavedPost(post?.id, currentUserId);

  if (!post) return null;

  const {
    id,
    user_id,
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

  const isOwnPost = currentUserId === user_id;

  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const displayName = profiles?.show_full_name && profiles?.first_name
    ? `${profiles.first_name} ${profiles.last_name || ''}`
    : `@${profiles?.username || 'unknown'}`;

  const handleLike = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.4,
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

  const handleRepost = async (privacy, comment) => {
    await toggleRepost(privacy, comment);
  };

  const handleMenuAction = async (action) => {
    if (action === 'delete' && onDelete) {
      onClose();
      await onDelete();
    } else if (action === 'edit') {
      setShowEditModal(true);
    }
  };

  const handleUpdate = async () => {
    // Rafraîchir les données du post
    if (onDelete) {
      await onDelete();
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.backButton}>
              <Icon name="arrowLeft" size={24} color={theme.colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Post</Text>
            {isOwnPost ? (
              <Pressable onPress={() => setShowMenu(true)} style={styles.menuButton}>
                <Icon name="threeDotsHorizontal" size={22} color={theme.colors.text} />
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.userSection}>
              <View style={[commonStyles.flexRowBetween, { marginBottom: 12 }]}>
                <View style={[commonStyles.flexRowCenter, commonStyles.gap10]}>
                  <Avatar profile={profiles} size={50} />
                  <View style={styles.userInfo}>
                    <Text style={[commonStyles.textSemiBold, styles.displayName]}>
                      {displayName}
                    </Text>
                    <Text style={[commonStyles.textLight, styles.timestamp]}>
                      {formatTimeAgo(created_at)}
                    </Text>
                  </View>
                </View>

                <View style={styles.privacyBadge}>
                  <Icon
                    name={privacy === 'public' ? 'globe' : privacy === 'followers' ? 'user' : 'heart'}
                    size={16}
                    color={theme.colors.primary}
                  />
                </View>
              </View>
            </View>

            {/* Image */}
            <Image source={{ uri: image_url }} style={styles.postImage} />

            {/* Actions avec Ripple Effect */}
            <View style={styles.actionsSection}>
              <View style={[commonStyles.flexRow, styles.actions]}>
                {/* Like avec Ripple */}
                <RippleContainer onPress={handleLike} color={theme.colors.rose} size={80}>
                  {({ onPress }) => (
                    <Pressable onPress={onPress} style={[commonStyles.flexRowCenter, commonStyles.gap8]}>
                      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                        <Icon
                          name="heart"
                          size={28}
                          fill={liked ? theme.colors.rose : 'transparent'}
                          color={liked ? theme.colors.rose : theme.colors.text}
                        />
                      </Animated.View>
                    </Pressable>
                  )}
                </RippleContainer>

                <Pressable onPress={() => setShowComments(true)}>
                  <Icon name="comment" size={28} color={theme.colors.text} />
                </Pressable>

                <Pressable onPress={() => setShowRepostModal(true)}>
                  <Icon
                    name="share"
                    size={26}
                    color={isReposted ? theme.colors.primary : theme.colors.text}
                  />
                </Pressable>

                <View style={{ flex: 1 }} />

                <Pressable onPress={toggleSave}>
                  <Icon
                    name="bookmark"
                    size={26}
                    fill={isSaved ? theme.colors.primary : 'transparent'}
                    color={isSaved ? theme.colors.primary : theme.colors.text}
                  />
                </Pressable>
              </View>

              <Pressable
                style={[commonStyles.flexRow, styles.stats]}
                onPress={() => setShowLikes(true)}
              >
                <Text style={[commonStyles.textLight, styles.statsText]}>
                  <Text style={styles.statsNumber}>{likesCount}</Text> likes
                </Text>
                <Text style={[commonStyles.textLight, styles.statsText]}>•</Text>
                <Text style={[commonStyles.textLight, styles.statsText]}>
                  <Text style={styles.statsNumber}>{comments_count || 0}</Text> comments
                </Text>
              </Pressable>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>
                <Text style={styles.username}>{displayName} </Text>
              </Text>
              <RichText
                text={description}
                style={styles.description}
              />
            </View>

            {/* Fish Details */}
            {(fish_species || fish_weight || bait || spot) && (
              <View style={styles.fishSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBadge}>
                    <Text style={styles.sectionIcon}>🎣</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Catch Details</Text>
                </View>

                <View style={styles.fishDetails}>
                  {fish_species && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailIconBadge}>
                        <Text style={styles.detailIcon}>🐟</Text>
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Species</Text>
                        <Text style={styles.detailValue}>{fish_species}</Text>
                      </View>
                    </View>
                  )}

                  {fish_weight && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailIconBadge}>
                        <Text style={styles.detailIcon}>⚖️</Text>
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Weight</Text>
                        <Text style={styles.detailValue}>{fish_weight} kg</Text>
                      </View>
                    </View>
                  )}

                  {bait && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailIconBadge}>
                        <Text style={styles.detailIcon}>🪱</Text>
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Bait</Text>
                        <Text style={styles.detailValue}>{bait}</Text>
                      </View>
                    </View>
                  )}

                  {spot && (
                    <View style={styles.detailCard}>
                      <View style={[styles.detailIconBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                        <Icon name="location" size={18} color={theme.colors.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>{spot}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* View Comments Button */}
            {comments_count > 0 && (
              <Pressable
                style={styles.viewCommentsButton}
                onPress={() => setShowComments(true)}
              >
                <Icon name="comment" size={20} color={theme.colors.primary} />
                <Text style={styles.viewCommentsText}>
                  View all {comments_count} comments
                </Text>
                <Icon
                  name="arrowLeft"
                  size={16}
                  color={theme.colors.primary}
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </Pressable>
            )}

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </Modal>

      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={id}
        currentUserId={currentUserId}
      />

      <LikesModal
        visible={showLikes}
        onClose={() => setShowLikes(false)}
        postId={id}
      />

      <RepostModal
        visible={showRepostModal}
        onClose={() => setShowRepostModal(false)}
        onRepost={handleRepost}
      />

      <EditPostModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={post}
        onUpdate={handleUpdate}
      />

      {isOwnPost && (
        <PostMenu
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          postId={id}
          onAction={handleMenuAction}
        />
      )}
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
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  menuButton: {
    padding: 8,
  },
  userSection: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  userInfo: {
    gap: 2,
  },
  displayName: {
    fontSize: hp(1.9),
  },
  timestamp: {
    fontSize: hp(1.5),
  },
  privacyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.gray + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: '100%',
    height: hp(50),
    marginTop: hp(1.5),
  },
  actionsSection: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
  actions: {
    gap: 24,
    marginBottom: hp(1),
  },
  stats: {
    gap: 8,
    paddingTop: hp(1),
  },
  statsText: {
    fontSize: hp(1.6),
  },
  statsNumber: {
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  descriptionSection: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
  description: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    lineHeight: hp(2.6),
  },
  username: {
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  fishSection: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    backgroundColor: theme.colors.primary + '05',
    marginHorizontal: wp(5),
    borderRadius: theme.radius.xl,
    marginBottom: hp(2),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: hp(1.5),
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: hp(2),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  fishDetails: {
    gap: hp(1.5),
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'white',
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  detailIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.gray + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: hp(2.2),
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  viewCommentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    marginHorizontal: wp(5),
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  viewCommentsText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
});