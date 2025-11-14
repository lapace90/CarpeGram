import { View, Text, StyleSheet, FlatList, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { supabase } from '../../../lib/supabase';
import { useMessages } from '../../../hooks/useMessages';
import MessageBubble from '../../../components/MessageBubble';
import ChatInput from '../../../components/ChatInput';
import Avatar from '../../../components/Avatar';
import Icon from '../../../assets/icons';

const Chat = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef(null);
  const [user, setUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    const { data } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', id)
      .single();

    if (data && user) {
      const otherUserId = data.user1_id === user.id ? data.user2_id : data.user1_id;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, first_name, last_name, show_full_name')
        .eq('id', otherUserId)
        .single();

      setOtherUser(profile);
    }
  };

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

  const displayName = otherUser?.show_full_name && otherUser?.first_name
    ? `${otherUser.first_name} ${otherUser.last_name || ''}`
    : `@${otherUser?.username || 'User'}`;

  const renderMessage = ({ item }) => (
    <MessageBubble
      message={item}
      isOwn={item.sender_id === user?.id}
    />
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header - EN DEHORS du KeyboardAvoidingView */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>

          <Pressable
            style={styles.userInfo}
            onPress={() => router.push(`/userProfile/${otherUser?.id}`)}
          >
            <Avatar profile={otherUser} size={36} />
            <Text style={styles.userName}>{displayName}</Text>
          </Pressable>

          <View style={{ width: 40 }} />
        </View>

        {/* Messages + Input - DANS le KeyboardAvoidingView */}
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 40}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          <ChatInput
            onSendText={handleSendText}
            onSendImage={handleSendImage}
            loading={sending}
          />
        </KeyboardAvoidingView>
      </View>
    </ScreenWrapper>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  userName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 12,
  },
});