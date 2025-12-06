import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { hp } from '../helpers/common';
import { useRouter } from 'expo-router';
import RichText from './RichText';

const MessageBubble = ({ message, isOwn }) => {
  const { theme } = useTheme();
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
            style={[styles.text, { color: theme.colors.text }, isOwn && styles.textOwn]} 
          />
        );

      case 'image':
        return (
          <Image
            source={{ uri: content }}
            style={[styles.image, { borderRadius: theme.radius.lg }]}
            contentFit="cover"
          />
        );

      case 'post_share':
        return (
          <Pressable 
            style={[styles.postShare, { borderRadius: theme.radius.lg, borderColor: theme.colors.gray }]}
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
              <Text style={[styles.postLabel, { fontWeight: theme.fonts.semiBold, color: theme.colors.primary }]}>
                🎣 Shared post
              </Text>
              {post?.description && (
                <Text style={[styles.postDescription, { color: theme.colors.text }]} numberOfLines={2}>
                  {post.description}
                </Text>
              )}
              <Text style={[styles.postAuthor, { color: theme.colors.textLight }]}>
                by @{post?.profiles?.username}
              </Text>
            </View>
          </Pressable>
        );

      default:
        return <Text style={[styles.text, { color: theme.colors.text }]}>{content}</Text>;
    }
  };

  return (
    <View style={[styles.container, isOwn && styles.containerOwn]}>
      <View style={[
        styles.bubble, 
        { backgroundColor: theme.colors.gray + '30', borderRadius: theme.radius.xl },
        isOwn && { backgroundColor: theme.colors.primary }
      ]}>
        {renderContent()}
        
        <View style={styles.footer}>
          <Text style={[styles.time, { color: theme.colors.textLight }, isOwn && styles.timeOwn]}>
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
    padding: 12,
    gap: 4,
  },
  text: {
    fontSize: hp(1.7),
    lineHeight: hp(2.3),
  },
  textOwn: {
    color: 'white',
  },
  image: {
    width: 200,
    height: 200,
  },
  postShare: {
    backgroundColor: 'white',
    overflow: 'hidden',
    borderWidth: 1,
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
  },
  postDescription: {
    fontSize: hp(1.6),
  },
  postAuthor: {
    fontSize: hp(1.4),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  time: {
    fontSize: hp(1.2),
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.8)',
  },
  status: {
    fontSize: hp(1.3),
    color: 'rgba(255,255,255,0.9)',
  },
});