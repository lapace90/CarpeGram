import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import Avatar from '../Avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'expo-router';

const EventCard = ({ 
  event, 
  onJoin, 
  onLeave, 
  isParticipant = false,
  currentUserId,
  compact = false // pour affichage dans les posts
}) => {
  const router = useRouter();
  
  if (!event) return null;

  const eventDate = new Date(event.event_date);
  const isPastEvent = eventDate < new Date();
  const isFull = event.max_participants && event.participants_count >= event.max_participants;
  const isCreator = event.creator_id === currentUserId;

  const formattedDate = format(eventDate, 'EEEE d MMMM', { locale: fr });
  const formattedTime = format(eventDate, 'HH:mm');

  const handlePress = () => {
    if (!compact) return; // Si pas compact, on est déjà sur la page détail
    router.push(`/event/${event.id}`);
  };

  const handleJoinPress = (e) => {
    e?.stopPropagation();
    if (isParticipant) {
      onLeave?.();
    } else {
      onJoin?.();
    }
  };

  return (
    <Pressable 
      style={[styles.container, compact && styles.compact]} 
      onPress={handlePress}
      disabled={!compact}
    >
      {/* Header avec créateur */}
      {!compact && (
        <View style={styles.header}>
          <Avatar profile={event.creator} size={36} />
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>
              {event.creator?.show_full_name && event.creator?.first_name
                ? `${event.creator.first_name} ${event.creator.last_name || ''}`
                : `@${event.creator?.username}`}
            </Text>
            <Text style={styles.creatorLabel}>Organizer</Text>
          </View>
        </View>
      )}

      {/* Titre et description */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Icon name="calendar" size={24} color={theme.colors.primary} />
          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        </View>

        {event.description && (
          <Text style={styles.description} numberOfLines={compact ? 2 : 0}>
            {event.description}
          </Text>
        )}

        {/* Date et heure */}
        <View style={styles.infoRow}>
          <Icon name="clock" size={18} color={theme.colors.textLight} />
          <Text style={styles.infoText}>
            {formattedDate} • {formattedTime}
          </Text>
        </View>

        {/* Participants */}
        <View style={styles.infoRow}>
          <Icon name="user" size={18} color={theme.colors.textLight} />
          <Text style={styles.infoText}>
            {event.participants_count} participant{event.participants_count > 1 ? 's' : ''}
            {event.max_participants && ` / ${event.max_participants}`}
          </Text>
        </View>
      </View>

      {/* Bouton Join/Leave */}
      {!isCreator && !isPastEvent && (
        <Pressable
          style={[
            styles.joinButton,
            isParticipant && styles.joinButtonActive,
            isFull && !isParticipant && styles.joinButtonDisabled
          ]}
          onPress={handleJoinPress}
          disabled={isFull && !isParticipant}
        >
          <Icon 
            name={isParticipant ? "heart" : "heart"} 
            size={18} 
            color="white"
            fill={isParticipant ? "white" : "transparent"}
          />
          <Text style={styles.joinButtonText}>
            {isFull && !isParticipant 
              ? 'Full' 
              : isParticipant 
                ? 'Participating' 
                : 'Join'}
          </Text>
        </Pressable>
      )}

      {isPastEvent && (
        <View style={styles.pastEventBadge}>
          <Text style={styles.pastEventText}>Past event</Text>
        </View>
      )}
    </Pressable>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '30',
    padding: 16,
    gap: 12,
  },
  compact: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '40',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  creatorLabel: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  content: {
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  description: {
    fontSize: hp(1.6),
    color: theme.colors.text,
    lineHeight: hp(2.2),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    textTransform: 'capitalize',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.lg,
    marginTop: 4,
  },
  joinButtonActive: {
    backgroundColor: theme.colors.rose,
  },
  joinButtonDisabled: {
    backgroundColor: theme.colors.gray,
  },
  joinButtonText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
  pastEventBadge: {
    backgroundColor: theme.colors.gray,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  pastEventText: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
});