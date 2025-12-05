import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { useRouter } from 'expo-router';
import Icon from '../../assets/icons';
import BackButton from '../../components/BackButton';
import BubblesLoader from '../../components/animations/BubblesLoader';
import * as Location from 'expo-location';
import { getFishingWeather, getMoonPhasesForWeek } from '../../services/weatherService';
import ActivityExplainerModal from '../../components/weather/ActivityExplainerModal';

const Weather = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);

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
          setLocationName(place.city || place.subregion || place.region || 'Unknown');
        }
      } else {
        // Default to Marseille
        latitude = 43.2965;
        longitude = 5.3698;
        setLocationName('Marseille');
      }

      setCoordinates({ latitude, longitude });

      // Fetch weather data
      const result = await getFishingWeather(latitude, longitude);
      
      if (result.success) {
        setWeatherData(result.data);
      } else {
        setError('Unable to load weather data');
      }
    } catch (err) {
      console.error('Weather error:', err);
      setError('Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeather();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton router={router} />
            <Text style={styles.title}>Fishing Weather</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.loadingContainer}>
            <BubblesLoader size={80} color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading weather data...</Text>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton router={router} />
            <Text style={styles.title}>Fishing Weather</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadWeather}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  const { current, today, fishingActivity, moonPhase, bestTimes, forecast, hourly, marine, isCoastal, waterTemperature } = weatherData;

  return (
    <ScreenWrapper bg={theme.colors.gray + '10'}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.title}>Fishing Weather</Text>
          <Pressable onPress={onRefresh} style={styles.refreshButton}>
            <Icon name="repeat" size={22} color={theme.colors.primary} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Location & Current Weather */}
          <View style={styles.currentCard}>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{locationName}</Text>
            </View>

            <View style={styles.currentMain}>
              <Text style={styles.currentIcon}>{current.icon}</Text>
              <View style={styles.currentTemp}>
                <Text style={styles.temperature}>{current.temperature}°C</Text>
                <Text style={styles.feelsLike}>Feels like {current.feelsLike}°</Text>
              </View>
            </View>

            <Text style={styles.condition}>{current.condition}</Text>

            <View style={styles.currentDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💨</Text>
                <Text style={styles.detailLabel}>Wind</Text>
                <Text style={styles.detailValue}>{current.windSpeed} km/h {current.windDirection}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💧</Text>
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>{current.humidity}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🌡️</Text>
                <Text style={styles.detailLabel}>Pressure</Text>
                <Text style={styles.detailValue}>{current.pressure} hPa</Text>
              </View>
            </View>
          </View>

          {/* Water Temperature Card */}
          {waterTemperature && (
            <View style={styles.waterTempCard}>
              <View style={styles.waterTempMain}>
                <Text style={styles.waterTempIcon}>🌊</Text>
                <View style={styles.waterTempContent}>
                  <Text style={styles.waterTempLabel}>Water Temperature</Text>
                  <View style={styles.waterTempRow}>
                    <Text style={styles.waterTempValue}>{waterTemperature.temperature}°C</Text>
                    {waterTemperature.type === 'sea' ? (
                      <View style={styles.waterTempBadge}>
                        <Text style={styles.waterTempBadgeText}>Sea Surface</Text>
                      </View>
                    ) : (
                      <View style={[styles.waterTempBadge, styles.waterTempBadgeEstimated]}>
                        <Text style={[styles.waterTempBadgeText, styles.waterTempBadgeTextEstimated]}>
                          Estimated
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.waterTempNote}>
                    {waterTemperature.type === 'sea' 
                      ? 'Real-time satellite data' 
                      : `Based on air temp & ${waterTemperature.season} season`
                    }
                  </Text>
                </View>
              </View>
              
              {/* Optimal range indicator */}
              <View style={styles.waterTempRange}>
                <View style={styles.waterTempRangeBar}>
                  <View style={styles.waterTempRangeOptimal} />
                  <View 
                    style={[
                      styles.waterTempMarker,
                      { left: `${Math.max(0, Math.min(100, ((waterTemperature.temperature - 5) / 30) * 100))}%` }
                    ]} 
                  />
                </View>
                <View style={styles.waterTempRangeLabels}>
                  <Text style={styles.waterTempRangeText}>5°C</Text>
                  <Text style={styles.waterTempRangeTextOptimal}>15-25°C optimal</Text>
                  <Text style={styles.waterTempRangeText}>35°C</Text>
                </View>
              </View>
            </View>
          )}

          {/* Fishing Activity Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>🐟 Fishing Activity</Text>
              <Pressable 
                style={styles.infoButton} 
                onPress={() => setShowExplainer(true)}
              >
                <Icon name="info" size={18} color={theme.colors.primary} />
              </Pressable>
            </View>
            
            <View style={styles.activityMain}>
              <View style={styles.activityGauge}>
                <Text style={[styles.activityScore, { color: fishingActivity.color }]}>
                  {fishingActivity.score}%
                </Text>
                <View style={styles.activityBarLarge}>
                  <View 
                    style={[
                      styles.activityFillLarge, 
                      { 
                        width: `${fishingActivity.score}%`,
                        backgroundColor: fishingActivity.color,
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.activityLabel, { color: fishingActivity.color }]}>
                  {fishingActivity.label}
                </Text>
              </View>
            </View>

            {/* Factors Breakdown */}
            {fishingActivity.factors && (
              <View style={styles.factorsBreakdown}>
                <Text style={styles.factorsTitle}>Contributing Factors</Text>
                <View style={styles.factorsGrid}>
                  {Object.entries(fishingActivity.factors).map(([key, factor]) => (
                    <View key={key} style={styles.factorMini}>
                      <Text style={styles.factorMiniIcon}>
                        {fishingActivity.weights[key]?.icon || '📊'}
                      </Text>
                      <View style={styles.factorMiniBar}>
                        <View 
                          style={[
                            styles.factorMiniFill,
                            { 
                              width: `${factor.score}%`,
                              backgroundColor: factor.status.color,
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.factorMiniScore, { color: factor.status.color }]}>
                        {factor.score}
                      </Text>
                    </View>
                  ))}
                </View>
                <Pressable 
                  style={styles.learnMoreButton}
                  onPress={() => setShowExplainer(true)}
                >
                  <Text style={styles.learnMoreText}>How is this calculated?</Text>
                  <Icon name="arrowRight" size={14} color={theme.colors.primary} />
                </Pressable>
              </View>
            )}

            {/* Best Times */}
            <View style={styles.bestTimesSection}>
              <Text style={styles.subTitle}>Best Times Today</Text>
              <View style={styles.bestTimesList}>
                {bestTimes.map((time, index) => (
                  <View key={index} style={styles.bestTimeItem}>
                    <Text style={styles.bestTimeIcon}>{time.icon}</Text>
                    <View style={styles.bestTimeInfo}>
                      <Text style={styles.bestTimeLabel}>{time.label}</Text>
                      <Text style={styles.bestTimeValue}>{time.start} - {time.end}</Text>
                    </View>
                    <View style={[
                      styles.qualityBadge,
                      { backgroundColor: time.quality === 'excellent' ? '#27AE60' : '#F39C12' }
                    ]}>
                      <Text style={styles.qualityText}>
                        {time.quality === 'excellent' ? '★★★' : '★★'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Moon Phase Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌙 Moon Phase</Text>
            
            <View style={styles.moonMain}>
              <Text style={styles.moonEmoji}>{moonPhase.emoji}</Text>
              <View style={styles.moonInfo}>
                <Text style={styles.moonPhase}>{moonPhase.phase}</Text>
                <Text style={styles.moonIllumination}>{moonPhase.illumination}% illuminated</Text>
                <View style={styles.moonImpact}>
                  <Text style={styles.moonImpactLabel}>Fishing Impact:</Text>
                  <Text style={[
                    styles.moonImpactValue,
                    { color: moonPhase.fishingImpact >= 80 ? '#27AE60' : moonPhase.fishingImpact >= 60 ? '#F39C12' : '#E74C3C' }
                  ]}>
                    {moonPhase.fishingImpact >= 80 ? 'Excellent' : moonPhase.fishingImpact >= 60 ? 'Good' : 'Moderate'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Moon phases for the week */}
            <View style={styles.moonWeek}>
              <Text style={styles.subTitle}>This Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.moonWeekList}>
                  {getMoonPhasesForWeek().map((day, index) => (
                    <View key={index} style={styles.moonDayItem}>
                      <Text style={styles.moonDayName}>
                        {index === 0 ? 'Today' : day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={styles.moonDayEmoji}>{day.emoji}</Text>
                      <Text style={styles.moonDayIllum}>{day.illumination}%</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Tides Card (only for coastal locations) */}
          {isCoastal && marine && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🌊 Tides</Text>
              
              <View style={styles.tideStrength}>
                <Text style={styles.tideStrengthLabel}>{marine.tides.strength}</Text>
              </View>

              <View style={styles.tidesList}>
                {marine.tides.times.map((tide, index) => (
                  <View key={index} style={styles.tideItem}>
                    <Text style={styles.tideIcon}>{tide.icon}</Text>
                    <View style={styles.tideInfo}>
                      <Text style={styles.tideType}>{tide.type} Tide</Text>
                      <Text style={styles.tideTime}>{tide.time}</Text>
                    </View>
                    <Text style={styles.tideHeight}>{tide.height}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.tideNote}>{marine.tides.note}</Text>
            </View>
          )}

          {/* 7-Day Forecast */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📅 7-Day Fishing Forecast</Text>
            
            <View style={styles.forecastList}>
              {forecast.map((day, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.forecastItem,
                    index === 0 && styles.forecastItemToday
                  ]}
                >
                  <View style={styles.forecastDay}>
                    <Text style={styles.forecastDayName}>{day.dayName}</Text>
                    <Text style={styles.forecastMoon}>{day.moonPhase.emoji}</Text>
                  </View>
                  
                  <View style={styles.forecastWeather}>
                    <Text style={styles.forecastIcon}>{day.icon}</Text>
                    <View style={styles.forecastTemps}>
                      <Text style={styles.forecastTempMax}>{day.tempMax}°</Text>
                      <Text style={styles.forecastTempMin}>{day.tempMin}°</Text>
                    </View>
                  </View>

                  <View style={styles.forecastActivity}>
                    <View style={styles.forecastScoreBar}>
                      <View 
                        style={[
                          styles.forecastScoreFill,
                          { 
                            width: `${day.fishingScore}%`,
                            backgroundColor: day.fishingColor,
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.forecastScoreText, { color: day.fishingColor }]}>
                      {day.fishingScore}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Sun Times */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>☀️ Sun Times</Text>
            
            <View style={styles.sunTimes}>
              <View style={styles.sunTimeItem}>
                <Text style={styles.sunIcon}>🌅</Text>
                <Text style={styles.sunLabel}>Sunrise</Text>
                <Text style={styles.sunValue}>
                  {new Date(today.sunrise).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </Text>
              </View>
              <View style={styles.sunDivider} />
              <View style={styles.sunTimeItem}>
                <Text style={styles.sunIcon}>🌇</Text>
                <Text style={styles.sunLabel}>Sunset</Text>
                <Text style={styles.sunValue}>
                  {new Date(today.sunset).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Fishing Tips */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💡 Tips for Today</Text>
            
            <View style={styles.tipsList}>
              {generateTips(current, moonPhase, fishingActivity).map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipIcon}>{tip.icon}</Text>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: hp(4) }} />
        </ScrollView>
      </View>

      {/* Explainer Modal */}
      <ActivityExplainerModal
        visible={showExplainer}
        onClose={() => setShowExplainer(false)}
        factors={weatherData?.fishingActivity?.factors}
      />
    </ScreenWrapper>
  );
};

// Generate fishing tips based on conditions
const generateTips = (weather, moon, activity) => {
  const tips = [];

  // Temperature tips
  if (weather.temperature < 10) {
    tips.push({ icon: '🥶', text: 'Cold water - fish will be slower. Try slower presentations and deeper spots.' });
  } else if (weather.temperature > 25) {
    tips.push({ icon: '☀️', text: 'Hot day - fish early morning or late evening when water is cooler.' });
  }

  // Wind tips
  if (weather.windSpeed > 20) {
    tips.push({ icon: '💨', text: 'Strong wind - fish the windward bank where food accumulates.' });
  } else if (weather.windSpeed < 5) {
    tips.push({ icon: '🍃', text: 'Light wind - great surface fishing conditions!' });
  }

  // Moon tips
  if (moon.phase === 'Full Moon' || moon.phase === 'New Moon') {
    tips.push({ icon: moon.emoji, text: `${moon.phase} - fish are typically more active. Great time for night sessions!` });
  }

  // Pressure tips
  if (weather.pressure > 1020) {
    tips.push({ icon: '📈', text: 'High pressure - fish may be deeper. Try bottom baits.' });
  } else if (weather.pressure < 1005) {
    tips.push({ icon: '📉', text: 'Low pressure - fish often feed aggressively before storms.' });
  }

  // Cloud cover
  if (weather.cloudCover > 70) {
    tips.push({ icon: '☁️', text: 'Overcast skies - excellent conditions! Fish will be more confident.' });
  }

  // Activity score
  if (activity.score >= 80) {
    tips.push({ icon: '🎣', text: 'Perfect conditions! Don\'t miss this opportunity.' });
  }

  return tips.length > 0 ? tips : [{ icon: '🐟', text: 'Decent conditions - patience is key!' }];
};

export default Weather;

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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  refreshButton: {
    padding: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(2),
    padding: wp(10),
  },
  errorIcon: {
    fontSize: hp(5),
  },
  errorText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: theme.radius.lg,
  },
  retryText: {
    color: 'white',
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semibold,
  },
  scrollContent: {
    padding: wp(4),
    paddingBottom: hp(4),
  },
  
  // Current Weather Card
  currentCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    padding: wp(5),
    marginBottom: hp(2),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: hp(1),
  },
  locationIcon: {
    fontSize: hp(1.8),
  },
  locationText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    color: 'white',
  },
  currentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    marginBottom: hp(1),
  },
  currentIcon: {
    fontSize: hp(8),
  },
  currentTemp: {},
  temperature: {
    fontSize: hp(5),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  feelsLike: {
    fontSize: hp(1.6),
    color: 'rgba(255,255,255,0.8)',
  },
  condition: {
    fontSize: hp(2),
    color: 'white',
    marginBottom: hp(2),
  },
  currentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.radius.lg,
    padding: wp(3),
  },
  detailItem: {
    alignItems: 'center',
    gap: 4,
  },
  detailIcon: {
    fontSize: hp(2),
  },
  detailLabel: {
    fontSize: hp(1.3),
    color: 'rgba(255,255,255,0.7)',
  },
  detailValue: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semibold,
    color: 'white',
  },

  // Water Temperature Card
  waterTempCard: {
    backgroundColor: 'white',
    borderRadius: theme.radius.xl,
    padding: wp(5),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  waterTempMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: hp(2),
  },
  waterTempIcon: {
    fontSize: hp(4),
  },
  waterTempContent: {
    flex: 1,
  },
  waterTempLabel: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  waterTempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  waterTempValue: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  waterTempBadge: {
    backgroundColor: '#3498DB20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  waterTempBadgeText: {
    fontSize: hp(1.2),
    fontWeight: theme.fonts.semibold,
    color: '#3498DB',
  },
  waterTempBadgeEstimated: {
    backgroundColor: '#F39C1220',
  },
  waterTempBadgeTextEstimated: {
    color: '#F39C12',
  },
  waterTempNote: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  waterTempRange: {
    marginTop: hp(1),
  },
  waterTempRangeBar: {
    height: 8,
    backgroundColor: theme.colors.gray + '30',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  waterTempRangeOptimal: {
    position: 'absolute',
    left: '33.3%', // (15-5)/(35-5) = 33.3%
    width: '33.3%', // (25-15)/(35-5) = 33.3%
    height: '100%',
    backgroundColor: '#27AE6040',
    borderRadius: 4,
  },
  waterTempMarker: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  waterTempRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },
  waterTempRangeText: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
  },
  waterTempRangeTextOptimal: {
    fontSize: hp(1.2),
    color: '#27AE60',
    fontWeight: theme.fonts.medium,
  },

  // Generic Card
  card: {
    backgroundColor: 'white',
    borderRadius: theme.radius.xl,
    padding: wp(5),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  cardTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textLight,
    marginBottom: hp(1),
    marginTop: hp(2),
  },

  // Activity Section
  activityMain: {
    alignItems: 'center',
    paddingVertical: hp(2),
  },
  activityGauge: {
    alignItems: 'center',
    width: '100%',
  },
  activityScore: {
    fontSize: hp(5),
    fontWeight: theme.fonts.bold,
  },
  activityBarLarge: {
    width: '100%',
    height: 12,
    backgroundColor: theme.colors.gray + '40',
    borderRadius: 6,
    marginVertical: hp(1),
    overflow: 'hidden',
  },
  activityFillLarge: {
    height: '100%',
    borderRadius: 6,
  },
  activityLabel: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
  },
  factorsBreakdown: {
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray + '30',
  },
  factorsTitle: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textLight,
    marginBottom: hp(1),
  },
  factorsGrid: {
    gap: 8,
  },
  factorMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorMiniIcon: {
    fontSize: hp(1.6),
    width: 24,
    textAlign: 'center',
  },
  factorMiniBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.gray + '30',
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorMiniFill: {
    height: '100%',
    borderRadius: 3,
  },
  factorMiniScore: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.semibold,
    width: 28,
    textAlign: 'right',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(1.5),
    gap: 4,
  },
  learnMoreText: {
    fontSize: hp(1.4),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  bestTimesSection: {},
  bestTimesList: {
    gap: 12,
  },
  bestTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray + '20',
    padding: wp(3),
    borderRadius: theme.radius.lg,
    gap: 12,
  },
  bestTimeIcon: {
    fontSize: hp(2.5),
  },
  bestTimeInfo: {
    flex: 1,
  },
  bestTimeLabel: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  bestTimeValue: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  qualityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    color: 'white',
    fontSize: hp(1.3),
  },

  // Moon Section
  moonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
  },
  moonEmoji: {
    fontSize: hp(8),
  },
  moonInfo: {
    flex: 1,
  },
  moonPhase: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  moonIllumination: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginBottom: hp(1),
  },
  moonImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moonImpactLabel: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  moonImpactValue: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semibold,
  },
  moonWeek: {},
  moonWeekList: {
    flexDirection: 'row',
    gap: 16,
  },
  moonDayItem: {
    alignItems: 'center',
    gap: 4,
  },
  moonDayName: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
  moonDayEmoji: {
    fontSize: hp(3),
  },
  moonDayIllum: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
  },

  // Tides Section
  tideStrength: {
    backgroundColor: theme.colors.primary + '15',
    padding: wp(2),
    borderRadius: theme.radius.md,
    alignSelf: 'flex-start',
    marginBottom: hp(1.5),
  },
  tideStrengthLabel: {
    fontSize: hp(1.4),
    color: theme.colors.primary,
    fontWeight: theme.fonts.semibold,
  },
  tidesList: {
    gap: 12,
  },
  tideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tideIcon: {
    fontSize: hp(2),
  },
  tideInfo: {
    flex: 1,
  },
  tideType: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  tideTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  tideHeight: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.primary,
  },
  tideNote: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    fontStyle: 'italic',
    marginTop: hp(1.5),
  },

  // Forecast Section
  forecastList: {
    gap: 8,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '30',
  },
  forecastItemToday: {
    backgroundColor: theme.colors.primary + '10',
    marginHorizontal: -wp(5),
    paddingHorizontal: wp(5),
    borderRadius: theme.radius.lg,
    borderBottomWidth: 0,
  },
  forecastDay: {
    width: wp(22),
  },
  forecastDayName: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  forecastMoon: {
    fontSize: hp(1.4),
  },
  forecastWeather: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  forecastIcon: {
    fontSize: hp(2.5),
  },
  forecastTemps: {
    flexDirection: 'row',
    gap: 6,
  },
  forecastTempMax: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  forecastTempMin: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  forecastActivity: {
    width: wp(25),
    alignItems: 'flex-end',
  },
  forecastScoreBar: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.gray + '40',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  forecastScoreFill: {
    height: '100%',
    borderRadius: 3,
  },
  forecastScoreText: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.semibold,
  },

  // Sun Times
  sunTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunTimeItem: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  sunIcon: {
    fontSize: hp(3.5),
  },
  sunLabel: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  sunValue: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  sunDivider: {
    width: 1,
    height: '80%',
    backgroundColor: theme.colors.gray,
    marginHorizontal: wp(5),
  },

  // Tips
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: theme.colors.gray + '15',
    padding: wp(3),
    borderRadius: theme.radius.lg,
  },
  tipIcon: {
    fontSize: hp(2),
  },
  tipText: {
    flex: 1,
    fontSize: hp(1.5),
    color: theme.colors.text,
    lineHeight: hp(2.2),
  },
}); 