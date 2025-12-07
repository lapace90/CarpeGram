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
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';

const LocationPicker = ({
  visible,
  onClose,
  onSelectLocation,
  initialLocation = null,
  title = 'Select Location',
}) => {
  const { theme } = useTheme();
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
        setRegion({
          latitude: 46.2044,
          longitude: 6.1432,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setRegion({
        latitude: 46.2044,
        longitude: 6.1432,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
    }

    setLoading(false);
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleCenterOnUser = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
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

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation({
        ...selectedLocation,
        name: locationName.trim(),
      });
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedLocation(initialLocation);
    setLocationName(initialLocation?.name || '');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
          <Pressable onPress={handleClose}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            {title}
          </Text>
          <Pressable onPress={handleConfirm} disabled={!selectedLocation}>
            <Text style={[
              styles.confirmText, 
              { fontWeight: theme.fonts.semibold, color: theme.colors.primary },
              !selectedLocation && { color: theme.colors.textLight }
            ]}>
              Done
            </Text>
          </Pressable>
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: theme.colors.backgroundLight }]}>
          <Icon name="info" size={16} color={theme.colors.textLight} />
          <Text style={[styles.instructionsText, { color: theme.colors.textLight }]}>
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

            <Pressable 
              style={[styles.centerButton, { borderRadius: theme.radius.xl }]} 
              onPress={handleCenterOnUser}
            >
              <Icon name="location" size={22} color={theme.colors.primary} />
            </Pressable>
          </View>
        )}

        {/* Location Name Input */}
        <View style={[styles.inputContainer, { borderTopColor: theme.colors.gray }]}>
          <Text style={[styles.inputLabel, { color: theme.colors.textLight }]}>
            Location Name (optional)
          </Text>
          <TextInput
            style={[styles.input, { borderColor: theme.colors.gray, borderRadius: theme.radius.xl, color: theme.colors.text }]}
            placeholder="e.g., Lake Geneva, near parking lot"
            value={locationName}
            onChangeText={setLocationName}
            placeholderTextColor={theme.colors.textLight}
            maxLength={200}
          />
          
          {selectedLocation && (
            <Text style={[styles.coordsText, { color: theme.colors.textLight }]}>
              📍 {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
            </Text>
          )}
        </View>

        {/* Confirm Button */}
        <Pressable
          style={[
            styles.confirmButton,
            { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl },
            !selectedLocation && { backgroundColor: theme.colors.gray }
          ]}
          onPress={handleConfirm}
          disabled={!selectedLocation}
        >
          <Icon name="location" size={22} color={theme.colors.card} />
          <Text style={[styles.confirmButtonText, { fontWeight: theme.fonts.semibold }]}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(2),
    paddingBottom: hp(1.5),
    borderBottomWidth: 1,
  },
  title: {
    fontSize: hp(2.2),
  },
  confirmText: {
    fontSize: hp(1.8),
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    paddingVertical: hp(1),
  },
  instructionsText: {
    fontSize: hp(1.5),
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    padding: wp(5),
    borderTopWidth: 1,
  },
  inputLabel: {
    fontSize: hp(1.6),
    marginBottom: hp(1),
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: hp(1.8),
  },
  coordsText: {
    fontSize: hp(1.4),
    marginTop: hp(1),
    textAlign: 'center',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(5),
    marginBottom: Platform.OS === 'ios' ? hp(4) : hp(2),
    paddingVertical: hp(1.8),
    gap: wp(2),
  },
  confirmButtonText: {
    color: 'white',
    fontSize: hp(1.8),
  },
});