import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEvent } from '../../../hooks/useEvent';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons';
import Avatar from '../../../components/common/Avatar';
import Button from '../../../components/common/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventMenu from '../../../components/event/EventMenu';
import EditEventModal from '../../../components/event/EditEventModal';

const EventDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const {
    event,
    loading,
    participants,
    isParticipant,
    joining,
    handleJoin,
    handleLeave,
    refresh,
  } = useEvent(id, user?.id);

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!event) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.errorContainer}>
          <Icon name="alertCircle" size={60} color={theme.colors.textLight} />
          <Text style={styles.errorText}>Event not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ScreenWrapper>
    );
  }

  const eventDate = new Date(event.event_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isPastEvent = eventDate < new Date();
  const isFull = event.max_participants && event.participants_count >= event.max_participants;
  const isCreator = event.creator_id === user?.id;

  const formattedStartDate = format(eventDate, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedStartTime = format(eventDate, 'HH:mm');
  const formattedEndTime = endDate ? format(endDate, 'HH:mm') : null;

  const displayName = event.creator?.show_full_name && event.creator?.first_name
    ? `${event.creator.first_name} ${event.creator.last_name || ''}`
    : `@${event.creator?.username || 'unknown'}`;

  const handleJoinPress = async () => {
    if (isFull && !isParticipant) {
      Alert.alert('Event Full', 'This event has reached maximum capacity');
      return;
    }

    const result = await handleJoin();
    if (result?.success) {
      Alert.alert('Success', 'You joined the event!');
    }
  };

  const handleLeavePress = async () => {
    Alert.alert(
      'Leave Event',
      'Are you sure you want to leave this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const result = await handleLeave();
            if (result?.success) {
              Alert.alert('Success', 'You left the event');
            }
          },
        },
      ]
    );
  };

  const handleMenuAction = (action) => {
    if (action === 'edit') {
      setShowEditModal(true);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          {isCreator && (
            <Pressable onPress={() => setShowMenu(true)} style={styles.menuButton}>
              <Icon name="threeDotsHorizontal" size={24} color={theme.colors.text} />
            </Pressable>
          )}
        </View>

        {/* Event Info */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Creator */}
          <Pressable 
            style={styles.creatorRow}
            onPress={() => router.push(`/userProfile/${event.creator_id}`)}
          >
            <Avatar
              uri={event.creator?.avatar_url}
              size={hp(5)}
            />
            <View>
              <Text style={styles.creatorLabel}>Organized by</Text>
              <Text style={styles.creatorName}>{displayName}</Text>
            </View>
          </Pressable>

          {/* Date & Time */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="calendar" size={24} color={theme.colors.primary} />
              <View>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formattedStartDate}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="clock" size={24} color={theme.colors.primary} />
              <View>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {formattedStartTime}
                  {formattedEndTime && ` - ${formattedEndTime}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <Icon name="location" size={24} color={theme.colors.primary} />
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
          </View>

          {/* Participants */}
          <Pressable 
            style={styles.infoRow}
            onPress={() => setShowParticipants(true)}
          >
            <Icon name="user" size={24} color={theme.colors.primary} />
            <View>
              <Text style={styles.infoLabel}>Participants</Text>
              <Text style={styles.infoValue}>
                {event.participants_count}
                {event.max_participants && ` / ${event.max_participants}`}
                {isFull && ' (Full)'}
              </Text>
            </View>
          </Pressable>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Action Button */}
          {!isCreator && !isPastEvent && (
            <View style={styles.actionSection}>
              {isParticipant ? (
                <Button
                  title="Leave Event"
                  onPress={handleLeavePress}
                  loading={joining}
                  buttonStyle={styles.leaveButton}
                  textStyle={styles.leaveButtonText}
                />
              ) : (
                <Button
                  title={isFull ? "Event Full" : "Join Event"}
                  onPress={handleJoinPress}
                  loading={joining}
                  disabled={isFull}
                />
              )}
            </View>
          )}

          {isPastEvent && (
            <View style={styles.pastEventBanner}>
              <Text style={styles.pastEventText}>This event has ended</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Menu Modal */}
      {isCreator && (
        <EventMenu
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          eventId={event.id}
          onAction={handleMenuAction}
          onDelete={() => router.back()}
        />
      )}

      {/* Edit Modal */}
      {isCreator && (
        <EditEventModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          event={event}
          onUpdate={refresh}
        />
      )}
    </ScreenWrapper>
  );
};

export default EventDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(10),
    gap: 20,
  },
  errorText: {
    fontSize: hp(2),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  menuButton: {
    padding: 8,
  },
  content: {
    padding: wp(5),
    gap: 24,
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creatorLabel: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  creatorName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  descriptionSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  description: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    lineHeight: hp(2.6),
  },
  actionSection: {
    marginTop: 16,
  },
  leaveButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.rose,
  },
  leaveButtonText: {
    color: theme.colors.rose,
  },
  pastEventBanner: {
    padding: 16,
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  pastEventText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.semiBold,
  },
});