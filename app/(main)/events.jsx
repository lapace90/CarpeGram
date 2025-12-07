import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import React from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEvents } from '../../hooks/useEvents';
import EventCard from '../../components/event/EventCard';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';

const Events = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { events, loading, hasMore, loadMore, refresh } = useEvents('upcoming', user?.id);

  const handleEventPress = (event) => {
    router.push(`/event/${event.id}`);
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventItem}>
      <EventCard
        event={item}
        currentUserId={user?.id}
        compact={false}
        onPress={() => handleEventPress(item)}
        onJoin={async () => {
          const { joinEvent } = require('../../services/eventService');
          await joinEvent(item.id, user?.id);
          refresh();
        }}
        onLeave={async () => {
          const { leaveEvent } = require('../../services/eventService');
          await leaveEvent(item.id, user?.id);
          refresh();
        }}
        isParticipant={item.is_participant}
      />
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        icon="calendar"
        title="No Upcoming Events"
        subtitle="Be the first to create a fishing event!"
      />
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.card}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
          <BackButton router={router}/>
          <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            Fishing Events
          </Text>
          <Pressable 
            onPress={() => router.push('/createEvent')} 
            style={[styles.createButton, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}
          >
            <Text style={[styles.createButtonText, { fontWeight: theme.fonts.semiBold }]}>
              + Create
            </Text>
          </Pressable>
        </View>

        {/* Events List */}
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={refresh}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Events;

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
  title: {
    fontSize: hp(2.5),
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: 'white',
    fontSize: hp(1.6),
  },
  listContent: {
    padding: wp(5),
  },
  eventItem: {
    marginBottom: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});