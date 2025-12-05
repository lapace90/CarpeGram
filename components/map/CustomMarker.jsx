import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { Marker } from 'react-native-maps';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';

// ============================================
// CONFIGURATION DES COULEURS
// ============================================
export const MARKER_COLORS = {
  // Users
  closeFriend: '#9B59B6',    // Violet
  friend: '#27AE60',         // Vert
  anonymous: '#95A5A6',      // Gris
  
  // Stores
  partner: '#F1C40F',        // Doré
  partnerBorder: '#D4AC0D',  // Doré foncé
  store: '#3498DB',          // Bleu
  
  // Spots
  spotPublic: theme.colors.primary,  // Orange (primary)
  spotPrivate: '#F39C12',    // Jaune/Orange
  
  // Events
  event: '#E74C3C',          // Rouge
  
  // Misc
  newSpot: '#F1C40F',        // Jaune (marker temporaire)
};

// ============================================
// MARKER TYPES
// ============================================
export const MARKER_TYPES = {
  // Users
  USER_CLOSE_FRIEND: 'user_close_friend',
  USER_FRIEND: 'user_friend',
  USER_ANONYMOUS: 'user_anonymous',
  
  // Stores
  STORE_PARTNER: 'store_partner',
  STORE_STANDARD: 'store_standard',
  
  // Spots
  SPOT_PUBLIC: 'spot_public',
  SPOT_PRIVATE: 'spot_private',
  
  // Events
  EVENT: 'event',
  
  // Temp
  NEW_SPOT: 'new_spot',
};

// ============================================
// COMPOSANT PIN DE BASE
// ============================================
const MarkerPin = ({ color, borderColor, size = 40, children }) => (
  <View style={[styles.pinContainer, { width: size, height: size + 10 }]}>
    <View 
      style={[
        styles.pin, 
        { 
          backgroundColor: color,
          borderColor: borderColor || color,
          width: size,
          height: size,
        }
      ]}
    >
      {children}
    </View>
    <View style={[styles.pinTail, { borderTopColor: borderColor || color }]} />
  </View>
);

// ============================================
// MARKER USER (avec avatar)
// ============================================
const UserMarker = memo(({ user, type, onPress }) => {
  const getColorConfig = () => {
    switch (type) {
      case MARKER_TYPES.USER_CLOSE_FRIEND:
        return { bg: MARKER_COLORS.closeFriend, border: '#8E44AD', showHeart: true };
      case MARKER_TYPES.USER_FRIEND:
        return { bg: MARKER_COLORS.friend, border: '#1E8449', showHeart: false };
      case MARKER_TYPES.USER_ANONYMOUS:
      default:
        return { bg: MARKER_COLORS.anonymous, border: '#7F8C8D', showHeart: false };
    }
  };

  const config = getColorConfig();
  const hasAvatar = user?.profiles?.avatar_url && type !== MARKER_TYPES.USER_ANONYMOUS;

  return (
    <Marker
      coordinate={{
        latitude: parseFloat(user.latitude),
        longitude: parseFloat(user.longitude),
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.markerWrapper}>
        <MarkerPin color={config.bg} borderColor={config.border} size={44}>
          {hasAvatar ? (
            <Image
              source={{ uri: user.profiles.avatar_url }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <Icon name="user" size={22} color="white" strokeWidth={2} />
          )}
        </MarkerPin>
        
        {/* Badge cœur pour close friends */}
        {config.showHeart && (
          <View style={[styles.badge, { backgroundColor: '#E91E63' }]}>
            <Icon name="heart" size={10} color="white" strokeWidth={2.5} />
          </View>
        )}
      </View>
    </Marker>
  );
});

// ============================================
// MARKER STORE
// ============================================
const StoreMarker = memo(({ store, onPress }) => {
  const isPartner = store.is_partner || store.is_verified;
  
  const config = isPartner
    ? { bg: MARKER_COLORS.partner, border: MARKER_COLORS.partnerBorder }
    : { bg: MARKER_COLORS.store, border: '#2980B9' };

  return (
    <Marker
      coordinate={{
        latitude: parseFloat(store.latitude),
        longitude: parseFloat(store.longitude),
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.markerWrapper}>
        <MarkerPin color={config.bg} borderColor={config.border} size={40}>
          <Icon name="home" size={20} color="white" strokeWidth={2} />
        </MarkerPin>
        
        {/* Badge étoile pour partenaires */}
        {isPartner && (
          <View style={[styles.badge, styles.partnerBadge]}>
            <Text style={styles.starText}>⭐</Text>
          </View>
        )}
      </View>
    </Marker>
  );
});

// ============================================
// MARKER SPOT
// ============================================
const SpotMarker = memo(({ spot, onPress }) => {
  const isPrivate = spot.privacy !== 'public';
  
  const config = isPrivate
    ? { bg: MARKER_COLORS.spotPrivate, border: '#E67E22' }
    : { bg: MARKER_COLORS.spotPublic, border: theme.colors.primaryDark };

  return (
    <Marker
      coordinate={{
        latitude: parseFloat(spot.latitude),
        longitude: parseFloat(spot.longitude),
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.markerWrapper}>
        <MarkerPin color={config.bg} borderColor={config.border} size={40}>
          <Text style={styles.fishIcon}>🐟</Text>
        </MarkerPin>
        
        {/* Badge cadenas pour spots privés */}
        {isPrivate && (
          <View style={[styles.badge, { backgroundColor: '#34495E' }]}>
            <Icon name="lock" size={10} color="white" strokeWidth={2.5} />
          </View>
        )}
      </View>
    </Marker>
  );
});

// ============================================
// MARKER EVENT
// ============================================
const EventMarker = memo(({ event, onPress }) => {
  // Formater la date (ex: "12 Jan")
  const formatDate = () => {
    if (!event.event_date) return '';
    const date = new Date(event.event_date);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <Marker
      coordinate={{
        latitude: parseFloat(event.latitude),
        longitude: parseFloat(event.longitude),
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.markerWrapper}>
        <MarkerPin color={MARKER_COLORS.event} borderColor="#C0392B" size={44}>
          <Icon name="calendar" size={20} color="white" strokeWidth={2} />
        </MarkerPin>
        
        {/* Badge avec la date */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </View>
      </View>
    </Marker>
  );
});

// ============================================
// MARKER NOUVEAU SPOT (temporaire, jaune)
// ============================================
const NewSpotMarker = memo(({ coordinate }) => (
  <Marker
    coordinate={coordinate}
    anchor={{ x: 0.5, y: 1 }}
  >
    <MarkerPin color={MARKER_COLORS.newSpot} borderColor="#D4AC0D" size={40}>
      <Icon name="plus" size={20} color="white" strokeWidth={2.5} />
    </MarkerPin>
  </Marker>
));

// ============================================
// COMPOSANT PRINCIPAL CUSTOM MARKER
// ============================================
const CustomMarker = ({ 
  type, 
  data, 
  coordinate, 
  onPress 
}) => {
  switch (type) {
    case MARKER_TYPES.USER_CLOSE_FRIEND:
    case MARKER_TYPES.USER_FRIEND:
    case MARKER_TYPES.USER_ANONYMOUS:
      return <UserMarker user={data} type={type} onPress={() => onPress?.(data)} />;
      
    case MARKER_TYPES.STORE_PARTNER:
    case MARKER_TYPES.STORE_STANDARD:
      return <StoreMarker store={data} onPress={() => onPress?.(data)} />;
      
    case MARKER_TYPES.SPOT_PUBLIC:
    case MARKER_TYPES.SPOT_PRIVATE:
      return <SpotMarker spot={data} onPress={() => onPress?.(data)} />;
      
    case MARKER_TYPES.EVENT:
      return <EventMarker event={data} onPress={() => onPress?.(data)} />;
      
    case MARKER_TYPES.NEW_SPOT:
      return <NewSpotMarker coordinate={coordinate} />;
      
    default:
      return null;
  }
};

export default CustomMarker;

// Export des sous-composants pour usage direct si besoin
export { UserMarker, StoreMarker, SpotMarker, EventMarker, NewSpotMarker };

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  markerWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  pinContainer: {
    alignItems: 'center',
  },
  pin: {
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  fishIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  partnerBadge: {
    backgroundColor: 'white',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  starText: {
    fontSize: 12,
  },
  dateBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: MARKER_COLORS.event,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  dateText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});