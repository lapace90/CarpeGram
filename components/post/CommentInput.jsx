import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { hp } from '../../helpers/common'
import Icon from '../../assets/icons'
import SmartInput from '../SmartInput'

const CommentInput = ({ onSubmit, loading, currentUserId }) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (text.trim().length === 0) return;

    const success = await onSubmit(text);

    if (success) {
      setText('');
    }
  };

  return (
    <View style={[styles.container, { borderTopColor: theme.colors.gray, backgroundColor: theme.colors.card }]}>
      <SmartInput
        value={text}
        onChangeText={setText}
        placeholder="Add a comment..."
        currentUserId={currentUserId}
        containerStyle={{ flex: 1 }}
        style={[
          styles.input, 
          { 
            backgroundColor: theme.colors.gray,
            borderRadius: theme.radius.xl,
            color: theme.colors.text,
          }
        ]}
        multiline
        maxLength={500}
        editable={!loading}
      />

      <Pressable
        style={[
          styles.sendButton,
          { backgroundColor: theme.colors.primary },
          (!text.trim() || loading) && { backgroundColor: theme.colors.gray }
        ]}
        onPress={handleSubmit}
        disabled={!text.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.card} />
        ) : (
          <Icon
            name="send"
            size={20}
            color={text.trim() ? theme.colors.card : theme.colors.textLight}
          />
        )}
      </Pressable>
    </View>
  );
};

export default CommentInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: hp(1.7),
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});