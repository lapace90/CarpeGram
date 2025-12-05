import { View, StyleSheet, Text, Pressable, ActivityIndicator, Platform, StatusBar, Alert } from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { theme } from '../../constants/theme';
import { useMap } from '../../hooks/useMap';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import { useAuth } from '../../contexts/AuthContext';
import { mapService } from '../../services/mapService';
import { useRouter } from 'expo-router';

// Import des composants refactorisés
import MapSearchBar from '../../components/map/MapSearchBar';
import MapFilters from '../../components/map/MapFilters';
import CreateSpotModal from '../../components/map/CreateSpotModal';
import SpotDetailModal from '../../components/map/SpotDetailModal';
import StoreDetailModal from '../../components/map/StoreDetailModal';
import CustomMarker, { 
  MARKER_TYPES, 
  NewSpotMarker,
  SpotMarker,
  StoreMarker,
  UserMarker,
  EventMarker,
} from '../../components/map/CustomMarker';

const Map = () => {
  const mapRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();
  
  const {
    spots,
    stores,
    users,
    events,
    loading,
    getCurrentLocation,
    loadMapData,
    deleteSpot,
  } = useMap();

  // États de base
  const [region, setRegion] = useState(null);
  const [searchText, setSearchText] = useState('');
  
  // Filtres
  const [showSpots, setShowSpots] = useState(true);
  const [showStores, setShowStores] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpotCoords, setNewSpotCoords] = useState(null);
  const [creating, setCreating] = useState(false);

  // Détails
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showSpotDetail, setShowSpotDetail] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showStoreDetail, setShowStoreDetail] = useState(false);

  useEffect(() => {
    setupMap();
  }, []);

  const setupMap = async () => {
    const location = await getCurrentLocation();

    const initialRegion = {
      latitude: location?.latitude || 46.603354, // Centre de la France
      longitude: location?.longitude || 1.888334,
      latitudeDelta: location ? 0.0922 : 5,
      longitudeDelta: location ? 0.0421 : 5,
    };

    setRegion(initialRegion);
    loadDataForRegion(initialRegion);
  };

  const loadDataForRegion = useCallback((regionData) => {
    const bounds = {
      northEast: {
        latitude: regionData.latitude + regionData.latitudeDelta / 2,
        longitude: regionData.longitude + regionData.longitudeDelta / 2,
      },
      southWest: {
        latitude: regionData.latitude - regionData.latitudeDelta / 2,
        longitude: regionData.longitude - regionData.longitudeDelta / 2,
      },
    };
    loadMapData(bounds);
    // TODO: loadEventsInArea(bounds);
  }, [loadMapData]);

  const handleRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);
    loadDataForRegion(newRegion);
  };

  // Gestion du long press pour créer un spot
  const handleLongPress = (e) => {
    if (!user) {
      Alert.alert('Login required', 'Please login to add a spot');
      return;
    }
    setNewSpotCoords(e.nativeEvent.coordinate);
    setShowCreateModal(true);
  };

  // Création de spot
  const handleCreateSpot = async (spotData) => {
    setCreating(true);
    const result = await mapService.createSpot(spotData);
    setCreating(false);

    if (result.success) {
      Alert.alert('Success', 'Spot created successfully! 🎣');
      setNewSpotCoords(null);
      loadDataForRegion(region);
      return true;
    } else {
      Alert.alert('Error', result.error || 'Failed to create spot');
      return false;
    }
  };

  // Suppression de spot
  const handleDeleteSpot = async (spotId) => {
    const success = await deleteSpot(spotId);
    return success;
  };

  // Gestion des clics sur les markers
  const handleSpotPress = (spot) => {
    setSelectedSpot(spot);
    setShowSpotDetail(true);
  };

  const handleStorePress = (store) => {
    setSelectedStore(store);
    setShowStoreDetail(true);
  };

  const handleUserPress = (userItem) => {
    if (userItem.user_id) {
      router.push(`/userProfile/${userItem.user_id}`);
    }
  };

  // Navigation vers le détail d'un event
  const handleEventPress = (event) => {
    if (event.id) {
      router.push(`/event/${event.id}`);
    }
  };

  // Centrer sur la position de l'utilisateur
  const handleCenterOnUser = async () => {
    const location = await getCurrentLocation();
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

  // Filtrer les éléments selon la recherche
  const filteredSpots = showSpots 
    ? spots.filter(s => s.name?.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  const filteredStores = showStores 
    ? stores.filter(s => s.name?.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  const filteredUsers = showUsers ? users : [];
  const filteredEvents = showEvents ? events : [];

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map</Text>
        <View style={styles.headerButtons}>
          <Pressable onPress={handleCenterOnUser} style={styles.headerButton}>
            <Icon name="location" size={24} color={theme.colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('Help', 'Long press on the map to add a fishing spot')}
            style={styles.headerButton}
          >
            <Icon name="info" size={24} color={theme.colors.textLight} />
          </Pressable>
        </View>
      </View>

      {/* Barre de recherche */}
      <MapSearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search spots or stores..."
      />

      {/* Filtres */}
      <MapFilters
        showSpots={showSpots}
        showStores={showStores}
        showUsers={showUsers}
        showEvents={showEvents}
        spotsCount={spots.length}
        storesCount={stores.length}
        usersCount={users.length}
        eventsCount={events.length}
        onToggleSpots={() => setShowSpots(!showSpots)}
        onToggleStores={() => setShowStores(!showStores)}
        onToggleUsers={() => setShowUsers(!showUsers)}
        onToggleEvents={() => setShowEvents(!showEvents)}
      />

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={handleRegionChangeComplete}
        onLongPress={handleLongPress}
      >
        {/* Marker temporaire pour le nouveau spot */}
        {newSpotCoords && (
          <NewSpotMarker coordinate={newSpotCoords} />
        )}

        {/* Spots - avec CustomMarker */}
        {filteredSpots.map((spot) => (
          <SpotMarker
            key={`spot-${spot.id}`}
            spot={spot}
            onPress={() => handleSpotPress(spot)}
          />
        ))}

        {/* Stores - avec CustomMarker (détecte automatiquement partenaire) */}
        {filteredStores.map((store) => (
          <StoreMarker
            key={`store-${store.id}`}
            store={store}
            onPress={() => handleStorePress(store)}
          />
        ))}

        {/* Users/Anglers - avec CustomMarker et couleurs selon relation */}
        {filteredUsers.map((userItem) => {
          // Déterminer le type de marker selon la relation
          let markerType = MARKER_TYPES.USER_ANONYMOUS;
          if (userItem.isCloseFriend) {
            markerType = MARKER_TYPES.USER_CLOSE_FRIEND;
          } else if (userItem.isFollowing) {
            markerType = MARKER_TYPES.USER_FRIEND;
          }
          
          return (
            <UserMarker
              key={`user-${userItem.user_id}`}
              user={userItem}
              type={markerType}
              onPress={() => handleUserPress(userItem)}
            />
          );
        })}

        {/* Events - avec CustomMarker et date */}
        {filteredEvents.map((event) => (
          <EventMarker
            key={`event-${event.id}`}
            event={event}
            onPress={() => handleEventPress(event)}
          />
        ))}
      </MapView>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      {/* Modal création de spot */}
      <CreateSpotModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewSpotCoords(null);
        }}
        coordinates={newSpotCoords}
        onCreateSpot={handleCreateSpot}
        loading={creating}
      />

      {/* Modal détail spot */}
      <SpotDetailModal
        visible={showSpotDetail}
        onClose={() => {
          setShowSpotDetail(false);
          setSelectedSpot(null);
        }}
        spot={selectedSpot}
        currentUserId={user?.id}
        onDelete={handleDeleteSpot}
      />

      {/* Modal détail store */}
      <StoreDetailModal
        visible={showStoreDetail}
        onClose={() => {
          setShowStoreDetail(false);
          setSelectedStore(null);
        }}
        store={selectedStore}
      />
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: hp(1.5),
    paddingHorizontal: wp(5),
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.gray,
  },
  headerTitle: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: hp(20),
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: wp(3),
    borderRadius: theme.radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});