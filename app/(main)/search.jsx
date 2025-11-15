import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { supabase } from '../../lib/supabase'
import Icon from '../../assets/icons'
import UserCard from '../../components/UserCard'
import { searchUsers, getSuggestedUsers } from '../../services/userService'

const Search = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    getUserAndSuggestions();
  }, []);

  const getUserAndSuggestions = async () => {
    // Get current user
    const { user } = useAuth();
    setUser(user);

    // Load suggestions
    if (user) {
      await loadSuggestions(user.id);
    }
  };

  const loadSuggestions = async (userId) => {
    setSuggestionsLoading(true);
    const result = await getSuggestedUsers(userId, 15);
    
    if (result.success) {
      setSuggestedUsers(result.data || []);
    }
    
    setSuggestionsLoading(false);
  };

  const handleSearch = async () => {
    if (!user || searchQuery.trim().length === 0) return;

    console.log('Starting search with query:', searchQuery);
    setLoading(true);
    const result = await searchUsers(searchQuery, user.id);
    console.log('Search result:', result);
    
    if (result.success) {
      setSearchResults(result.data || []);
      console.log('Search results count:', result.data?.length);
    } else {
      console.log('Search failed:', result.msg);
      setSearchResults([]);
    }
    
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderUserItem = ({ item }) => (
    <UserCard user={item} currentUserId={user?.id} />
  );

  const renderSearchEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search" size={60} strokeWidth={1.5} color={theme.colors.textLight} />
      <Text style={styles.emptyTitle}>No users found</Text>
      <Text style={styles.emptyText}>
        Try searching for a different username
      </Text>
    </View>
  );

  const renderSuggestionsEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="user" size={60} strokeWidth={1.5} color={theme.colors.textLight} />
      <Text style={styles.emptyTitle}>No suggestions yet</Text>
      <Text style={styles.emptyText}>
        Start following anglers to get personalized recommendations
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover Anglers</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} strokeWidth={2} color={theme.colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Pressable onPress={handleSearch} style={styles.searchButton}>
            <Icon name="arrowLeft" size={20} strokeWidth={2.5} color="white" style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>
        </View>

        {/* Content */}
        {searchQuery.trim().length > 0 && searchResults.length === 0 && !loading ? (
          // Empty search results
          <View style={styles.emptyContainer}>
            <Icon name="search" size={60} strokeWidth={1.5} color={theme.colors.textLight} />
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptyText}>
              No results for "{searchQuery}"
            </Text>
          </View>
        ) : searchQuery.trim().length > 0 && searchResults.length > 0 ? (
          // Search Results
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          // Suggestions
          <View style={styles.suggestionsContainer}>
            <Text style={styles.sectionTitle}>Suggested for you</Text>
            {suggestionsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={suggestedUsers}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderSuggestionsEmpty}
              />
            )}
          </View>
        )}
      </View>
    </ScreenWrapper>
  )
}

export default Search

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  header: {
    marginVertical: hp(2),
  },
  title: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.xl,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    marginBottom: hp(2),
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(2),
    color: theme.colors.text,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    padding: 8,
    borderRadius: theme.radius.md,
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: hp(2),
  },
  listContainer: {
    gap: 12,
    paddingBottom: hp(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10),
    gap: 12,
  },
  emptyTitle: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: wp(10),
  },
})