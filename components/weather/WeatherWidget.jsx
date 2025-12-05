import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { getFishingWeather } from '../../services/weatherService';

const WeatherWidget = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      let latitude, longitude;
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;

        // Get location name
        const [place] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (place) {
          setLocationName(place.city || place.subregion || place.region || '');
        }
      } else {
        // Default to Marseille
        latitude = 43.2965;
        longitude = 5.3698;
        setLocationName('Marseille');
      }

      // Fetch weather data
      const result = await getFishingWeather(latitude, longitude);
      
      if (result.success) {
        setWeatherData(result.data);
      } else {
        setError('Unable to load weather');
      }
    } catch (err) {
      console.error('Weather widget error:', err);
      setError('Weather unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    router.push('/weather');
  };

  if (loading) {
    return (
      <Pressable style={styles.container} onPress={handlePress}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </Pressable>
    );
  }

  if (error || !weatherData) {
    return (
      <Pressable style={styles.container} onPress={loadWeather}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🌡️</Text>
          <Text style={styles.errorText}>{error || 'Tap to retry'}</Text>
        </View>
      </Pressable>
    );
  }

  const { current, fishingActivity, moonPhase, bestTimes } = weatherData;

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{locationName || 'My Location'}</Text>
        </View>
        <Text style={styles.tapHint}>Tap for details →</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Weather info */}
        <View style={styles.weatherSection}>
          <Text style={styles.weatherIcon}>{current.icon}</Text>
          <View style={styles.tempContainer}>
            <Text style={styles.temperature}>{current.temperature}°</Text>
            <Text style={styles.condition}>{current.condition}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Fishing activity */}
        <View style={styles.activitySection}>
          <Text style={styles.fishIcon}>🐟</Text>
          <View style={styles.activityInfo}>
            <View style={styles.activityRow}>
              <Text style={styles.activityLabel}>Activity</Text>
              <Text style={[styles.activityValue, { color: fishingActivity.color }]}>
                {fishingActivity.score}%
              </Text>
            </View>
            <View style={styles.activityBar}>
              <View 
                style={[
                  styles.activityFill, 
                  { 
                    width: `${fishingActivity.score}%`,
                    backgroundColor: fishingActivity.color,
                  }
                ]} 
              />
            </View>
            <Text style={[styles.activityStatus, { color: fishingActivity.color }]}>
              {fishingActivity.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer with extra info */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerIcon}>💨</Text>
          <Text style={styles.footerText}>{current.windSpeed} km/h</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerIcon}>{moonPhase.emoji}</Text>
          <Text style={styles.footerText}>{moonPhase.phase.split(' ')[0]}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerIcon}>🌅</Text>
          <Text style={styles.footerText}>{bestTimes[0]?.start || '--'}</Text>
        </View>
      </View>

    </Pressable>
  );
};

export default WeatherWidget;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: theme.radius.xl,
    marginHorizontal: wp(0),
    marginTop: hp(1),
    padding: wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.gray + '40',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
    gap: 10,
  },
  loadingText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
    gap: 10,
  },
  errorIcon: {
    fontSize: hp(2.5),
  },
  errorText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: hp(1.6),
  },
  locationText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  tapHint: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherIcon: {
    fontSize: hp(4),
  },
  tempContainer: {
    gap: 2,
  },
  temperature: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  condition: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.gray,
    marginHorizontal: wp(4),
  },
  activitySection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fishIcon: {
    fontSize: hp(2.5),
  },
  activityInfo: {
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLabel: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  activityValue: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
  },
  activityBar: {
    height: 6,
    backgroundColor: theme.colors.gray + '40',
    borderRadius: 3,
    marginVertical: 4,
    overflow: 'hidden',
  },
  activityFill: {
    height: '100%',
    borderRadius: 3,
  },
  activityStatus: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: hp(1.5),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray + '40',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerIcon: {
    fontSize: hp(1.6),
  },
  footerText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  estimationNote: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: hp(1),
    fontStyle: 'italic',
  },
});