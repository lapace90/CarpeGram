import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import React from 'react';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import { useAuth } from '../../contexts/AuthContext';
import { useConversations } from '../../hooks/useConversations';
import ConversationItem from '../../components/ConversationItem';
import EmptyState from '../../components/common/EmptyState';
import Icon from '../../assets/icons';
import { useRouter } from 'expo-router';

const Messages = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { conversations, loading, refreshing, refresh } = useConversations(user?.id);

  const renderConversation = ({ item }) => (
    <ConversationItem conversation={item} />
  );

  return (
    <ScreenWrapper bg={theme.colors.card}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            Messages
          </Text>
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
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: hp(2.5),
  },
});