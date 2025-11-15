import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import React from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from '../../components/NotificationItem';
import EmptyState from '../../components/EmptyState';

const Notifications = () => {
  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id);

  const renderNotification = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={markAsRead}
    />
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadText}>{unreadCount} unread</Text>
            )}
          </View>

          {unreadCount > 0 && (
            <Pressable onPress={markAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </Pressable>
          )}
        </View>

        {/* Liste des notifications */}
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          refreshing={refreshing}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              iconName="alertCircle"
              title="No notifications"
              message="You're all caught up! 🎣"
            />
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

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
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  unreadText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginTop: 2,
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: hp(1.6),
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
});