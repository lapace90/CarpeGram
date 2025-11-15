import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { supabase } from '../../../lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEvent } from '../../../hooks/useEvent';
import BackButton from '../../../components/BackButton';
import Icon from '../../../assets/icons';
import Avatar from '../../../components/Avatar';
import Button from '../../../components/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventMenu from '../../../components/event/EventMenu';
import EditEventModal from '../../../components/event/EditEventModal';

const EventDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    const { user } = useAuth();
    setUser(user);
  };

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

  const handleShare = () => {
    // Créer un post qui partage cet event
    router.push({
      pathname: '/newPost',
      params: { shareEventId: event.id }
    });
  };

  const handleMenuAction = (action) => {
    if (action === 'edit') {
      setShowEditModal(true);
    } else if (action === 'delete') {
      router.back();
    }
  };

  const handleParticipationToggle = async () => {
    if (isParticipant) {
      const result = await handleLeave();
      if (result?.success) {
        Alert.alert('Success', 'You left this event');
      }
    } else {
      if (isFull) {
        Alert.alert('Event Full', 'This event has reached maximum capacity');
        return;
      }
      const result = await handleJoin();
      if (result?.success) {
        Alert.alert('Success', 'You joined this event! 🎣');
      }
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.headerTitle}>Event Details</Text>
          {isCreator && !isPastEvent && (
            <Pressable onPress={() => setShowMenu(true)}>
              <Icon name="threeDotsHorizontal" size={24} color={theme.colors.text} />
            </Pressable>
          )}
          {!isCreator && <View style={{ width: 40 }} />}
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Event Badge */}
          <View style={styles.eventBadge}>
            <Icon name="calendar" size={24} color={theme.colors.primary} />
            <Text style={styles.eventBadgeText}>Fishing Event</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Creator */}
          <Pressable 
            style={styles.creatorSection}
            onPress={() => router.push(`/userProfile/${event.creator_id}`)}
          >
            <Avatar profile={event.creator} size={50} />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorLabel}>Organized by</Text>
              <Text style={styles.creatorName}>{displayName}</Text>
            </View>
            {isCreator && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>You</Text>
              </View>
            )}
          </Pressable>

          {/* Date & Time */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="calendar" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoText}>{formattedStartDate}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="clock" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoText}>
                  {formattedStartTime}
                  {formattedEndTime && ` - ${formattedEndTime}`}
                </Text>
              </View>
            </View>

            {/* Location */}
            {event.location && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon name="location" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoText}>{event.location}</Text>
                </View>
              </View>
            )}

            {/* Participants */}
            <Pressable 
              style={styles.infoRow}
              onPress={() => setShowParticipants(!showParticipants)}
            >
              <View style={styles.infoIconContainer}>
                <Icon name="user" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={styles.infoText}>
                  {event.participants_count || 0}
                  {event.max_participants ? ` / ${event.max_participants}` : ''} going
                </Text>
              </View>
              <Icon 
                name="arrowLeft" 
                size={18} 
                color={theme.colors.textLight}
                style={{ 
                  transform: [{ rotate: showParticipants ? '90deg' : '-90deg' }] 
                }}
              />
            </Pressable>

            {/* Participants List */}
            {showParticipants && participants.length > 0 && (
              <View style={styles.participantsList}>
                {participants.map((participant, index) => {
                  const participantName = participant.user?.show_full_name && participant.user?.first_name
                    ? `${participant.user.first_name} ${participant.user.last_name || ''}`
                    : `@${participant.user?.username || 'unknown'}`;
                  
                  return (
                    <Pressable 
                      key={index}
                      style={styles.participantItem}
                      onPress={() => router.push(`/userProfile/${participant.user?.id}`)}
                    >
                      <Avatar profile={participant.user} size={36} />
                      <Text style={styles.participantName}>{participantName}</Text>
                      {participant.user?.id === user?.id && (
                        <Text style={styles.youText}>(You)</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About this event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Status badges */}
          {(isPastEvent || isFull) && (
            <View style={styles.statusBadges}>
              {isPastEvent && (
                <View style={styles.pastBadge}>
                  <Icon name="alertCircle" size={16} color={theme.colors.textLight} />
                  <Text style={styles.pastBadgeText}>This event has ended</Text>
                </View>
              )}
              {isFull && !isPastEvent && (
                <View style={styles.fullBadge}>
                  <Icon name="alertCircle" size={16} color={theme.colors.rose} />
                  <Text style={styles.fullBadgeText}>Event is full</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        {!isPastEvent && (
          <View style={styles.bottomActions}>
            {/* Share Button */}
            <Pressable 
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Icon name="share" size={22} color={theme.colors.primary} />
            </Pressable>

            {/* Join/Leave Button (pas pour le créateur) */}
            {!isCreator && (
              <Button
                title={isParticipant ? "Leave Event" : (isFull ? "Event Full" : "Join Event")}
                onPress={handleParticipationToggle}
                loading={joining}
                disabled={isFull && !isParticipant}
                buttonStyle={[
                  styles.actionButton,
                  isParticipant && styles.leaveButton,
                ]}
                textStyle={isParticipant && styles.leaveButtonText}
              />
            )}

            {/* Share button pour le créateur */}
            {isCreator && (
              <Button
                title="Share Event"
                onPress={handleShare}
                buttonStyle={styles.actionButton}
                icon={<Icon name="share" size={20} color="white" />}
              />
            )}
          </View>
        )}
      </View>

      {/* Modals */}
      <EventMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        eventId={event.id}
        onAction={handleMenuAction}
      />

      <EditEventModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        event={event}
        currentUserId={user?.id}
        onUpdate={() => {
          refresh();
          setShowEditModal(false);
        }}
      />
    </ScreenWrapper>
  );
};

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
    gap: hp(2),
    paddingHorizontal: wp(5),
  },
  errorText: {
    fontSize: hp(2),
    color: theme.colors.textLight,
    textAlign: 'center',
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
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  scrollContent: {
    paddingBottom: hp(12),
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: theme.radius.lg,
    gap: wp(2),
    marginHorizontal: wp(5),
    marginTop: hp(2),
  },
  eventBadgeText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginHorizontal: wp(5),
    marginTop: hp(2),
    marginBottom: hp(3),
    lineHeight: hp(3.6),
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: theme.colors.aquaLight,
    marginHorizontal: wp(5),
    borderRadius: theme.radius.lg,
    marginBottom: hp(3),
  },
  creatorInfo: {
    flex: 1,
  },
  creatorLabel: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  creatorName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    marginTop: 2,
  },
  youBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: theme.radius.sm,
  },
  youBadgeText: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.medium,
    color: theme.colors.primary,
  },
  infoSection: {
    marginHorizontal: wp(5),
    marginBottom: hp(3),
    gap: hp(2),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  infoText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    marginTop: 2,
  },
  participantsList: {
    marginTop: hp(1),
    marginLeft: 53,
    gap: hp(1.5),
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
  },
  participantName: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    flex: 1,
  },
  youText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  descriptionSection: {
    marginHorizontal: wp(5),
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: hp(1.5),
  },
  description: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    lineHeight: hp(2.6),
  },
  statusBadges: {
    marginHorizontal: wp(5),
    gap: hp(1.5),
  },
  pastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    backgroundColor: theme.colors.gray + '40',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.md,
  },
  pastBadgeText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  fullBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    backgroundColor: theme.colors.rose + '15',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.md,
  },
  fullBadgeText: {
    fontSize: hp(1.7),
    color: theme.colors.rose,
    fontWeight: theme.fonts.medium,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: wp(3),
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray,
  },
  shareButton: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  actionButton: {
    flex: 1,
    height: 50,
  },
  leaveButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.rose,
  },
  leaveButtonText: {
    color: theme.colors.rose,
  },
});

export default EventDetail;