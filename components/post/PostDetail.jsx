import { View, Text, StyleSheet, Modal, ScrollView, Image, Pressable, Animated, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import { theme } from '../../constants/theme'
import { commonStyles } from '../../constants/commonStyles'
import { hp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { useLike } from '../../hooks/useLike'
import CommentsModal from './CommentsModal'
import LikesModal from './LikesModal'
import ModalHeader from '../ModalHeader'
import Avatar from '../Avatar'

const PostDetail = ({ visible, onClose, post, currentUserId, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

  const { liked, likesCount, toggleLike } = useLike(
    post?.id || null, 
    post?.likes_count || 0, 
    currentUserId
  );

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
    created_at,
    profiles,
    user_id,
  } = post;

  const isOwnPost = currentUserId === user_id;

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

  const displayName = profiles?.show_full_name && profiles?.first_name
    ? `${profiles.first_name} ${profiles.last_name || ''}`
    : `@${profiles?.username || 'unknown'}`;

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
            onDelete(id);
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
        <View style={commonStyles.absoluteFill}>
          <ModalHeader 
            title="Post Details"
            onClose={onClose}
            rightElement={
              isOwnPost && (
                <Pressable onPress={handleDelete}>
                  <Icon name="delete" size={20} color={theme.colors.rose} />
                </Pressable>
              )
            }
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[commonStyles.flexRow, styles.userSection]}>
              <Avatar profile={profiles} size={48} />
              
              <View style={styles.userInfo}>
                <Text style={[commonStyles.textSemiBold, styles.displayName]}>
                  {displayName}
                </Text>
                <Text style={[commonStyles.textLight, styles.timestamp]}>
                  {formatDate(created_at)}
                </Text>
              </View>

              <View style={styles.privacyBadge}>
                <Icon
                  name={privacy === 'public' ? 'globe' : privacy === 'followers' ? 'user' : 'heart'}
                  size={16}
                  color={theme.colors.primary}
                />
              </View>
            </View>

            <Image source={{ uri: image_url }} style={styles.image} />

            <View style={[commonStyles.flexRow, styles.actions]}>
              <Pressable onPress={handleLike}>
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  <Icon
                    name="heart"
                    size={28}
                    fill={liked ? theme.colors.rose : 'transparent'}
                    color={liked ? theme.colors.rose : theme.colors.text}
                  />
                </Animated.View>
              </Pressable>

              <Pressable onPress={() => setShowComments(true)}>
                <Icon name="comment" size={28} color={theme.colors.text} />
              </Pressable>

              <Pressable>
                <Icon name="send" size={26} color={theme.colors.text} />
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
                <Text style={styles.statsNumber}>{post.comments_count || 0}</Text> comments
              </Text>
            </Pressable>

            <View style={styles.descriptionSection}>
              <Text style={styles.description}>
                <Text style={styles.username}>{displayName} </Text>
                {description}
              </Text>
            </View>

            {(fish_species || fish_weight || bait || spot) && (
              <View style={styles.fishSection}>
                <Text style={styles.sectionTitle}>🎣 Catch Details</Text>
                <View style={styles.fishDetails}>
                  {fish_species && (
                    <View style={[commonStyles.flexRowBetween, styles.detailRow]}>
                      <Text style={[commonStyles.textLight, styles.detailLabel]}>
                        Species
                      </Text>
                      <Text style={styles.detailValue}>{fish_species}</Text>
                    </View>
                  )}
                  {fish_weight && (
                    <View style={[commonStyles.flexRowBetween, styles.detailRow]}>
                      <Text style={[commonStyles.textLight, styles.detailLabel]}>
                        Weight
                      </Text>
                      <Text style={styles.detailValue}>{fish_weight} kg</Text>
                    </View>
                  )}
                  {bait && (
                    <View style={[commonStyles.flexRowBetween, styles.detailRow]}>
                      <Text style={[commonStyles.textLight, styles.detailLabel]}>
                        Bait
                      </Text>
                      <Text style={styles.detailValue}>{bait}</Text>
                    </View>
                  )}
                  {spot && (
                    <View style={[commonStyles.flexRowBetween, styles.detailRow]}>
                      <Text style={[commonStyles.textLight, styles.detailLabel]}>
                        Location
                      </Text>
                      <Text style={styles.detailValue}>{spot}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <Pressable
              style={[commonStyles.flexRowCenter, styles.viewCommentsButton]}
              onPress={() => setShowComments(true)}
            >
              <Icon name="comment" size={20} color={theme.colors.primary} />
              <Text style={styles.viewCommentsText}>
                View all {post.comments_count || 0} comments
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
    </>
  );
};

export default PostDetail;

const styles = StyleSheet.create({
  userSection: {
    padding: 16,
    gap: 12,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: hp(1.9),
  },
  timestamp: {
    fontSize: hp(1.5),
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
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stats: {
    gap: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statsText: {
    fontSize: hp(1.7),
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
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: hp(1.7),
  },
  detailValue: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  viewCommentsButton: {
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