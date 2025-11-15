import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useEvents } from '../../hooks/useEvents';
import EventCard from '../../components/event/EventCard';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';

const Events = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    const { user } = useAuth();
    setUser(user);
  };

  const { events, loading, hasMore, loadMore, refresh } = useEvents('upcoming', user?.id);

  const handleEventPress = (event) => {
    // Pour l'instant, on peut juste afficher l'event
    // Plus tard tu pourras créer un écran détail d'event
    console.log('Event pressed:', event.id);
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
    if (!hasMore || loading) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.title}>Upcoming Events</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* List */}
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  listContent: {
    paddingVertical: hp(2),
    flexGrow: 1,
  },
  eventItem: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  footer: {
    paddingVertical: hp(2),
    alignItems: 'center',
  },
});

export default Events;