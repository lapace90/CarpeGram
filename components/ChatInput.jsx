import { View, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import Icon from '../assets/icons';
import * as ImagePicker from 'expo-image-picker';

const ChatInput = ({ onSendText, onSendImage, loading }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim().length === 0) return;
    onSendText(text);
    setText('');
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      onSendImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.iconButton}
        onPress={handlePickImage}
        disabled={loading}
      >
        <Icon name="image" size={24} color={theme.colors.primary} />
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor={theme.colors.textLight}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={1000}
        editable={!loading}
      />

      <Pressable
        style={[
          styles.sendButton,
          (!text.trim() || loading) && styles.sendButtonDisabled
        ]}
        onPress={handleSend}
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

export default ChatInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray,
    backgroundColor: 'white',
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.gray + '30',
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