import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { supabase } from '../../lib/supabase';
import { useConversations } from '../../hooks/useConversations';
import ConversationItem from '../../components/ConversationItem';
import EmptyState from '../../components/EmptyState';
import Icon from '../../assets/icons';
import { useRouter } from 'expo-router';

const Messages = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const { conversations, loading, refreshing, refresh } = useConversations(user?.id);

  const renderConversation = ({ item }) => (
    <ConversationItem conversation={item} />
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Liste des conversations */}
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={item => item.id}
          refreshing={refreshing}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              iconName="send"
              title="No messages yet"
              message="Start a conversation with other anglers!"
            />
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default Messages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
});