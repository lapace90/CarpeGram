import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import React from 'react'
import { theme } from '../../constants/theme'
import { commonStyles } from '../../constants/commonStyles'
import { hp } from '../../helpers/common'
import Icon from '../../assets/icons'
import EmptyState from '../EmptyState'

const PostsGrid = ({ posts, loading, onPostPress, onCreatePress }) => {
  if (loading) {
    return (
      <View style={[commonStyles.center, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState 
        iconName="image"
        title="No posts yet"
        message="Share your first catch and start your fishing journey!"
        buttonText="Create Post"
        onButtonPress={onCreatePress}
      />
    );
  }

  const rows = [];
  for (let i = 0; i < posts.length; i += 3) {
    rows.push(posts.slice(i, i + 3));
  }

  const renderPost = (item) => {
    if (!item) return <View key={`empty-${Math.random()}`} style={styles.gridItem} />;
    
    const { image_url, fish_species, likes_count, comments_count } = item;

    return (
      <Pressable 
        key={item.id} 
        style={styles.gridItem} 
        onPress={() => onPostPress(item)}
      >
        <Image source={{ uri: image_url }} style={styles.gridImage} />
        
        <View style={styles.overlay}>
          {fish_species && (
            <View style={styles.speciesContainer}>
              <Text style={styles.speciesText}>{fish_species}</Text>
            </View>
          )}
          
          <View style={[commonStyles.flexRow, styles.statsContainer]}>
            <View style={[commonStyles.flexRowCenter, styles.statItem]}>
              <Icon name="heart" size={16} color="white" fill="white" />
              <Text style={styles.statText}>{likes_count || 0}</Text>
            </View>
            <View style={[commonStyles.flexRowCenter, styles.statItem]}>
              <Icon name="comment" size={16} color="white" />
              <Text style={styles.statText}>{comments_count || 0}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(post => renderPost(post))}
          {row.length < 3 && Array(3 - row.length).fill(null).map((_, i) => (
            <View key={`empty-${rowIndex}-${i}`} style={styles.gridItem} />
          ))}
        </View>
      ))}
    </View>
  );
};

export default PostsGrid;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: theme.colors.gray,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    padding: 6,
  },
  speciesContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  speciesText: {
    color: 'white',
    fontSize: hp(1.3),
    fontWeight: theme.fonts.medium,
  },
  statsContainer: {
    gap: 8,
    alignSelf: 'flex-end',
  },
  statItem: {
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  statText: {
    color: 'white',
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
  },
  loadingContainer: {
    paddingVertical: hp(10),
  },
});