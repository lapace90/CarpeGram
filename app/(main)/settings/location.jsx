import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useRouter } from 'expo-router';
import Icon from '../../../assets/icons';
import BackButton from '../../../components/common/BackButton';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import * as Location from 'expo-location';

const LocationSettings = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Location settings
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [shareWith, setShareWith] = useState('followers');
  const [lastLocation, setLastLocation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const SHARE_OPTIONS = [
    {
      value: 'public',
      icon: 'unlock',
      label: 'Everyone',
      description: 'Anyone on Carpegram can see your location',
      color: theme.colors.primary,
    },
    {
      value: 'followers',
      icon: 'user',
      label: 'Followers',
      description: 'Only people who follow you',
      color: '#27AE60',
    },
    {
      value: 'close_friends',
      icon: 'heart',
      label: 'Close Friends',
      description: 'Only your close friends',
      color: '#9B59B6',
    },
    {
      value: 'nobody',
      icon: 'lock',
      label: 'Nobody',
      description: 'Your location is hidden but saved',
      color: '#95A5A6',
    },
  ];

  useEffect(() => {
    if (user) {
      loadLocationSettings();
    }
  }, [user]);

  const loadLocationSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is OK
        throw error;
      }

      if (data) {
        setSharingEnabled(data.sharing_enabled || false);
        setShareWith(data.share_with || 'followers');
        setLastLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setLastUpdated(data.updated_at);
      }
    } catch (error) {
      console.error('Load location settings error:', error);
      Alert.alert('Error', 'Failed to load location settings');
    } finally {
      setLoading(false);
    }
  };

  const updateLocationSetting = async (updates) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Update location setting error:', error);
      Alert.alert('Error', 'Failed to update setting');
      loadLocationSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleSharingToggle = async (value) => {
    setSharingEnabled(value);
    
    if (value && !lastLocation) {
      // Si on active le partage mais qu'on n'a pas de position, en demander une
      Alert.alert(
        'Update Location',
        'Do you want to share your current location?',
        [
          { 
            text: 'Not Now', 
            style: 'cancel',
            onPress: () => updateLocationSetting({ sharing_enabled: value })
          },
          { 
            text: 'Update Location', 
            onPress: () => handleUpdateLocation(value)
          },
        ]
      );
    } else {
      await updateLocationSetting({ sharing_enabled: value });
    }

    if (value) {
      Alert.alert(
        'Location Sharing Enabled',
        `Your location will be visible to ${getShareWithLabel(shareWith).toLowerCase()} on the map.`
      );
    }
  };

  const handleShareWithChange = async (value) => {
    setShareWith(value);
    await updateLocationSetting({ share_with: value });
  };

  const handleUpdateLocation = async (enableSharing = sharingEnabled) => {
    setUpdating(true);
    try {
      // Demander la permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow location access in your device settings to share your location.',
          [{ text: 'OK' }]
        );
        setUpdating(false);
        return;
      }

      // Obtenir la position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Sauvegarder
      await updateLocationSetting({
        ...newLocation,
        sharing_enabled: enableSharing,
        share_with: shareWith,
      });

      setLastLocation(newLocation);
      setLastUpdated(new Date().toISOString());

      Alert.alert('Success', 'Your location has been updated! 📍');
    } catch (error) {
      console.error('Update location error:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteLocation = () => {
    Alert.alert(
      'Delete Location Data',
      'This will remove your location from the map and delete your location history. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_locations')
                .delete()
                .eq('user_id', user.id);

              if (error) throw error;

              setSharingEnabled(false);
              setLastLocation(null);
              setLastUpdated(null);
              Alert.alert('Success', 'Your location data has been deleted');
            } catch (error) {
              console.error('Delete location error:', error);
              Alert.alert('Error', 'Failed to delete location data');
            }
          },
        },
      ]
    );
  };

  const getShareWithLabel = (value) => {
    const option = SHARE_OPTIONS.find(o => o.value === value);
    return option?.label || 'Followers';
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton router={router} />
            <Text style={styles.title}>Location</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.title}>Location</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Icon name="location" size={24} color={theme.colors.primary} />
            <Text style={styles.infoBannerText}>
              Share your location on the map so other anglers can find you during fishing sessions.
            </Text>
          </View>

          {/* Share Location Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Sharing</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingHeader}>
                  <Icon name="location" size={20} color={theme.colors.text} />
                  <Text style={styles.settingLabel}>Share My Location</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Allow others to see your position on the map
                </Text>
              </View>
              <Switch
                value={sharingEnabled}
                onValueChange={handleSharingToggle}
                trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
                thumbColor="white"
                disabled={saving}
              />
            </View>
          </View>

          {/* Who Can See */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who Can See My Location</Text>
            <Text style={styles.sectionSubtitle}>
              Choose who can see you on the map
            </Text>

            <View style={styles.optionsGroup}>
              {SHARE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.option,
                    shareWith === option.value && styles.optionSelected,
                    shareWith === option.value && { borderColor: option.color },
                  ]}
                  onPress={() => handleShareWithChange(option.value)}
                  disabled={saving}
                >
                  <View style={[styles.optionIconContainer, { backgroundColor: option.color + '20' }]}>
                    <Icon
                      name={option.icon}
                      size={20}
                      color={shareWith === option.value ? option.color : theme.colors.textLight}
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionLabel,
                        shareWith === option.value && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  {shareWith === option.value && (
                    <Icon name="check" size={20} color={option.color} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Current Location Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Location</Text>

            <View style={styles.locationStatus}>
              <View style={styles.locationInfo}>
                <Icon 
                  name="location" 
                  size={24} 
                  color={lastLocation ? theme.colors.primary : theme.colors.textLight} 
                />
                <View style={styles.locationDetails}>
                  {lastLocation ? (
                    <>
                      <Text style={styles.locationCoords}>
                        {lastLocation.latitude.toFixed(5)}, {lastLocation.longitude.toFixed(5)}
                      </Text>
                      <Text style={styles.locationTime}>
                        Last updated: {formatLastUpdated()}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.noLocation}>No location saved</Text>
                  )}
                </View>
              </View>

              <Pressable
                style={[styles.updateButton, updating && styles.updateButtonDisabled]}
                onPress={() => handleUpdateLocation()}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Icon name="location" size={18} color="white" />
                    <Text style={styles.updateButtonText}>
                      {lastLocation ? 'Update' : 'Get Location'}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Icon name="info" size={16} color={theme.colors.textLight} />
            <Text style={styles.privacyNoticeText}>
              Your location is only shared when you update it manually. 
              We don't track your location in the background.
            </Text>
          </View>

          {/* Delete Location Data */}
          {lastLocation && (
            <Pressable style={styles.deleteButton} onPress={handleDeleteLocation}>
              <Icon name="delete" size={20} color={theme.colors.rose} />
              <Text style={styles.deleteButtonText}>Delete My Location Data</Text>
            </Pressable>
          )}

          <View style={{ height: hp(4) }} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default LocationSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(2),
  },
  loadingText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
  scrollContent: {
    padding: wp(5),
    paddingBottom: hp(4),
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    padding: wp(4),
    borderRadius: theme.radius.lg,
    marginBottom: hp(3),
    gap: wp(3),
  },
  infoBannerText: {
    flex: 1,
    fontSize: hp(1.6),
    color: theme.colors.text,
    lineHeight: hp(2.2),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(1),
  },
  sectionSubtitle: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginBottom: hp(1.5),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    gap: 12,
  },
  settingContent: {
    flex: 1,
    gap: 6,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2),
  },
  optionsGroup: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    gap: 12,
  },
  optionSelected: {
    borderWidth: 2,
    backgroundColor: 'white',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  locationStatus: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationCoords: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  locationTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: 4,
  },
  noLocation: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.lg,
    gap: 8,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: 'white',
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semibold,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.backgroundLight,
    padding: wp(4),
    borderRadius: theme.radius.lg,
    marginBottom: hp(3),
    gap: wp(3),
  },
  privacyNoticeText: {
    flex: 1,
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    lineHeight: hp(2),
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    borderWidth: 1,
    borderColor: theme.colors.rose,
    borderRadius: theme.radius.lg,
    gap: 8,
  },
  deleteButtonText: {
    color: theme.colors.rose,
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semibold,
  },
});