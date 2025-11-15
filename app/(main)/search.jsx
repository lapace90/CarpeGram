import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { useAuth } from '../../hooks/useAuth'
import Icon from '../../assets/icons'
import UserCard from '../../components/UserCard'
import { searchUsers, getSuggestedUsers } from '../../services/userService'

const Search = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (user) {
      loadSuggestions(user.id);
    }
  }, [user]);

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
    setHasSearched(true);
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
    setHasSearched(false);
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
      <Text style={styles.emptyTitle}>No suggestions</Text>
    </View>
  );

  const showingResults = hasSearched && searchQuery.trim().length > 0;

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Icon name="search" size={24} strokeWidth={2} color={theme.colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={clearSearch}>
                <Icon name="close" size={20} color={theme.colors.textLight} />
              </Pressable>
            )}
          </View>

          {searchQuery.length > 0 && (
            <Pressable style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </Pressable>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>
            {showingResults ? 'Search Results' : 'Suggested Users'}
          </Text>
          {showingResults && searchResults.length > 0 && (
            <Text style={styles.resultCount}>
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </Text>
          )}
        </View>

        {/* Results List */}
        {loading || suggestionsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={showingResults ? searchResults : suggestedUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={showingResults ? renderSearchEmpty : renderSuggestionsEmpty}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.xl,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  searchButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
  },
  searchButtonText: {
    color: 'white',
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
  },
  titleSection: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  resultCount: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginTop: 4,
  },
  listContent: {
    paddingTop: hp(1),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
    gap: 15,
  },
  emptyTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: wp(10),
  },
});