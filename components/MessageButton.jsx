import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import Icon from '../assets/icons';
import { useRouter } from 'expo-router';
import { getOrCreateConversation } from '../services/conversationService';

const MessageButton = ({ currentUserId, otherUserId, variant = 'full' }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    
    const result = await getOrCreateConversation(currentUserId, otherUserId);
    
    setLoading(false);
    
    if (result.success) {
      router.push(`/chat/${result.conversationId}`);
    }
  };

  if (variant === 'icon') {
    return (
      <Pressable
        style={styles.iconButton}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Icon name="send" size={20} color={theme.colors.primary} />
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          <Icon name="send" size={20} color="white" />
          <Text style={styles.buttonText}>Message</Text>
        </>
      )}
    </Pressable>
  );
};

export default MessageButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.radius.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});