import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/common/ScreenWrapper'
import { useTheme } from '../../contexts/ThemeContext'
import { hp, wp } from '../../helpers/common'
import { useAuth } from '../../contexts/AuthContext'
import Icon from '../../assets/icons'
import UserCard from '../../components/UserCard'
import { searchUsers, getSuggestedUsers } from '../../services/userService'

const Search = () => {
  const { theme } = useTheme();
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

    setLoading(true);
    setHasSearched(true);
    const result = await searchUsers(searchQuery, user.id);
    
    if (result.success) {
      setSearchResults(result.data || []);
    } else {
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
      <Text style={[styles.emptyTitle, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
        No users found
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textLight }]}>
        Try searching for a different username
      </Text>
    </View>
  );

  const renderSuggestionsEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="user" size={60} strokeWidth={1.5} color={theme.colors.textLight} />
      <Text style={[styles.emptyTitle, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
        No suggestions
      </Text>
    </View>
  );

  const showingResults = hasSearched && searchQuery.trim().length > 0;

  return (
    <ScreenWrapper bg={theme.colors.card}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={[styles.searchSection, { borderBottomColor: theme.colors.gray }]}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.gray, borderRadius: theme.radius.xl }]}>
            <Icon name="search" size={24} strokeWidth={2} color={theme.colors.textLight} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search users..."
              placeholderTextColor={theme.colors.textLight}
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
            <Pressable 
              style={[styles.searchButton, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl }]} 
              onPress={handleSearch}
            >
              <Text style={[styles.searchButtonText, { fontWeight: theme.fonts.semiBold }]}>Search</Text>
            </Pressable>
          )}
        </View>

        {/* Title */}
        <View style={[styles.titleSection, { borderBottomColor: theme.colors.gray }]}>
          <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            {showingResults ? 'Search Results' : 'Suggested Users'}
          </Text>
          {showingResults && searchResults.length > 0 && (
            <Text style={[styles.resultCount, { color: theme.colors.textLight }]}>
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
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.8),
  },
  searchButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  searchButtonText: {
    color: 'white',
    fontSize: hp(1.7),
  },
  titleSection: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: hp(2),
  },
  resultCount: {
    fontSize: hp(1.5),
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
  },
  emptyText: {
    fontSize: hp(1.7),
    textAlign: 'center',
    paddingHorizontal: wp(10),
  },
});