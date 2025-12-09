import { View, Text, StyleSheet, FlatList, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useMessages } from '../../../hooks/useMessages';
import { useConversation } from '../../../hooks/useConversation';
import { useAuth } from '../../../contexts/AuthContext';
import MessageBubble from '../../../components/MessageBubble';
import ChatInput from '../../../components/ChatInput';
import Avatar from '../../../components/common/Avatar';
import Icon from '../../../assets/icons';

const Chat = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef(null);
  const { user } = useAuth();
  const { conversation, otherUser, loading: conversationLoading } = useConversation(id, user?.id);
  const { messages, loading, sending, sendText, sendImage } = useMessages(id, user?.id);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendText = async (text) => {
    await sendText(text);
  };

  const handleSendImage = async (uri) => {
    await sendImage(uri);
  };

  if (conversationLoading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const displayName = otherUser?.show_full_name && otherUser?.first_name
    ? `${otherUser.first_name} ${otherUser.last_name || ''}`
    : `@${otherUser?.username || 'unknown'}`;

  return (
    <ScreenWrapper bg="white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>
          
          <Pressable 
            style={styles.headerCenter}
            onPress={() => router.push(`/userProfile/${otherUser?.id}`)}
          >
            <Avatar profile={otherUser} size={36} />
            <Text style={styles.headerTitle}>{displayName}</Text>
          </Pressable>

          <View style={{ width: 40 }} />
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.sender_id === user?.id}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Input */}
        <ChatInput
          onSendText={handleSendText}
          onSendImage={handleSendImage}
          loading={sending}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Chat;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    marginLeft: wp(2),
  },
  headerTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  messagesList: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
});