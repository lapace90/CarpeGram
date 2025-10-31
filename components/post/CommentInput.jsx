import { View, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'

const CommentInput = ({ onSubmit, loading }) => {
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (text.trim().length === 0) return;

    const success = await onSubmit(text);
    
    if (success) {
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a comment..."
        placeholderTextColor={theme.colors.textLight}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
        editable={!loading}
      />
      
      <Pressable
        style={[
          styles.sendButton,
          (!text.trim() || loading) && styles.sendButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!text.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Icon 
            name="send" 
            size={20} 
            color={text.trim() ? 'white' : theme.colors.textLight}
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
    borderTopColor: theme.colors.gray,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: hp(1.7),
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.gray,
  },
});