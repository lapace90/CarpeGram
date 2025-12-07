import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { getFishingWeather } from '../../services/weatherService';

const WeatherWidget = () => {
  const { theme } = useTheme();
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

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      let latitude, longitude;
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;

        const [place] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (place) {
          setLocationName(place.city || place.subregion || place.region || '');
        }
      } else {
        latitude = 43.2965;
        longitude = 5.3698;
        setLocationName('Marseille');
      }

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
      <Pressable 
        style={[
          styles.container, 
          { 
            backgroundColor: theme.colors.card, 
            borderRadius: theme.radius.xl,
            borderColor: theme.colors.gray + '40',
          }
        ]} 
        onPress={handlePress}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textLight }]}>
            Loading weather...
          </Text>
        </View>
      </Pressable>
    );
  }

  if (error || !weatherData) {
    return (
      <Pressable 
        style={[
          styles.container, 
          { 
            backgroundColor: theme.colors.card, 
            borderRadius: theme.radius.xl,
            borderColor: theme.colors.gray + '40',
          }
        ]} 
        onPress={loadWeather}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🌡️</Text>
          <Text style={[styles.errorText, { color: theme.colors.textLight }]}>
            {error || 'Tap to retry'}
          </Text>
        </View>
      </Pressable>
    );
  }

  const { current, fishingActivity, moonPhase, bestTimes } = weatherData;

  return (
    <Pressable 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.card, 
          borderRadius: theme.radius.xl,
          borderColor: theme.colors.gray + '40',
        }
      ]} 
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={[styles.locationText, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
            {locationName || 'My Location'}
          </Text>
        </View>
        <Text style={[styles.tapHint, { color: theme.colors.textLight }]}>
          Tap for details →
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.weatherSection}>
          <Text style={styles.weatherIcon}>{current.icon}</Text>
          <View style={styles.tempContainer}>
            <Text style={[styles.temperature, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              {current.temperature}°
            </Text>
            <Text style={[styles.condition, { color: theme.colors.textLight }]}>
              {current.condition}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.gray }]} />

        <View style={styles.activitySection}>
          <Text style={styles.fishIcon}>🐟</Text>
          <View style={styles.activityInfo}>
            <View style={styles.activityRow}>
              <Text style={[styles.activityLabel, { color: theme.colors.textLight }]}>
                Activity
              </Text>
              <Text style={[styles.activityValue, { fontWeight: theme.fonts.bold, color: fishingActivity.color }]}>
                {fishingActivity.score}%
              </Text>
            </View>
            <View style={[styles.activityBar, { backgroundColor: theme.colors.gray + '40' }]}>
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
            <Text style={[styles.activityStatus, { fontWeight: theme.fonts.semibold, color: fishingActivity.color }]}>
              {fishingActivity.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.colors.gray + '40' }]}>
        <View style={styles.footerItem}>
          <Text style={styles.footerIcon}>💨</Text>
          <Text style={[styles.footerText, { color: theme.colors.textLight }]}>
            {current.windSpeed} km/h
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerIcon}>{moonPhase.emoji}</Text>
          <Text style={[styles.footerText, { color: theme.colors.textLight }]}>
            {moonPhase.phase.split(' ')[0]}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerIcon}>🌅</Text>
          <Text style={[styles.footerText, { color: theme.colors.textLight }]}>
            {bestTimes[0]?.start || '--'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default WeatherWidget;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp(0),
    marginTop: hp(1),
    padding: wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
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
  },
  tapHint: {
    fontSize: hp(1.3),
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
  },
  condition: {
    fontSize: hp(1.4),
  },
  divider: {
    width: 1,
    height: '100%',
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
  },
  activityValue: {
    fontSize: hp(1.6),
  },
  activityBar: {
    height: 6,
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
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: hp(1.5),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
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
  },
});