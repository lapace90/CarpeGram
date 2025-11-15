import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'expo-router'
import Icon from '../assets/icons'
import { fetchUserPosts } from '../services/postService'
import PostsGrid from '../components/post/PostsGrid'
import PostDetail from '../components/post/PostDetail'

const postsGallery = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  
  // Filters
  const [activeFilter, setActiveFilter] = useState('all'); // all, public, followers, close_friends
  const [sortBy, setSortBy] = useState('recent'); // recent, oldest, most_liked

  useEffect(() => {
    if (user) {
      loadUserPosts();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [posts, activeFilter, sortBy]);

  const loadUserPosts = async () => {
    setLoading(true);

    if (user) {
      const result = await fetchUserPosts(user.id);
      if (result.success) {
        setPosts(result.data || []);
      }
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...posts];

    // Filter by privacy
    if (activeFilter !== 'all') {
      filtered = filtered.filter(post => post.privacy === activeFilter);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'most_liked') {
      filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    }

    setFilteredPosts(filtered);
  };

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handleDeletePost = async () => {
    await loadUserPosts();
  };

  const FilterButton = ({ value, label, icon }) => (
    <Pressable
      style={[
        styles.filterButton,
        activeFilter === value && styles.filterButtonActive
      ]}
      onPress={() => setActiveFilter(value)}
    >
      {icon && <Icon name={icon} size={16} color={activeFilter === value ? 'white' : theme.colors.text} />}
      <Text style={[
        styles.filterButtonText,
        activeFilter === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </Pressable>
  );

  const SortButton = ({ value, label }) => (
    <Pressable
      style={[
        styles.sortButton,
        sortBy === value && styles.sortButtonActive
      ]}
      onPress={() => setSortBy(value)}
    >
      <Text style={[
        styles.sortButtonText,
        sortBy === value && styles.sortButtonTextActive
      ]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            All Catches ({filteredPosts.length})
          </Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Privacy Filters */}
          <View style={styles.filtersSection}>
            <Text style={styles.filterLabel}>Privacy</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filtersRow}>
                <FilterButton value="all" label="All" icon="image" />
                <FilterButton value="public" label="Public" icon="share" />
                <FilterButton value="followers" label="Followers" icon="user" />
                <FilterButton value="close_friends" label="Close Friends" icon="heart" />
              </View>
            </ScrollView>
          </View>

          {/* Sort Options */}
          <View style={styles.sortSection}>
            <Text style={styles.filterLabel}>Sort by</Text>
            <View style={styles.sortRow}>
              <SortButton value="recent" label="Most Recent" />
              <SortButton value="oldest" label="Oldest" />
              <SortButton value="most_liked" label="Most Liked" />
            </View>
          </View>

          {/* Posts Grid */}
          <View style={styles.gridSection}>
            <PostsGrid
              posts={filteredPosts}
              loading={loading}
              columns={3}
              gap={2}
              showStats={true}
              showSpecies={true}
              onPostPress={handlePostPress}
              emptyTitle="No posts found"
              emptyText="Try adjusting your filters 🎣"
              emptyIcon="image"
            />
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>

      {/* Post Detail Modal */}
      <PostDetail
        visible={showPostDetail}
        onClose={() => setShowPostDetail(false)}
        post={selectedPost}
        currentUserId={user?.id}
        onDelete={handleDeletePost}
      />
    </ScreenWrapper>
  );
};

export default postsGallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  filtersSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  filterLabel: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    paddingHorizontal: wp(5),
    marginBottom: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: hp(1.6),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  sortSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortButtonText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  sortButtonTextActive: {
    color: 'white',
  },
  gridSection: {
    paddingTop: 15,
  },
});