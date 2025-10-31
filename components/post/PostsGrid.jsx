import { View, Text, StyleSheet, Pressable, Image, FlatList, ActivityIndicator } from 'react-native'
import React from 'react'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'

const PostsGrid = ({
  posts = [],
  loading = false,
  limit = null,
  columns = 3,
  gap = 2,
  showStats = true,
  showSpecies = true,
  onPostPress,
  onEndReached,
  emptyTitle = "No posts yet",
  emptyText = "Share your first catch! 🎣",
  emptyIcon = "image",
  onEmptyPress,
  containerStyle,
}) => {
  // Limiter les posts si nécessaire
  const displayPosts = limit ? posts.slice(0, limit) : posts;

  // Calculer la largeur des items
  const totalGap = gap * (columns - 1);
  const itemWidth = (wp(100) - wp(10) - totalGap) / columns;

  const renderItem = ({ item }) => (
    <Pressable
      style={[styles.gridItem, { width: itemWidth, height: itemWidth, marginRight: gap }]}
      onPress={() => onPostPress && onPostPress(item)}
    >
      <Image source={{ uri: item.image_url }} style={styles.gridImage} />
      
      {/* Overlay avec infos */}
      <View style={styles.overlay}>
        {/* Espèce de poisson */}
        {showSpecies && item.fish_species && (
          <View style={styles.speciesContainer}>
            <Text style={styles.speciesText}>🐟 {item.fish_species}</Text>
          </View>
        )}
        
        {/* Stats (likes + comments) */}
        {showStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="heart" size={16} color="white" fill="white" />
              <Text style={styles.statText}>{item.likes_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="comment" size={16} color="white" fill="white" />
              <Text style={styles.statText}>{item.comments_count || 0}</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name={emptyIcon} size={80} strokeWidth={1.5} color={theme.colors.textLight} />
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyText}>{emptyText}</Text>
        {onEmptyPress && (
          <Pressable style={styles.emptyButton} onPress={onEmptyPress}>
            <Icon name="plus" size={20} color="white" />
            <Text style={styles.emptyButtonText}>Create Post</Text>
          </Pressable>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (displayPosts.length === 0) {
    return renderEmpty();
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={displayPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        scrollEnabled={false} // Désactivé car dans un ScrollView parent
      />
    </View>
  );
};

export default PostsGrid;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(5),
  },
  row: {
    marginBottom: 2,
  },
  gridItem: {
    position: 'relative',
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: hp(8),
    paddingHorizontal: wp(5),
    gap: 12,
  },
  emptyTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: 10,
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    marginTop: 10,
  },
  emptyButtonText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
});