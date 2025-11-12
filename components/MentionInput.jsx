import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import { searchUsers } from '../services/userService';
import Avatar from './Avatar';

/**
 * TextInput avec autocomplétion des mentions @username
 */
const MentionInput = ({ 
  value, 
  onChangeText, 
  placeholder,
  style,
  currentUserId,
  multiline = false,
  numberOfLines,
  maxLength,
  ...props 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    handleTextChange(value);
  }, [value]);

  const handleTextChange = async (text) => {
    onChangeText(text);

    // Trouver la position du dernier @
    const cursorPosition = text.length;
    let lastAtPosition = -1;
    
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (text[i] === '@') {
        // Vérifier qu'il n'y a pas d'espace entre @ et le curseur
        const textAfterAt = text.substring(i + 1, cursorPosition);
        if (!textAfterAt.includes(' ')) {
          lastAtPosition = i;
          break;
        }
      }
      if (text[i] === ' ' || text[i] === '\n') {
        break;
      }
    }

    if (lastAtPosition !== -1) {
      const query = text.substring(lastAtPosition + 1, cursorPosition);
      
      if (query.length >= 1) {
        // Rechercher les utilisateurs
        const result = await searchUsers(query, currentUserId, 5);
        
        if (result.success && result.data.length > 0) {
          setSuggestions(result.data);
          setShowSuggestions(true);
          setMentionStart(lastAtPosition);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectUser = (user) => {
    if (mentionStart === -1) return;

    // Remplacer le texte depuis @ jusqu'au curseur par @username
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(value.length);
    const newText = `${beforeMention}@${user.username} ${afterMention}`;
    
    onChangeText(newText);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Refocus sur l'input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const renderSuggestion = ({ item }) => {
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

  return (
    <View style={styles.container}>
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
            renderItem={renderSuggestion}
            keyExtractor={item => item.id}
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
    flex: 1
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
});