import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { checkUsernameExists } from '../services/mentionService';
import { segmentText } from '../helpers/textParser';

/**
 * Composant pour afficher du texte avec hashtags et mentions cliquables
 * @param {string} text - Le texte à afficher
 * @param {object} style - Style personnalisé pour le texte
 * @param {number} numberOfLines - Nombre de lignes max (optionnel)
 */
const RichText = ({ text, style, numberOfLines }) => {
  const router = useRouter();

  if (!text) return null;

  const segments = segmentText(text);

  const handleHashtagPress = (tag) => {
    router.push(`/hashtag/${tag}`);
  };

const handleMentionPress = async (username) => {
  // Récupérer l'ID de l'utilisateur depuis son username
  const result = await checkUsernameExists(username.toLowerCase());
  
  if (result.success && result.exists) {
    // Naviguer vers le profil avec l'ID
    router.push(`/userProfile/${result.user.id}`);
  } else {
    Alert.alert('User not found', `@${username} doesn't exist`);
  }
};

  return (
    <Text style={[styles.text, style]} numberOfLines={numberOfLines}>
      {segments.map((segment, index) => {
        if (segment.type === 'hashtag') {
          return (
            <Text
              key={`hashtag-${index}`}
              style={styles.hashtag}
              onPress={() => handleHashtagPress(segment.value)}
            >
              #{segment.value}
            </Text>
          );
        }

        if (segment.type === 'mention') {
          return (
            <Text
              key={`mention-${index}`}
              style={styles.mention}
              onPress={() => handleMentionPress(segment.value)}
            >
              @{segment.value}
            </Text>
          );
        }

        // Texte normal
        return (
          <Text key={`text-${index}`}>
            {segment.value}
          </Text>
        );
      })}
    </Text>
  );
};

export default RichText;

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  hashtag: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
  mention: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
});