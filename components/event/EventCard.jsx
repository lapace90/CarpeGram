import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useState } from 'react'; 
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import Avatar from '../common/Avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventMenu from './EventMenu';
import EditEventModal from './EditEventModal';

const EventCard = ({
    event,
    onJoin,
    onLeave,
    isParticipant = false,
    currentUserId,
    compact = true,
    onPress,
    onUpdate,
}) => {
    const { theme } = useTheme();
    const router = useRouter(); 
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    if (!event) return null;

    const eventDate = new Date(event.event_date);
    const isPastEvent = eventDate < new Date();
    const isFull = event.max_participants && event.participants_count >= event.max_participants;
    const isCreator = event.creator_id === currentUserId;

    const formattedDate = format(eventDate, 'EEEE d MMMM', { locale: fr });
    const formattedTime = format(eventDate, 'HH:mm');

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else if (compact) {
            router.push(`/event/${event.id}`);
        }
    };

    const handleJoinPress = (e) => {
        e?.stopPropagation();
        if (isParticipant) {
            onLeave?.();
        } else {
            onJoin?.();
        }
    };

    const displayName = event.creator?.show_full_name && event.creator?.first_name
        ? `${event.creator.first_name} ${event.creator.last_name || ''}`
        : `@${event.creator?.username || 'unknown'}`;

    const handleMenuAction = (action) => {
        if (action === 'edit') {
            setShowEditModal(true);
        } else if (action === 'delete') {
            onUpdate?.();
        }
    };

    return (
        <>
            <Pressable
                style={[
                    styles.container, 
                    { 
                        backgroundColor: theme.colors.aquaLight,
                        borderRadius: theme.radius.md,
                        borderColor: theme.colors.primary + '20',
                    }
                ]}
                onPress={handlePress}
                disabled={!onPress}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.iconContainer, { borderRadius: theme.radius.sm, backgroundColor: theme.colors.primary + '15' }]}>
                            <Icon name="calendar" size={20} color={theme.colors.primary} />
                        </View>
                        <Text style={[styles.eventLabel, { fontWeight: theme.fonts.semibold, color: theme.colors.primary }]}>
                            Event
                        </Text>
                    </View>

                    {isCreator && !isPastEvent && (
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                setShowMenu(true);
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icon name="threeDotsHorizontal" size={20} color={theme.colors.text} />
                        </Pressable>
                    )}
                </View>

                {/* Title */}
                <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]} numberOfLines={2}>
                    {event.title}
                </Text>

                {/* Description */}
                {event.description && (
                    <Text style={[styles.description, { color: theme.colors.textLight }]} numberOfLines={2}>
                        {event.description}
                    </Text>
                )}

                {/* Date & Time */}
                <View style={styles.dateTimeRow}>
                    <Icon name="calendar" size={16} color={theme.colors.textLight} />
                    <Text style={[styles.dateText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                        {formattedDate}
                    </Text>
                    <Icon name="clock" size={16} color={theme.colors.textLight} style={styles.clockIcon} />
                    <Text style={[styles.timeText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                        {formattedTime}
                    </Text>
                </View>

                {/* Location */}
                {event.location && (
                    <View style={styles.locationRow}>
                        <Icon name="location" size={16} color={theme.colors.textLight} />
                        <Text style={[styles.locationText, { color: theme.colors.text }]} numberOfLines={1}>
                            {event.location}
                        </Text>
                    </View>
                )}

                {/* Creator */}
                <View style={[styles.creatorRow, { borderTopColor: theme.colors.gray + '30' }]}>
                    <Avatar profile={event.creator} size={24} />
                    <Text style={[styles.creatorText, { color: theme.colors.textLight }]}>
                        Organisé par {displayName}
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.participantsInfo}>
                        <Icon name="user" size={16} color={theme.colors.textLight} />
                        <Text style={[styles.participantsText, { color: theme.colors.textLight }]}>
                            {event.participants_count || 0}
                            {event.max_participants ? ` / ${event.max_participants}` : ''} participant{event.participants_count !== 1 ? 's' : ''}
                        </Text>
                    </View>

                    {!isCreator && !isPastEvent && currentUserId && (
                        <Pressable
                            style={[
                                styles.joinButton,
                                { backgroundColor: theme.colors.primary, borderRadius: theme.radius.sm },
                                isParticipant && { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.primary },
                                isFull && !isParticipant && { backgroundColor: theme.colors.gray, opacity: 0.5 }
                            ]}
                            onPress={handleJoinPress}
                            disabled={isFull && !isParticipant}
                        >
                            <Icon
                                name={isParticipant ? "check" : "addUser"}
                                size={16}
                                color={isParticipant ? theme.colors.primary : theme.colors.card}
                            />
                            <Text style={[
                                styles.joinButtonText,
                                { fontWeight: theme.fonts.semibold, color: theme.colors.card },
                                isParticipant && { color: theme.colors.primary }
                            ]}>
                                {isParticipant ? 'Inscrit' : isFull ? 'Complet' : 'Rejoindre'}
                            </Text>
                        </Pressable>
                    )}

                    {isCreator && (
                        <View style={[styles.creatorBadge, { backgroundColor: theme.colors.primary + '15', borderRadius: theme.radius.sm }]}>
                            <Text style={[styles.creatorBadgeText, { fontWeight: theme.fonts.medium, color: theme.colors.primary }]}>
                                Organisateur
                            </Text>
                        </View>
                    )}

                    {isPastEvent && (
                        <View style={[styles.pastBadge, { backgroundColor: theme.colors.gray + '30', borderRadius: theme.radius.sm }]}>
                            <Text style={[styles.pastBadgeText, { fontWeight: theme.fonts.medium, color: theme.colors.textLight }]}>
                                Terminé
                            </Text>
                        </View>
                    )}
                </View>
            </Pressable>

            {/* Menu */}
            <EventMenu
                visible={showMenu}
                onClose={() => setShowMenu(false)}
                eventId={event.id}
                onAction={handleMenuAction}
            />

            {/* Edit Modal */}
            <EditEventModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                event={event}
                onUpdate={() => {
                    onUpdate?.();
                    setShowEditModal(false);
                }}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: wp(4),
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', 
        marginBottom: hp(1),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventLabel: {
        fontSize: hp(1.6),
        marginLeft: wp(2),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: hp(2),
        marginBottom: hp(0.5),
    },
    description: {
        fontSize: hp(1.7),
        marginBottom: hp(1),
        lineHeight: hp(2.3),
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    dateText: {
        fontSize: hp(1.6),
        marginLeft: wp(1.5),
        textTransform: 'capitalize',
    },
    clockIcon: {
        marginLeft: wp(3),
    },
    timeText: {
        fontSize: hp(1.6),
        marginLeft: wp(1.5),
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    locationText: {
        fontSize: hp(1.6),
        marginLeft: wp(1.5),
        flex: 1,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.5),
        paddingTop: hp(1),
        borderTopWidth: 1,
    },
    creatorText: {
        fontSize: hp(1.6),
        marginLeft: wp(2),
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    participantsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    participantsText: {
        fontSize: hp(1.6),
        marginLeft: wp(1.5),
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        gap: wp(1.5),
    },
    joinButtonText: {
        fontSize: hp(1.6),
    },
    creatorBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.6),
    },
    creatorBadgeText: {
        fontSize: hp(1.5),
    },
    pastBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.6),
    },
    pastBadgeText: {
        fontSize: hp(1.5),
    },
});

export default EventCard;