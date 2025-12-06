import { Text, StyleSheet, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { checkUsernameExists } from '../services/mentionService';
import { segmentText } from '../helpers/textParser';

const RichText = ({ text, style, numberOfLines }) => {
  const { theme } = useTheme();
  const router = useRouter();

  if (!text) return null;

  const segments = segmentText(text);

  const handleHashtagPress = (tag) => {
    router.push(`/hashtag/${tag}`);
  };

  const handleMentionPress = async (username) => {
    const result = await checkUsernameExists(username.toLowerCase());
    
    if (result.success && result.exists) {
      router.push(`/userProfile/${result.user.id}`);
    } else {
      Alert.alert('User not found', `@${username} doesn't exist`);
    }
  };

  return (
    <Text style={[styles.text, { color: theme.colors.text }, style]} numberOfLines={numberOfLines}>
      {segments.map((segment, index) => {
        if (segment.type === 'hashtag') {
          return (
            <Text
              key={`hashtag-${index}`}
              style={[styles.hashtag, { color: theme.colors.primary, fontWeight: theme.fonts.semiBold }]}
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
              style={[styles.mention, { color: theme.colors.primary, fontWeight: theme.fonts.semiBold }]}
              onPress={() => handleMentionPress(segment.value)}
            >
              @{segment.value}
            </Text>
          );
        }

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
    lineHeight: 22,
  },
  hashtag: {},
  mention: {},
});