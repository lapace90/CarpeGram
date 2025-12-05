import { useState, useCallback } from 'react';
import { mapService } from '../services/mapService';
import * as Location from 'expo-location';

export function useMap() {
  const [spots, setSpots] = useState([]);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Demander la permission de géolocalisation
   */
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError(err.message);
      return false;
    }
  };

  /**
   * Obtenir la position actuelle
   */
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
    } catch (err) {
      console.error('Error getting current location:', err);
      setError(err.message);
      return null;
    }
  };

  /**
   * Charger toutes les données de la map dans une zone
   */
  const loadMapData = useCallback(async (bounds) => {
    setLoading(true);
    setError(null);

    try {
      const [spotsResult, storesResult, usersResult, eventsResult] = await Promise.all([
        mapService.getSpotsInArea(bounds),
        mapService.getStoresInArea(bounds),
        mapService.getUsersInArea(bounds),
        mapService.getEventsInArea(bounds),
      ]);

      if (spotsResult.error) console.warn('Spots error:', spotsResult.error);
      if (storesResult.error) console.warn('Stores error:', storesResult.error);
      if (usersResult.error) console.warn('Users error:', usersResult.error);
      if (eventsResult.error) console.warn('Events error:', eventsResult.error);

      setSpots(spotsResult.data || []);
      setStores(storesResult.data || []);
      setUsers(usersResult.data || []);
      setEvents(eventsResult.data || []);
    } catch (err) {
      console.error('Error loading map data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Créer un nouveau spot
   */
  const createSpot = useCallback(async (spotData) => {
    try {
      const result = await mapService.createSpot(spotData);
      if (result.error) throw new Error(result.error);

      setSpots(prev => [...prev, result.data]);
      return result.data;
    } catch (err) {
      console.error('Error creating spot:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Supprimer un spot
   */
  const deleteSpot = useCallback(async (spotId) => {
    try {
      const result = await mapService.deleteSpot(spotId);
      if (!result.success) throw new Error(result.error);
      
      setSpots(prev => prev.filter(spot => spot.id !== spotId));
      return true;
    } catch (err) {
      console.error('Error deleting spot:', err);
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Mettre à jour un spot
   */
  const updateSpot = useCallback(async (spotId, updates) => {
    try {
      const result = await mapService.updateSpot(spotId, updates);
      if (!result.success) throw new Error(result.error);
      
      setSpots(prev => prev.map(spot => 
        spot.id === spotId ? { ...spot, ...result.data } : spot
      ));
      return result.data;
    } catch (err) {
      console.error('Error updating spot:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Mettre à jour sa position
   */
  const updateUserLocation = useCallback(async (location) => {
    try {
      const result = await mapService.updateUserLocation(location);
      if (!result.success) throw new Error(result.error);
      return result.data;
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Toggle partage de position
   */
  const toggleLocationSharing = useCallback(async (enabled, shareWith = 'followers') => {
    try {
      const result = await mapService.toggleLocationSharing(enabled, shareWith);
      if (!result.success) throw new Error(result.error);
      return result.data;
    } catch (err) {
      console.error('Error toggling location sharing:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Rafraîchir les données
   */
  const refresh = useCallback(async (bounds) => {
    if (bounds) {
      await loadMapData(bounds);
    }
  }, [loadMapData]);

  /**
   * Effacer les erreurs
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    spots,
    stores,
    users,
    events,
    userLocation,
    
    // State
    loading,
    error,
    
    // Actions
    getCurrentLocation,
    loadMapData,
    createSpot,
    deleteSpot,
    updateSpot,
    updateUserLocation,
    toggleLocationSharing,
    refresh,
    requestLocationPermission,
    clearError,
  };
}