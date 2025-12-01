import { useState, useEffect, useCallback } from 'react';
import { mapService } from '../services/mapService';
import * as Location from 'expo-location';

export function useMap() {
  const [spots, setSpots] = useState([]);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Demander la permission de géolocalisation
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission de localisation refusée');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setError(error.message);
      return false;
    }
  };

  // Obtenir la position actuelle
  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      setError(error.message);
      return null;
    }
  };

  // Charger les données de la map dans une zone
  const loadMapData = useCallback(async (bounds) => {
    setLoading(true);
    setError(null);

    try {
      const [spotsResult, storesResult, usersResult] = await Promise.all([
        mapService.getSpotsInArea(bounds),
        mapService.getStoresInArea(bounds),
        mapService.getUsersInArea(bounds),
      ]);

      if (spotsResult.error) throw spotsResult.error;
      if (storesResult.error) throw storesResult.error;
      if (usersResult.error) throw usersResult.error;

      setSpots(spotsResult.data || []);
      setStores(storesResult.data || []);
      setUsers(usersResult.data || []);
    } catch (err) {
      console.error('Error loading map data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un nouveau spot
  const createSpot = useCallback(async (spotData) => {
    try {
      const result = await mapService.createSpot(spotData);
      if (result.error) throw result.error;

      setSpots(prev => [...prev, result.data]);
      return result.data;
    } catch (err) {
      console.error('Error creating spot:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Mettre à jour sa position
  const updateUserLocation = useCallback(async (location) => {
    try {
      const result = await mapService.updateUserLocation(location);
      if (result.error) throw result.error;
      return result.data;
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Toggle partage de position
  const toggleLocationSharing = useCallback(async (enabled, shareWith = 'followers') => {
    try {
      const result = await mapService.toggleLocationSharing(enabled, shareWith);
      if (result.error) throw result.error;
      return result.data;
    } catch (err) {
      console.error('Error toggling location sharing:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Supprimer un spot
  const deleteSpot = useCallback(async (spotId) => {
    try {
      const result = await mapService.deleteSpot(spotId);
      if (result.error) throw result.error;
      
      setSpots(prev => prev.filter(spot => spot.id !== spotId));
      return true;
    } catch (err) {
      console.error('Error deleting spot:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Rafraîchir les données
  const refresh = useCallback(async (bounds) => {
    if (bounds) {
      await loadMapData(bounds);
    }
  }, [loadMapData]);

  return {
    spots,
    stores,
    users,
    userLocation,
    loading,
    error,
    getCurrentLocation,
    loadMapData,
    createSpot,
    updateUserLocation,
    toggleLocationSharing,
    deleteSpot,
    refresh,
    requestLocationPermission,
  };
}