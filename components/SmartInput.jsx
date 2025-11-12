import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import { searchUsers } from '../services/userService';
import { searchHashtags } from '../services/hashtagService';
import Avatar from './Avatar';

/**
 * TextInput avec autocomplétion des mentions @username et hashtags #tag
 */
const MentionInput = ({ 
  value, 
  onChangeText, 
  placeholder,
  style,
  containerStyle,
  currentUserId,
  multiline = false,
  numberOfLines,
  maxLength,
  ...props 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState(null); // 'mention' ou 'hashtag'
  const [suggestionStart, setSuggestionStart] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    handleTextChange(value);
  }, [value]);

  const handleTextChange = async (text) => {
    onChangeText(text);

    const cursorPosition = text.length;
    let lastTriggerPosition = -1;
    let triggerChar = null;
    
    // Chercher le dernier @ ou #
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (text[i] === '@' || text[i] === '#') {
        const textAfterTrigger = text.substring(i + 1, cursorPosition);
        if (!textAfterTrigger.includes(' ')) {
          lastTriggerPosition = i;
          triggerChar = text[i];
          break;
        }
      }
      if (text[i] === ' ' || text[i] === '\n') {
        break;
      }
    }

    if (lastTriggerPosition !== -1 && triggerChar) {
      const query = text.substring(lastTriggerPosition + 1, cursorPosition);
      
      if (query.length >= 1) {
        if (triggerChar === '@') {
          // Rechercher des utilisateurs
          const result = await searchUsers(query, currentUserId, 5);
          
          if (result.success && result.data.length > 0) {
            setSuggestions(result.data);
            setShowSuggestions(true);
            setSuggestionType('mention');
            setSuggestionStart(lastTriggerPosition);
          } else {
            setShowSuggestions(false);
          }
        } else if (triggerChar === '#') {
          // Rechercher des hashtags
          const result = await searchHashtags(query, 5);
          
          if (result.success && result.data.length > 0) {
            setSuggestions(result.data);
            setShowSuggestions(true);
            setSuggestionType('hashtag');
            setSuggestionStart(lastTriggerPosition);
          } else {
            setShowSuggestions(false);
          }
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectUser = (user) => {
    if (suggestionStart === -1) return;

    const beforeMention = value.substring(0, suggestionStart);
    const afterMention = value.substring(value.length);
    const newText = `${beforeMention}@${user.username} ${afterMention}`;
    
    onChangeText(newText);
    setShowSuggestions(false);
    setSuggestions([]);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const selectHashtag = (hashtag) => {
    if (suggestionStart === -1) return;

    const beforeHashtag = value.substring(0, suggestionStart);
    const afterHashtag = value.substring(value.length);
    const newText = `${beforeHashtag}#${hashtag.tag} ${afterHashtag}`;
    
    onChangeText(newText);
    setShowSuggestions(false);
    setSuggestions([]);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const renderUserSuggestion = ({ item }) => {
    const displayName = item.show_full_name && item.first_name
      ? `${item.first_name} ${item.last_name || ''}`
      : `@${item.username}`;

    return (
      <Pressable 
        style={styles.suggestionItem}
        onPress={() => selectUser(item)}
      >
        <Avatar profile={item} size={36} />
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionName}>{displayName}</Text>
          <Text style={styles.suggestionUsername}>@{item.username}</Text>
        </View>
      </Pressable>
    );
  };

  const renderHashtagSuggestion = ({ item }) => {
    return (
      <Pressable 
        style={styles.suggestionItem}
        onPress={() => selectHashtag(item)}
      >
        <View style={styles.hashtagIcon}>
          <Text style={styles.hashtagIconText}>#</Text>
        </View>
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionName}>#{item.tag}</Text>
          <Text style={styles.suggestionUsername}>{item.usage_count} posts</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        ref={inputRef}
        style={[styles.input, style]}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textLight}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        {...props}
      />

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={suggestionType === 'mention' ? renderUserSuggestion : renderHashtagSuggestion}
            keyExtractor={item => item.id || item.tag}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
};

export default MentionInput;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  input: {
    // Styles seront passés via la prop style
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    maxHeight: hp(25),
    marginBottom: 8,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsList: {
    maxHeight: hp(25),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '40',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  suggestionUsername: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  hashtagIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashtagIconText: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
});