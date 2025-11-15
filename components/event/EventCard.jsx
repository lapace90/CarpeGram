import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useState } from 'react'; 
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import Avatar from '../Avatar';
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
            onPress(); // Si onPress est fourni, l'utiliser
        } else if (compact) {
            router.push(`/event/${event.id}`); // Navigation par défaut vers le détail
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
                style={styles.container}
                onPress={handlePress}
                disabled={!onPress}
            >
                {/* Header avec icône event + menu pour créateur */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconContainer}>
                            <Icon name="calendar" size={20} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.eventLabel}>Event</Text>
                    </View>

                    {/* Menu 3 points si créateur - AJOUTE */}
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

                {/* Titre */}
                <Text style={styles.title} numberOfLines={2}>
                    {event.title}
                </Text>

                {/* Description */}
                {event.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {event.description}
                    </Text>
                )}

                {/* Date et heure */}
                <View style={styles.dateTimeRow}>
                    <Icon name="calendar" size={16} color={theme.colors.textLight} />
                    <Text style={styles.dateText}>
                        {formattedDate}
                    </Text>
                    <Icon name="clock" size={16} color={theme.colors.textLight} style={styles.clockIcon} />
                    <Text style={styles.timeText}>
                        {formattedTime}
                    </Text>
                </View>

                {/* Location */}
                {event.location && (
                    <View style={styles.locationRow}>
                        <Icon name="location" size={16} color={theme.colors.textLight} />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {event.location}
                        </Text>
                    </View>
                )}

                {/* Créateur */}
                <View style={styles.creatorRow}>
                    <Avatar profile={event.creator} size={24} />
                    <Text style={styles.creatorText}>
                        Organisé par {displayName}
                    </Text>
                </View>

                {/* Participants count */}
                <View style={styles.footer}>
                    <View style={styles.participantsInfo}>
                        <Icon name="user" size={16} color={theme.colors.textLight} />
                        <Text style={styles.participantsText}>
                            {event.participants_count || 0}
                            {event.max_participants ? ` / ${event.max_participants}` : ''} participant{event.participants_count !== 1 ? 's' : ''}
                        </Text>
                    </View>

                    {/* Bouton Join/Leave - seulement si pas créateur et pas event passé */}
                    {!isCreator && !isPastEvent && currentUserId && (
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
                                name={isParticipant ? "check" : "addUser"}
                                size={16}
                                color={isParticipant ? theme.colors.primary : "white"}
                            />
                            <Text style={[
                                styles.joinButtonText,
                                isParticipant && styles.joinButtonTextActive
                            ]}>
                                {isParticipant ? 'Inscrit' : isFull ? 'Complet' : 'Participer'}
                            </Text>
                        </Pressable>
                    )}

                    {/* Badge pour le créateur */}
                    {isCreator && (
                        <View style={styles.creatorBadge}>
                            <Text style={styles.creatorBadgeText}>Organisateur</Text>
                        </View>
                    )}

                    {/* Badge event passé */}
                    {isPastEvent && (
                        <View style={styles.pastBadge}>
                            <Text style={styles.pastBadgeText}>Terminé</Text>
                        </View>
                    )}
                </View>
            </Pressable>

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
                currentUserId={currentUserId}
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
        backgroundColor: theme.colors.aquaLight,
        borderRadius: theme.radius.md,
        padding: wp(4),
        borderWidth: 1,
        borderColor: theme.colors.primary + '20',
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
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventLabel: {
        fontSize: hp(1.6),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.primary,
        marginLeft: wp(2),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: hp(2),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
        marginBottom: hp(0.5),
    },
    description: {
        fontSize: hp(1.7),
        color: theme.colors.textLight,
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
        color: theme.colors.text,
        marginLeft: wp(1.5),
        fontWeight: theme.fonts.medium,
        textTransform: 'capitalize',
    },
    clockIcon: {
        marginLeft: wp(3),
    },
    timeText: {
        fontSize: hp(1.6),
        color: theme.colors.text,
        marginLeft: wp(1.5),
        fontWeight: theme.fonts.medium,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    locationText: {
        fontSize: hp(1.6),
        color: theme.colors.text,
        marginLeft: wp(1.5),
        flex: 1,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.5),
        paddingTop: hp(1),
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray + '30',
    },
    creatorText: {
        fontSize: hp(1.6),
        color: theme.colors.textLight,
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
        color: theme.colors.textLight,
        marginLeft: wp(1.5),
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: theme.radius.sm,
        gap: wp(1.5),
    },
    joinButtonActive: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    joinButtonDisabled: {
        backgroundColor: theme.colors.gray,
        opacity: 0.5,
    },
    joinButtonText: {
        fontSize: hp(1.6),
        fontWeight: theme.fonts.semibold,
        color: 'white',
    },
    joinButtonTextActive: {
        color: theme.colors.primary,
    },
    creatorBadge: {
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.6),
        borderRadius: theme.radius.sm,
    },
    creatorBadgeText: {
        fontSize: hp(1.5),
        fontWeight: theme.fonts.medium,
        color: theme.colors.primary,
    },
    pastBadge: {
        backgroundColor: theme.colors.gray + '30',
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.6),
        borderRadius: theme.radius.sm,
    },
    pastBadgeText: {
        fontSize: hp(1.5),
        fontWeight: theme.fonts.medium,
        color: theme.colors.textLight,
    },
});

export default EventCard;