import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';

const LocationPicker = ({
  visible,
  onClose,
  onSelectLocation,
  initialLocation = null,
  title = 'Select Location',
}) => {
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    if (visible) {
      initializeMap();
    }
  }, [visible]);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setLocationName(initialLocation.name || '');
    }
  }, [initialLocation]);

  const initializeMap = async () => {
    setLoading(true);

    try {
      // Si on a une location initiale, utiliser celle-là
      if (initialLocation?.latitude && initialLocation?.longitude) {
        setRegion({
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        setLoading(false);
        return;
      }

      // Sinon demander la permission et récupérer la position actuelle
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      } else {
        // Position par défaut (France)
        setRegion({
          latitude: 46.603354,
          longitude: 1.888334,
          latitudeDelta: 5,
          longitudeDelta: 5,
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      // Position par défaut
      setRegion({
        latitude: 46.603354,
        longitude: 1.888334,
        latitudeDelta: 5,
        longitudeDelta: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (e) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleConfirm = () => {
    if (!selectedLocation) return;

    onSelectLocation({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      name: locationName.trim() || null,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setSelectedLocation(null);
    setLocationName('');
    onClose();
  };

  const handleCenterOnUser = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      mapRef.current?.animateToRegion(newRegion, 500);
    } catch (error) {
      console.error('Error centering on user:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={10}>
            <Icon name="delete" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Pressable 
            onPress={handleConfirm} 
            disabled={!selectedLocation}
            hitSlop={10}
          >
            <Text style={[
              styles.confirmText,
              !selectedLocation && styles.confirmTextDisabled
            ]}>
              Confirm
            </Text>
          </Pressable>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Icon name="info" size={16} color={theme.colors.textLight} />
          <Text style={styles.instructionsText}>
            Tap on the map to select a location
          </Text>
        </View>

        {/* Map */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
              initialRegion={region}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  pinColor={theme.colors.primary}
                />
              )}
            </MapView>

            {/* Center Button */}
            <Pressable style={styles.centerButton} onPress={handleCenterOnUser}>
              <Icon name="location" size={22} color={theme.colors.primary} />
            </Pressable>
          </View>
        )}

        {/* Location Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location Name (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Lake Geneva, near parking lot"
            value={locationName}
            onChangeText={setLocationName}
            placeholderTextColor={theme.colors.textLight}
            maxLength={200}
          />
          
          {selectedLocation && (
            <Text style={styles.coordsText}>
              📍 {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
            </Text>
          )}
        </View>

        {/* Confirm Button (bottom) */}
        <Pressable
          style={[
            styles.confirmButton,
            !selectedLocation && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={!selectedLocation}
        >
          <Icon name="location" size={22} color="white" />
          <Text style={styles.confirmButtonText}>
            {selectedLocation ? 'Confirm Location' : 'Select a location on the map'}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
};

export default LocationPicker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(2),
    paddingBottom: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  confirmText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  confirmTextDisabled: {
    color: theme.colors.textLight,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    paddingVertical: hp(1),
    backgroundColor: theme.colors.backgroundLight,
  },
  instructionsText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    right: wp(4),
    bottom: hp(2),
    backgroundColor: 'white',
    padding: wp(3),
    borderRadius: theme.radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray,
  },
  inputLabel: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginBottom: hp(1),
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.xl,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  coordsText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(1),
    textAlign: 'center',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginHorizontal: wp(5),
    marginBottom: Platform.OS === 'ios' ? hp(4) : hp(2),
    paddingVertical: hp(1.8),
    borderRadius: theme.radius.xl,
    gap: wp(2),
  },
  confirmButtonDisabled: {
    backgroundColor: theme.colors.gray,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
  },
});