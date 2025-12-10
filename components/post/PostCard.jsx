import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { Image } from 'expo-image'
import React, { useRef, useState, memo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { commonStyles } from '../../constants/commonStyles'
import { hp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { useLike } from '../../hooks/useLike'
import { useRepost } from '../../hooks/useRepost'
import { useSavedPost } from '../../hooks/useSavedPost'
import CommentsModal from './CommentsModal'
import RepostModal from './RepostModal'
import RepostHeader from './RepostHeader'
import PostMenu from './PostMenu'
import EditPostModal from './EditPostModal'
import RepostMenu from './RepostMenu'
import EditRepostModal from './EditRepostModal'
import EventCard from '../event/EventCard';
import Avatar from '../common/Avatar'
import RichText from '../common/RichText';

const PostCard = ({ post, currentUserId, onPress, onUpdate, isOwnProfile = false }) => {
  const { theme } = useTheme();
  const [showComments, setShowComments] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [showEditRepostModal, setShowEditRepostModal] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

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
    is_repost,
    repost_user_id,
    repost_comment,
    repost_privacy,
    repost_profiles,
    original_profiles,
    reposted_at,
  } = post;

  const postAuthor = is_repost ? original_profiles : profiles;
  const isOwnPost = currentUserId === user_id;
  const isOwnRepost = is_repost && currentUserId === repost_user_id;

  const { liked, likesCount, toggleLike } = useLike(id, likes_count, currentUserId);
  const { isReposted, toggleRepost } = useRepost(id, currentUserId);
  const { isSaved, toggleSave } = useSavedPost(id, currentUserId);

  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const displayName = postAuthor?.show_full_name && postAuthor?.first_name
    ? `${postAuthor.first_name} ${postAuthor.last_name || ''}`
    : `@${postAuthor?.username || 'unknown'}`;

  const handleLike = async () => {
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

    await toggleLike();
  };

  const handleRepost = async (privacy, comment) => {
    await toggleRepost(privacy, comment);
  };

  const handleMenuAction = async (action) => {
    if (action === 'delete' || action === 'edit') {
      if (action === 'edit') {
        setShowEditModal(true);
      } else if (onUpdate) {
        onUpdate();
      }
    }
  };

  const handleRepostMenuAction = async (action) => {
    if (action === 'delete' || action === 'edit') {
      if (action === 'edit') {
        setShowEditRepostModal(true);
      } else if (onUpdate) {
        onUpdate();
      }
    }
  };

  const handlePostUpdate = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleEventJoin = async (eventId) => {
    const { joinEvent } = require('../../services/eventService');
    const result = await joinEvent(eventId, currentUserId);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };

  const handleEventLeave = async (eventId) => {
    const { leaveEvent } = require('../../services/eventService');
    const result = await leaveEvent(eventId, currentUserId);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <View style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card, 
          borderRadius: theme.radius.xl,
          borderColor: theme.colors.gray,
          shadowColor: theme.colors.dark,
        }
      ]}>
        {is_repost && (
          <RepostHeader
            repostProfile={repost_profiles}
            comment={repost_comment}
            isOwnRepost={isOwnRepost}
            onMenuPress={isOwnRepost ? () => setShowRepostMenu(true) : null}
          />
        )}

        <Pressable onPress={onPress}>
          <View style={[commonStyles.flexRowBetween, commonStyles.paddingH12, commonStyles.paddingV12]}>
            <View style={[commonStyles.flexRowCenter, commonStyles.gap10]}>
              <Avatar profile={postAuthor} size={40} />

              <View>
                <Text style={[commonStyles.textSemiBold, styles.username]}>
                  {displayName}
                </Text>
                <Text style={[commonStyles.textLight, styles.timestamp]}>
                  {formatTimeAgo(is_repost ? reposted_at : created_at)}
                </Text>
              </View>
            </View>

            <View style={[commonStyles.flexRowCenter, commonStyles.gap8]}>
              <View style={[styles.privacyBadge, { backgroundColor: theme.colors.gray }]}>
                <Icon
                  name={privacy === 'public' ? 'globe' : privacy === 'followers' ? 'user' : 'heart'}
                  size={14}
                  color={theme.colors.primary}
                />
              </View>

              {isOwnPost && !is_repost && (
                <Pressable
                  onPress={() => setShowMenu(true)}
                  style={styles.menuButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="threeDotsHorizontal" size={18} color={theme.colors.text} />
                </Pressable>
              )}
            </View>
          </View>

          <Image source={{ uri: image_url }} style={styles.postImage} />

          {post.event && (
            <View style={styles.eventContainer}>
              <EventCard
                event={post.event}
                currentUserId={currentUserId}
                compact={true}
                onJoin={() => handleEventJoin(post.event.id)}
                onLeave={() => handleEventLeave(post.event.id)}
                isParticipant={post.event.is_participant}
              />
            </View>
          )}

          <View style={[commonStyles.flexRow, styles.actions]}>
            <Pressable onPress={handleLike} style={[commonStyles.flexRowCenter, commonStyles.gap6]}>
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <Icon
                  name="heart"
                  size={24}
                  fill={liked ? theme.colors.rose : 'transparent'}
                  color={liked ? theme.colors.rose : theme.colors.text}
                />
              </Animated.View>
              <Text style={[
                styles.actionText, 
                { color: theme.colors.text, fontWeight: theme.fonts.medium },
                liked && { color: theme.colors.rose, fontWeight: theme.fonts.semiBold }
              ]}>
                {likesCount}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowComments(true)}
              style={[commonStyles.flexRowCenter, commonStyles.gap6]}
            >
              <Icon name="comment" size={24} color={theme.colors.text} />
              <Text style={[styles.actionText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                {comments_count || 0}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowRepostModal(true)}
              style={[commonStyles.flexRowCenter, commonStyles.gap6]}
            >
              <Icon
                name="share"
                size={22}
                color={isReposted ? theme.colors.primary : theme.colors.text}
              />
            </Pressable>

            <View style={{ flex: 1 }} />
            <Pressable onPress={toggleSave} style={[commonStyles.flexRowCenter, commonStyles.gap6]}>
              <Icon
                name="bookmark"
                size={22}
                fill={isSaved ? theme.colors.primary : 'transparent'}
                color={isSaved ? theme.colors.primary : theme.colors.text}
              />
            </Pressable>
          </View>

          <View style={[commonStyles.paddingH12, styles.contentBottom]}>
            <Text style={[styles.description, { color: theme.colors.text }]}>
              <Text style={[styles.usernameInline, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                {displayName}{' '}
              </Text>
            </Text>
            <RichText
              text={description}
              style={[styles.description, { color: theme.colors.text }]}
            />
          </View>

          {(fish_species || fish_weight || bait || spot) && (
            <View style={[commonStyles.flexRow, styles.fishDetails]}>
              {fish_species && (
                <View style={[
                  styles.detailItem, 
                  { 
                    backgroundColor: theme.colors.primary + '10',
                    borderRadius: theme.radius.md,
                    borderColor: theme.colors.primary + '30',
                  }
                ]}>
                  <Text style={styles.detailLabel}>🐟</Text>
                  <Text style={[styles.detailText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                    {fish_species}
                  </Text>
                </View>
              )}
              {fish_weight && (
                <View style={[
                  styles.detailItem, 
                  { 
                    backgroundColor: theme.colors.primary + '10',
                    borderRadius: theme.radius.md,
                    borderColor: theme.colors.primary + '30',
                  }
                ]}>
                  <Text style={styles.detailLabel}>⚖️</Text>
                  <Text style={[styles.detailText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                    {fish_weight} kg
                  </Text>
                </View>
              )}
              {bait && (
                <View style={[
                  styles.detailItem, 
                  { 
                    backgroundColor: theme.colors.primary + '10',
                    borderRadius: theme.radius.md,
                    borderColor: theme.colors.primary + '30',
                  }
                ]}>
                  <Text style={styles.detailLabel}>🎣</Text>
                  <Text style={[styles.detailText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                    {bait}
                  </Text>
                </View>
              )}
              {spot && (
                <View style={[
                  styles.detailItem, 
                  { 
                    backgroundColor: theme.colors.primary + '10',
                    borderRadius: theme.radius.md,
                    borderColor: theme.colors.primary + '30',
                  }
                ]}>
                  <Icon name="location" size={14} color={theme.colors.primary} />
                  <Text style={[styles.detailText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                    {spot}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Pressable>
      </View>

      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={id}
        currentUserId={currentUserId}
      />

      <RepostModal
        visible={showRepostModal}
        onClose={() => setShowRepostModal(false)}
        onRepost={handleRepost}
      />

      {isOwnPost && (
        <>
          <PostMenu
            visible={showMenu}
            onClose={() => setShowMenu(false)}
            postId={id}
            onAction={handleMenuAction}
          />

          <EditPostModal
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
            post={post}
            onUpdate={handlePostUpdate}
          />
        </>
      )}

      {isOwnRepost && (
        <>
          <RepostMenu
            visible={showRepostMenu}
            onClose={() => setShowRepostMenu(false)}
            userId={currentUserId}
            postId={id}
            onAction={handleRepostMenuAction}
          />

          <EditRepostModal
            visible={showEditRepostModal}
            onClose={() => setShowEditRepostModal(false)}
            repost={post}
            onUpdate={handlePostUpdate}
          />
        </>
      )}
    </>
  );
};

export default memo(PostCard);

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  username: {
    fontSize: hp(1.8),
  },
  timestamp: {
    fontSize: hp(1.4),
  },
  privacyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: '100%',
    height: hp(40),
  },
  actions: {
    gap: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: hp(1.6),
  },
  contentBottom: {
    paddingBottom: 10,
  },
  description: {
    fontSize: hp(1.7),
    lineHeight: hp(2.4),
  },
  usernameInline: {},
  fishDetails: {
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  detailLabel: {
    fontSize: hp(1.6),
  },
  detailText: {
    fontSize: hp(1.5),
  },
  eventContainer: {
    padding: 12,
  },
});