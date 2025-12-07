import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import { useRouter } from 'expo-router';
import Icon from '../../assets/icons';
import BackButton from '../../components/BackButton';
import BubblesLoader from '../../components/animations/BubblesLoader';
import * as Location from 'expo-location';
import { getFishingWeather, getMoonPhasesForWeek } from '../../services/weatherService';
import ActivityExplainerModal from '../../components/weather/ActivityExplainerModal';

const Weather = () => {
  const { theme } = useTheme();
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
          setLocationName(place.city || place.subregion || place.region || 'Unknown');
        }
      } else {
        latitude = 43.2965;
        longitude = 5.3698;
        setLocationName('Marseille');
      }

      setCoordinates({ latitude, longitude });

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
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.container}>
          <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.gray }]}>
            <BackButton router={router} />
            <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              Fishing Weather
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.loadingContainer}>
            <BubblesLoader size={80} color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textLight }]}>
              Loading weather data...
            </Text>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.container}>
          <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.gray }]}>
            <BackButton router={router} />
            <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              Fishing Weather
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={[styles.errorText, { color: theme.colors.textLight }]}>{error}</Text>
            <Pressable 
              style={[styles.retryButton, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.lg }]} 
              onPress={loadWeather}
            >
              <Text style={[styles.retryText, { fontWeight: theme.fonts.semibold }]}>Try Again</Text>
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
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.gray }]}>
          <BackButton router={router} />
          <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            Fishing Weather
          </Text>
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
          <View style={[styles.currentCard, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl }]}>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={[styles.locationText, { fontWeight: theme.fonts.semibold }]}>{locationName}</Text>
            </View>

            <View style={styles.currentMain}>
              <Text style={styles.currentIcon}>{current.icon}</Text>
              <View style={styles.currentTemp}>
                <Text style={[styles.temperature, { fontWeight: theme.fonts.bold }]}>{current.temperature}°</Text>
                <Text style={styles.feelsLike}>Feels like {current.feelsLike}°</Text>
              </View>
            </View>

            <Text style={styles.condition}>{current.condition}</Text>

            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Text style={styles.weatherDetailIcon}>💨</Text>
                <Text style={styles.weatherDetailText}>{current.windSpeed} km/h {current.windDirection}</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={styles.weatherDetailIcon}>💧</Text>
                <Text style={styles.weatherDetailText}>{current.humidity}%</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={styles.weatherDetailIcon}>📊</Text>
                <Text style={styles.weatherDetailText}>{current.pressure} hPa</Text>
              </View>
            </View>
          </View>

          {/* Water Temperature */}
          {waterTemperature && (
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radius.xl }]}>
              <Text style={[styles.cardTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                🌊 Water Temperature
              </Text>
              
              <View style={styles.waterTempMain}>
                <Text style={[styles.waterTempValue, { color: theme.colors.primary, fontWeight: theme.fonts.bold }]}>
                  {waterTemperature.temperature}°C
                </Text>
                <View style={styles.waterTempInfo}>
                  <Text style={[styles.waterTempSource, { color: theme.colors.textLight }]}>
                    {waterTemperature.isRealData 
                      ? 'Real-time satellite data' 
                      : `Based on air temp & ${waterTemperature.season} season`
                    }
                  </Text>
                </View>
              </View>
              
              <View style={styles.waterTempRange}>
                <View style={[styles.waterTempRangeBar, { backgroundColor: theme.colors.gray + '40' }]}>
                  <View style={styles.waterTempRangeOptimal} />
                  <View 
                    style={[
                      styles.waterTempMarker,
                      { 
                        left: `${Math.max(0, Math.min(100, ((waterTemperature.temperature - 5) / 30) * 100))}%`,
                        backgroundColor: theme.colors.primary 
                      }
                    ]} 
                  />
                </View>
                <View style={styles.waterTempRangeLabels}>
                  <Text style={[styles.waterTempRangeText, { color: theme.colors.textLight }]}>5°C</Text>
                  <Text style={[styles.waterTempRangeTextOptimal, { fontWeight: theme.fonts.medium }]}>15-25°C optimal</Text>
                  <Text style={[styles.waterTempRangeText, { color: theme.colors.textLight }]}>35°C</Text>
                </View>
              </View>
            </View>
          )}

          {/* Fishing Activity Card */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radius.xl }]}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                🐟 Fishing Activity
              </Text>
              <Pressable 
                style={[styles.infoButton, { backgroundColor: theme.colors.primary + '15' }]} 
                onPress={() => setShowExplainer(true)}
              >
                <Icon name="info" size={18} color={theme.colors.primary} />
              </Pressable>
            </View>
            
            <View style={styles.activityMain}>
              <View style={styles.activityGauge}>
                <Text style={[styles.activityScore, { color: fishingActivity.color, fontWeight: theme.fonts.bold }]}>
                  {fishingActivity.score}%
                </Text>
                <View style={[styles.activityBarLarge, { backgroundColor: theme.colors.gray + '40' }]}>
                  <View 
                    style={[
                      styles.activityFillLarge,
                      { width: `${fishingActivity.score}%`, backgroundColor: fishingActivity.color }
                    ]} 
                  />
                </View>
                <Text style={[styles.activityLabel, { color: fishingActivity.color, fontWeight: theme.fonts.semibold }]}>
                  {fishingActivity.label}
                </Text>
              </View>
            </View>

            {/* Factors Breakdown */}
            {fishingActivity.factors && (
              <View style={[styles.factorsBreakdown, { borderTopColor: theme.colors.gray + '30' }]}>
                <Text style={[styles.factorsTitle, { fontWeight: theme.fonts.semibold, color: theme.colors.textLight }]}>
                  Key Factors
                </Text>
                <View style={styles.factorsGrid}>
                  {fishingActivity.factors.slice(0, 4).map((factor, index) => (
                    <View key={index} style={styles.factorMini}>
                      <Text style={styles.factorMiniIcon}>{factor.icon}</Text>
                      <View style={[styles.factorMiniBar, { backgroundColor: theme.colors.gray + '30' }]}>
                        <View 
                          style={[
                            styles.factorMiniFill,
                            { width: `${factor.score}%`, backgroundColor: factor.status.color }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.factorMiniScore, { color: factor.status.color, fontWeight: theme.fonts.semibold }]}>
                        {factor.score}
                      </Text>
                    </View>
                  ))}
                </View>
                <Pressable 
                  style={styles.learnMoreButton}
                  onPress={() => setShowExplainer(true)}
                >
                  <Text style={[styles.learnMoreText, { color: theme.colors.primary, fontWeight: theme.fonts.medium }]}>
                    How is this calculated?
                  </Text>
                  <Icon name="arrowRight" size={14} color={theme.colors.primary} />
                </Pressable>
              </View>
            )}

            {/* Best Times */}
            <View style={styles.bestTimesSection}>
              <Text style={[styles.subTitle, { fontWeight: theme.fonts.semibold, color: theme.colors.textLight }]}>
                Best Times Today
              </Text>
              <View style={styles.bestTimesList}>
                {bestTimes.map((time, index) => (
                  <View key={index} style={[styles.bestTimeItem, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg }]}>
                    <Text style={styles.bestTimeIcon}>{time.icon}</Text>
                    <View style={styles.bestTimeInfo}>
                      <Text style={[styles.bestTimeLabel, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                        {time.label}
                      </Text>
                      <Text style={[styles.bestTimeValue, { color: theme.colors.textLight }]}>
                        {time.start} - {time.end}
                      </Text>
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
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radius.xl }]}>
            <Text style={[styles.cardTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              🌙 Moon Phase
            </Text>
            
            <View style={styles.moonMain}>
              <Text style={styles.moonEmoji}>{moonPhase.emoji}</Text>
              <View style={styles.moonInfo}>
                <Text style={[styles.moonPhase, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                  {moonPhase.phase}
                </Text>
                <Text style={[styles.moonIllumination, { color: theme.colors.textLight }]}>
                  {moonPhase.illumination}% illuminated
                </Text>
                <View style={styles.moonImpact}>
                  <Text style={[styles.moonImpactLabel, { color: theme.colors.textLight }]}>Fishing Impact:</Text>
                  <Text style={[
                    styles.moonImpactValue,
                    { 
                      color: moonPhase.fishingImpact >= 80 ? '#27AE60' : moonPhase.fishingImpact >= 60 ? '#F39C12' : '#E74C3C',
                      fontWeight: theme.fonts.semibold 
                    }
                  ]}>
                    {moonPhase.fishingImpact >= 80 ? 'Excellent' : moonPhase.fishingImpact >= 60 ? 'Good' : 'Fair'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 7-Day Forecast */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radius.xl }]}>
            <Text style={[styles.cardTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              📅 7-Day Forecast
            </Text>
            
            <View style={styles.forecastList}>
              {forecast.map((day, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.forecastItem,
                    { borderBottomColor: theme.colors.gray + '30' },
                    index === 0 && [styles.forecastItemToday, { backgroundColor: theme.colors.primary + '10', borderRadius: theme.radius.lg }]
                  ]}
                >
                  <View style={styles.forecastDay}>
                    <Text style={[styles.forecastDayName, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                      {day.dayName}
                    </Text>
                    <Text style={styles.forecastMoon}>{day.moonPhase.emoji}</Text>
                  </View>
                  
                  <View style={styles.forecastWeather}>
                    <Text style={styles.forecastIcon}>{day.icon}</Text>
                    <View style={styles.forecastTemps}>
                      <Text style={[styles.forecastTempMax, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                        {day.tempMax}°
                      </Text>
                      <Text style={[styles.forecastTempMin, { color: theme.colors.textLight }]}>
                        {day.tempMin}°
                      </Text>
                    </View>
                  </View>

                  <View style={styles.forecastActivity}>
                    <View style={[styles.forecastScoreBar, { backgroundColor: theme.colors.gray + '40' }]}>
                      <View 
                        style={[
                          styles.forecastScoreFill,
                          { width: `${day.fishingScore}%`, backgroundColor: day.fishingColor }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.forecastScoreText, { color: day.fishingColor, fontWeight: theme.fonts.semibold }]}>
                      {day.fishingScore}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Sun Times */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radius.xl }]}>
            <Text style={[styles.cardTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              ☀️ Sun Times
            </Text>
            
            <View style={styles.sunTimes}>
              <View style={styles.sunTimeItem}>
                <Text style={styles.sunIcon}>🌅</Text>
                <Text style={[styles.sunLabel, { color: theme.colors.textLight }]}>Sunrise</Text>
                <Text style={[styles.sunValue, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                  {new Date(today.sunrise).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </Text>
              </View>
              <View style={[styles.sunDivider, { backgroundColor: theme.colors.gray }]} />
              <View style={styles.sunTimeItem}>
                <Text style={styles.sunIcon}>🌇</Text>
                <Text style={[styles.sunLabel, { color: theme.colors.textLight }]}>Sunset</Text>
                <Text style={[styles.sunValue, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
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
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radius.xl }]}>
            <Text style={[styles.cardTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              💡 Tips for Today
            </Text>
            
            <View style={styles.tipsList}>
              {generateTips(current, moonPhase, fishingActivity).map((tip, index) => (
                <View key={index} style={[styles.tipItem, { backgroundColor: theme.colors.gray + '15', borderRadius: theme.radius.lg }]}>
                  <Text style={styles.tipIcon}>{tip.icon}</Text>
                  <Text style={[styles.tipText, { color: theme.colors.text }]}>{tip.text}</Text>
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

  if (weather.temperature < 10) {
    tips.push({ icon: '🥶', text: 'Cold water - fish will be slower. Try slower presentations and deeper spots.' });
  } else if (weather.temperature > 25) {
    tips.push({ icon: '☀️', text: 'Hot day - fish early morning or late evening when water is cooler.' });
  }

  if (weather.windSpeed > 20) {
    tips.push({ icon: '💨', text: 'Strong wind - fish the windward bank where food accumulates.' });
  } else if (weather.windSpeed < 5) {
    tips.push({ icon: '🍃', text: 'Light wind - great surface fishing conditions!' });
  }

  if (moon.phase === 'Full Moon' || moon.phase === 'New Moon') {
    tips.push({ icon: moon.emoji, text: `${moon.phase} - fish are typically more active. Great time for night sessions!` });
  }

  if (weather.pressure > 1020) {
    tips.push({ icon: '📈', text: 'High pressure - fish may be deeper. Try bottom baits.' });
  } else if (weather.pressure < 1005) {
    tips.push({ icon: '📉', text: 'Low pressure - fish often feed aggressively before storms.' });
  }

  if (weather.cloudCover > 70) {
    tips.push({ icon: '☁️', text: 'Overcast skies - excellent conditions! Fish will be more confident.' });
  }

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
    borderBottomWidth: 1,
  },
  title: {
    fontSize: hp(2.5),
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
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
  },
  retryText: {
    color: 'white',
    fontSize: hp(1.7),
  },
  scrollContent: {
    padding: wp(4),
    paddingBottom: hp(4),
  },
  
  // Current Weather Card
  currentCard: {
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
    color: 'white',
  },
  feelsLike: {
    fontSize: hp(1.6),
    color: 'rgba(255,255,255,0.8)',
  },
  condition: {
    fontSize: hp(1.8),
    color: 'white',
    marginBottom: hp(2),
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: hp(1.5),
  },
  weatherDetail: {
    alignItems: 'center',
    gap: 4,
  },
  weatherDetailIcon: {
    fontSize: hp(2),
  },
  weatherDetailText: {
    fontSize: hp(1.4),
    color: 'rgba(255,255,255,0.9)',
  },

  // Water Temperature
  waterTempMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    marginBottom: hp(2),
  },
  waterTempValue: {
    fontSize: hp(4),
  },
  waterTempInfo: {
    flex: 1,
  },
  waterTempSource: {
    fontSize: hp(1.4),
  },
  waterTempRange: {
    marginTop: hp(1),
  },
  waterTempRangeBar: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
  },
  waterTempRangeOptimal: {
    position: 'absolute',
    left: '33.3%',
    width: '33.3%',
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
  },
  waterTempRangeTextOptimal: {
    fontSize: hp(1.2),
    color: '#27AE60',
  },

  // Generic Card
  card: {
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
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    fontSize: hp(1.6),
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
  },
  activityBarLarge: {
    width: '100%',
    height: 12,
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
  },
  factorsBreakdown: {
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 1,
  },
  factorsTitle: {
    fontSize: hp(1.4),
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
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorMiniFill: {
    height: '100%',
    borderRadius: 3,
  },
  factorMiniScore: {
    fontSize: hp(1.3),
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
  },
  bestTimesSection: {},
  bestTimesList: {
    gap: 12,
  },
  bestTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3),
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
  },
  bestTimeValue: {
    fontSize: hp(1.4),
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
    fontSize: hp(6),
  },
  moonInfo: {
    flex: 1,
  },
  moonPhase: {
    fontSize: hp(2),
  },
  moonIllumination: {
    fontSize: hp(1.5),
    marginTop: 2,
  },
  moonImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: hp(1),
  },
  moonImpactLabel: {
    fontSize: hp(1.4),
  },
  moonImpactValue: {
    fontSize: hp(1.4),
  },

  // Forecast
  forecastList: {
    gap: 0,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
  },
  forecastItemToday: {
    marginHorizontal: -wp(5),
    paddingHorizontal: wp(5),
    borderBottomWidth: 0,
  },
  forecastDay: {
    width: wp(22),
  },
  forecastDayName: {
    fontSize: hp(1.6),
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
  },
  forecastTempMin: {
    fontSize: hp(1.6),
  },
  forecastActivity: {
    width: wp(25),
    alignItems: 'flex-end',
  },
  forecastScoreBar: {
    width: '100%',
    height: 6,
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
  },
  sunValue: {
    fontSize: hp(2),
  },
  sunDivider: {
    width: 1,
    height: '80%',
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
    padding: wp(3),
  },
  tipIcon: {
    fontSize: hp(2),
  },
  tipText: {
    flex: 1,
    fontSize: hp(1.5),
    lineHeight: hp(2.2),
  },
});