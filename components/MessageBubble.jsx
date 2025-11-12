import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import { useRouter } from 'expo-router';
import RichText from './RichText';

const MessageBubble = ({ message, isOwn }) => {
  const router = useRouter();
  const { type, content, post, read, created_at } = message;

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const renderContent = () => {
    switch (type) {
      case 'text':
        return (
          <RichText 
            text={content} 
            style={[styles.text, isOwn && styles.textOwn]} 
          />
        );

      case 'image':
        return (
          <Image
            source={{ uri: content }}
            style={styles.image}
            contentFit="cover"
          />
        );

      case 'post_share':
        return (
          <Pressable 
            style={styles.postShare}
            onPress={() => router.push(`/post/${post.id}`)}
          >
            {post?.image_url && (
              <Image
                source={{ uri: post.image_url }}
                style={styles.postImage}
                contentFit="cover"
              />
            )}
            <View style={styles.postInfo}>
              <Text style={styles.postLabel}>🎣 Shared post</Text>
              {post?.description && (
                <Text style={styles.postDescription} numberOfLines={2}>
                  {post.description}
                </Text>
              )}
              <Text style={styles.postAuthor}>
                by @{post?.profiles?.username}
              </Text>
            </View>
          </Pressable>
        );

      default:
        return <Text style={styles.text}>{content}</Text>;
    }
  };

  return (
    <View style={[styles.container, isOwn && styles.containerOwn]}>
      <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
        {renderContent()}
        
        <View style={styles.footer}>
          <Text style={[styles.time, isOwn && styles.timeOwn]}>
            {formatTime(created_at)}
          </Text>
          
          {isOwn && (
            <Text style={styles.status}>
              {read ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default MessageBubble;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    backgroundColor: theme.colors.gray + '30',
    borderRadius: theme.radius.xl,
    padding: 12,
    gap: 4,
  },
  bubbleOwn: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    lineHeight: hp(2.3),
  },
  textOwn: {
    color: 'white',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: theme.radius.lg,
  },
  postShare: {
    backgroundColor: 'white',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  postImage: {
    width: 200,
    height: 150,
  },
  postInfo: {
    padding: 10,
    gap: 4,
  },
  postLabel: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
  postDescription: {
    fontSize: hp(1.6),
    color: theme.colors.text,
  },
  postAuthor: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  time: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.8)',
  },
  status: {
    fontSize: hp(1.3),
    color: 'rgba(255,255,255,0.9)',
  },
});