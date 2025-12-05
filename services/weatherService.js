/**
 * Weather Service for Carpegram
 * Uses Open-Meteo API (free, no API key required)
 * Includes fishing activity calculations, moon phases, and tides
 */

// ============================================
// MOON PHASE CALCULATIONS (Client-side)
// ============================================

/**
 * Calculate moon phase for a given date
 * Returns phase name and illumination percentage
 */
export const getMoonPhase = (date = new Date()) => {
  // Known new moon date for reference
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycle = 29.53058867; // days
  
  const daysSinceNew = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const currentCycle = daysSinceNew % lunarCycle;
  const phasePercent = (currentCycle / lunarCycle) * 100;
  
  // Illumination (0 at new moon, 100 at full moon)
  const illumination = Math.round(
    50 * (1 - Math.cos((2 * Math.PI * currentCycle) / lunarCycle))
  );
  
  // Determine phase name and emoji
  let phase, emoji, fishingImpact;
  
  if (phasePercent < 1.85 || phasePercent >= 98.15) {
    phase = 'New Moon';
    emoji = '🌑';
    fishingImpact = 90; // Excellent for fishing
  } else if (phasePercent < 23.15) {
    phase = 'Waxing Crescent';
    emoji = '🌒';
    fishingImpact = 70;
  } else if (phasePercent < 26.85) {
    phase = 'First Quarter';
    emoji = '🌓';
    fishingImpact = 80; // Good
  } else if (phasePercent < 48.15) {
    phase = 'Waxing Gibbous';
    emoji = '🌔';
    fishingImpact = 60;
  } else if (phasePercent < 51.85) {
    phase = 'Full Moon';
    emoji = '🌕';
    fishingImpact = 95; // Excellent
  } else if (phasePercent < 73.15) {
    phase = 'Waning Gibbous';
    emoji = '🌖';
    fishingImpact = 65;
  } else if (phasePercent < 76.85) {
    phase = 'Last Quarter';
    emoji = '🌗';
    fishingImpact = 75; // Good
  } else {
    phase = 'Waning Crescent';
    emoji = '🌘';
    fishingImpact = 70;
  }
  
  return {
    phase,
    emoji,
    illumination,
    fishingImpact,
    daysInCycle: Math.round(currentCycle * 10) / 10,
  };
};

/**
 * Get moon phases for multiple days
 */
export const getMoonPhasesForWeek = (startDate = new Date()) => {
  const phases = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    phases.push({
      date,
      ...getMoonPhase(date),
    });
  }
  return phases;
};


// ============================================
// WATER TEMPERATURE CALCULATIONS
// ============================================

/**
 * Get current season based on date and hemisphere
 */
const getSeason = (date = new Date(), hemisphere = 'north') => {
  const month = date.getMonth(); // 0-11
  
  let season;
  if (month >= 2 && month <= 4) {
    season = 'spring';
  } else if (month >= 5 && month <= 7) {
    season = 'summer';
  } else if (month >= 8 && month <= 10) {
    season = 'autumn';
  } else {
    season = 'winter';
  }
  
  // Flip for southern hemisphere
  if (hemisphere === 'south') {
    const flip = {
      spring: 'autumn',
      summer: 'winter',
      autumn: 'spring',
      winter: 'summer',
    };
    season = flip[season];
  }
  
  return season;
};

/**
 * Estimate freshwater temperature based on air temperature and season
 * Uses thermal inertia principle - water changes slower than air
 * 
 * @param {number} airTemp - Current air temperature in °C
 * @param {number} avgAirTemp - Average air temp over last few days (optional)
 * @param {string} waterBodyType - 'lake', 'pond', 'river', 'stream'
 * @param {string} season - 'spring', 'summer', 'autumn', 'winter'
 * @returns {object} - Estimated water temperature and confidence
 */
export const estimateFreshwaterTemp = (airTemp, avgAirTemp = null, waterBodyType = 'lake', season = null) => {
  // Use current season if not provided
  if (!season) {
    season = getSeason();
  }
  
  // Use average if provided, otherwise current temp
  const baseTemp = avgAirTemp || airTemp;
  
  // Seasonal lag - water temperature relative to air
  const seasonalAdjustment = {
    spring: -4,   // Water still cold from winter
    summer: -2,   // Water slightly cooler than air
    autumn: +3,   // Water retains summer heat
    winter: +2,   // Water warmer than cold air (above 4°C)
  };
  
  // Water body type affects temperature stability
  const waterBodyFactor = {
    lake: 0,      // Large, stable
    pond: +1,     // Smaller, warms/cools faster
    river: -1,    // Flowing water, usually cooler
    stream: -2,   // Cold, often spring-fed
  };
  
  // Calculate estimated temperature
  let waterTemp = baseTemp + (seasonalAdjustment[season] || 0) + (waterBodyFactor[waterBodyType] || 0);
  
  // Physical limits for freshwater
  // Water is densest at 4°C, lakes rarely go below this except at surface
  waterTemp = Math.max(4, waterTemp);
  // Upper limit for natural freshwater
  waterTemp = Math.min(30, waterTemp);
  
  // Round to 1 decimal
  waterTemp = Math.round(waterTemp * 10) / 10;
  
  // Confidence based on data quality
  let confidence = 'low';
  let confidenceNote = 'Based on air temperature estimation';
  
  if (avgAirTemp) {
    confidence = 'medium';
    confidenceNote = 'Based on average air temperature';
  }
  
  return {
    temperature: waterTemp,
    isEstimated: true,
    source: 'calculation',
    confidence,
    confidenceNote,
    season,
    waterBodyType,
  };
};

/**
 * Fetch sea surface temperature from Open-Meteo Marine API
 * Only works for ocean/sea locations
 * 
 * @param {number} latitude
 * @param {number} longitude
 * @returns {object} - Sea temperature or null if not available
 */
export const getSeaTemperature = async (latitude, longitude) => {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=sea_surface_temperature,wave_height&daily=wave_height_max&timezone=auto`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // Location might not be near ocean
      return null;
    }
    
    const data = await response.json();
    
    // Check if we got valid data
    if (!data.current || data.current.sea_surface_temperature === null) {
      return null;
    }
    
    return {
      temperature: data.current.sea_surface_temperature,
      isEstimated: false,
      source: 'open-meteo-marine',
      confidence: 'high',
      confidenceNote: 'Real-time satellite data',
      waveHeight: data.current.wave_height,
      maxWaveToday: data.daily?.wave_height_max?.[0] || null,
    };
  } catch (error) {
    console.log('Marine API not available for this location:', error.message);
    return null;
  }
};

/**
 * Check if location is likely coastal/marine
 * Simple heuristic - try marine API and see if it works
 */
export const isCoastalLocation = async (latitude, longitude) => {
  const seaData = await getSeaTemperature(latitude, longitude);
  return seaData !== null;
};

/**
 * Get water temperature - tries marine API first, falls back to estimation
 * 
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} airTemp - Current air temperature
 * @param {number} avgAirTemp - Average air temp (optional)
 * @param {string} waterBodyType - Type of water body for freshwater estimation
 * @returns {object} - Water temperature data
 */
export const getWaterTemperature = async (latitude, longitude, airTemp, avgAirTemp = null, waterBodyType = 'lake') => {
  // First, try to get real sea temperature
  const seaTemp = await getSeaTemperature(latitude, longitude);
  
  if (seaTemp) {
    return {
      ...seaTemp,
      type: 'sea',
    };
  }
  
  // Fall back to freshwater estimation
  const freshwaterTemp = estimateFreshwaterTemp(airTemp, avgAirTemp, waterBodyType);
  
  return {
    ...freshwaterTemp,
    type: 'freshwater',
  };
};


// ============================================
// FISHING ACTIVITY CALCULATION (Enhanced)
// ============================================

/**
 * Factor weights for the fishing activity calculation
 * These define how much each factor contributes to the final score
 */
export const ACTIVITY_FACTORS = {
  waterTemp: {
    name: 'Water Temp',
    icon: '🌊',
    weight: 0.25,
    description: 'Carps are most active in water between 15-25°C. This is the most important factor for fish activity.',
  },
  pressure: {
    name: 'Pressure',
    icon: '📊',
    weight: 0.20,
    description: 'Stable or rising pressure (1015-1025 hPa) is ideal. Falling pressure often reduces activity.',
  },
  wind: {
    name: 'Wind',
    icon: '💨',
    weight: 0.15,
    description: 'Light wind (< 15 km/h) is best. Strong wind makes fishing difficult and disturbs fish.',
  },
  clouds: {
    name: 'Cloud Cover',
    icon: '☁️',
    weight: 0.10,
    description: 'Partly cloudy (40-70%) is ideal. Overcast days can trigger feeding.',
  },
  moon: {
    name: 'Moon Phase',
    icon: '🌙',
    weight: 0.15,
    description: 'New and full moons increase fish activity. Based on solunar theory.',
  },
  time: {
    name: 'Time of Day',
    icon: '🕐',
    weight: 0.15,
    description: 'Dawn and dusk are prime feeding times. Night sessions can also be productive.',
  },
};

/**
 * Calculate individual factor scores (0-100 each)
 */
export const calculateFactorScores = (weather, moonPhase) => {
  const factors = {};
  
  // WATER TEMPERATURE (0-100) - Most important factor!
  const waterTempData = weather.waterTemperature || {};
  const waterTemp = waterTempData.temperature || weather.temperature; // Fallback to air temp
  let waterTempScore = 50;
  
  if (waterTemp >= 15 && waterTemp <= 25) {
    waterTempScore = 100; // Optimal for carp
  } else if (waterTemp >= 12 && waterTemp <= 28) {
    waterTempScore = 75; // Good
  } else if (waterTemp >= 8 && waterTemp <= 32) {
    waterTempScore = 50; // Acceptable
  } else if (waterTemp >= 5 && waterTemp <= 35) {
    waterTempScore = 25; // Poor
  } else {
    waterTempScore = 10; // Very poor
  }
  
  // Build display value with source indicator
  let waterTempValue = `${waterTemp}°C`;
  if (waterTempData.isEstimated) {
    waterTempValue += ' (est.)';
  }
  if (waterTempData.type === 'sea') {
    waterTempValue = `${waterTemp}°C (sea)`;
  }
  
  factors.waterTemp = {
    score: waterTempScore,
    value: waterTempValue,
    rawTemp: waterTemp,
    isEstimated: waterTempData.isEstimated || false,
    source: waterTempData.source || 'unknown',
    type: waterTempData.type || 'freshwater',
    confidence: waterTempData.confidence || 'low',
    status: getFactorStatus(waterTempScore),
  };
  
  // PRESSURE (0-100)
  const pressure = weather.pressure || 1013;
  let pressureScore = 50;
  
  // Optimal range
  if (pressure >= 1015 && pressure <= 1025) {
    pressureScore = 90;
  } else if (pressure >= 1010 && pressure <= 1030) {
    pressureScore = 70;
  } else if (pressure >= 1005 && pressure <= 1035) {
    pressureScore = 50;
  } else if (pressure < 1000) {
    pressureScore = 20; // Storm approaching
  } else {
    pressureScore = 40;
  }
  
  // Trend bonus/malus
  if (weather.pressureTrend === 'rising') {
    pressureScore = Math.min(100, pressureScore + 15);
  } else if (weather.pressureTrend === 'falling_fast') {
    pressureScore = Math.max(0, pressureScore - 20);
  } else if (weather.pressureTrend === 'falling') {
    pressureScore = Math.max(0, pressureScore - 10);
  }
  
  factors.pressure = {
    score: pressureScore,
    value: `${pressure} hPa`,
    trend: weather.pressureTrend || 'stable',
    status: getFactorStatus(pressureScore),
  };
  
  // WIND (0-100)
  const wind = weather.windSpeed || 0;
  let windScore = 50;
  if (wind < 8) {
    windScore = 100; // Very calm
  } else if (wind < 15) {
    windScore = 85; // Light breeze
  } else if (wind < 25) {
    windScore = 60; // Moderate
  } else if (wind < 35) {
    windScore = 35; // Strong
  } else {
    windScore = 15; // Very strong
  }
  factors.wind = {
    score: windScore,
    value: `${wind} km/h ${weather.windDirection || ''}`,
    status: getFactorStatus(windScore),
  };
  
  // CLOUDS (0-100)
  const clouds = weather.cloudCover || 0;
  let cloudScore = 50;
  if (clouds >= 40 && clouds <= 70) {
    cloudScore = 100; // Partly cloudy - ideal
  } else if (clouds >= 70 && clouds <= 90) {
    cloudScore = 80; // Mostly cloudy - good
  } else if (clouds > 90) {
    cloudScore = 70; // Overcast - ok
  } else if (clouds >= 20 && clouds < 40) {
    cloudScore = 60; // Few clouds
  } else {
    cloudScore = 40; // Clear sky - fish are wary
  }
  
  // Rain bonus for light rain
  if (weather.precipitation > 0 && weather.precipitation < 2) {
    cloudScore = Math.min(100, cloudScore + 10);
  } else if (weather.precipitation > 5) {
    cloudScore = Math.max(0, cloudScore - 20);
  }
  
  factors.clouds = {
    score: cloudScore,
    value: `${clouds}%`,
    precipitation: weather.precipitation,
    status: getFactorStatus(cloudScore),
  };
  
  // MOON (0-100) - Based on solunar theory
  let moonScore = 50;
  if (moonPhase) {
    // Full moon and new moon = highest activity
    if (moonPhase.phase === 'Full Moon') {
      moonScore = 100;
    } else if (moonPhase.phase === 'New Moon') {
      moonScore = 95;
    } else if (moonPhase.phase === 'First Quarter' || moonPhase.phase === 'Last Quarter') {
      moonScore = 75;
    } else if (moonPhase.phase === 'Waxing Gibbous' || moonPhase.phase === 'Waning Gibbous') {
      moonScore = 60;
    } else {
      moonScore = 55; // Crescents
    }
  }
  factors.moon = {
    score: moonScore,
    value: moonPhase?.phase || 'Unknown',
    emoji: moonPhase?.emoji || '🌙',
    illumination: moonPhase?.illumination || 0,
    status: getFactorStatus(moonScore),
  };
  
  // TIME OF DAY (0-100) - Solunar periods
  const hour = new Date().getHours();
  let timeScore = 40;
  let timePeriod = 'midday';
  
  // Major periods: dawn (5-9) and dusk (17-21)
  if (hour >= 5 && hour <= 9) {
    timeScore = 100;
    timePeriod = 'dawn';
  } else if (hour >= 17 && hour <= 21) {
    timeScore = 95;
    timePeriod = 'dusk';
  }
  // Minor periods: night (22-4) and late morning (10-11)
  else if (hour >= 22 || hour <= 4) {
    timeScore = 70;
    timePeriod = 'night';
  } else if (hour >= 10 && hour <= 11) {
    timeScore = 55;
    timePeriod = 'late morning';
  } else if (hour >= 14 && hour <= 16) {
    timeScore = 45;
    timePeriod = 'afternoon';
  } else {
    timeScore = 35;
    timePeriod = 'midday';
  }
  
  factors.time = {
    score: timeScore,
    value: `${hour}:00`,
    period: timePeriod,
    status: getFactorStatus(timeScore),
  };
  
  return factors;
};

/**
 * Get status label for a factor score
 */
const getFactorStatus = (score) => {
  if (score >= 85) return { label: 'Excellent', color: '#27AE60' };
  if (score >= 70) return { label: 'Good', color: '#2ECC71' };
  if (score >= 50) return { label: 'Moderate', color: '#F39C12' };
  if (score >= 30) return { label: 'Fair', color: '#E67E22' };
  return { label: 'Poor', color: '#E74C3C' };
};

/**
 * Calculate fishing activity score based on weather conditions
 * Returns a score from 0-100, label, color, and detailed breakdown
 */
export const calculateFishingActivity = (weather, moonPhase) => {
  // Calculate individual factor scores
  const factors = calculateFactorScores(weather, moonPhase);
  
  // Calculate weighted average
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.keys(ACTIVITY_FACTORS).forEach((key) => {
    const weight = ACTIVITY_FACTORS[key].weight;
    const score = factors[key]?.score || 50;
    weightedSum += score * weight;
    totalWeight += weight;
  });
  
  // Final score
  const score = Math.round(weightedSum / totalWeight);
  
  // Determine label and color
  let label, color;
  if (score >= 80) {
    label = 'Excellent';
    color = '#27AE60';
  } else if (score >= 65) {
    label = 'Good';
    color = '#2ECC71';
  } else if (score >= 50) {
    label = 'Moderate';
    color = '#F39C12';
  } else if (score >= 35) {
    label = 'Fair';
    color = '#E67E22';
  } else {
    label = 'Poor';
    color = '#E74C3C';
  }
  
  return { 
    score, 
    label, 
    color,
    factors, // Detailed breakdown
    weights: ACTIVITY_FACTORS, // Factor definitions
  };
};

/**
 * Get best fishing times for today
 */
export const getBestFishingTimes = (sunrise, sunset) => {
  const times = [];
  
  // Dawn (1 hour before to 2 hours after sunrise)
  if (sunrise) {
    const sunriseDate = new Date(sunrise);
    const dawnStart = new Date(sunriseDate);
    dawnStart.setHours(dawnStart.getHours() - 1);
    const dawnEnd = new Date(sunriseDate);
    dawnEnd.setHours(dawnEnd.getHours() + 2);
    
    times.push({
      label: 'Dawn',
      start: formatTime(dawnStart),
      end: formatTime(dawnEnd),
      quality: 'excellent',
      icon: '🌅',
    });
  }
  
  // Dusk (2 hours before to 1 hour after sunset)
  if (sunset) {
    const sunsetDate = new Date(sunset);
    const duskStart = new Date(sunsetDate);
    duskStart.setHours(duskStart.getHours() - 2);
    const duskEnd = new Date(sunsetDate);
    duskEnd.setHours(duskEnd.getHours() + 1);
    
    times.push({
      label: 'Dusk',
      start: formatTime(duskStart),
      end: formatTime(duskEnd),
      quality: 'excellent',
      icon: '🌇',
    });
  }
  
  // Night (for carp fishing)
  times.push({
    label: 'Night',
    start: '22:00',
    end: '04:00',
    quality: 'good',
    icon: '🌙',
  });
  
  return times;
};

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};


// ============================================
// WEATHER API (Open-Meteo)
// ============================================

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';

/**
 * Get current weather and forecast
 */
export const getWeather = async (latitude, longitude) => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'wind_speed_10m',
        'wind_direction_10m',
      ].join(','),
      hourly: [
        'temperature_2m',
        'precipitation_probability',
        'weather_code',
        'wind_speed_10m',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'precipitation_probability_max',
        'wind_speed_10m_max',
      ].join(','),
      timezone: 'auto',
      forecast_days: 7,
    });

    const response = await fetch(`${OPEN_METEO_BASE}/forecast?${params}`);
    
    if (!response.ok) {
      throw new Error('Weather API error');
    }

    const data = await response.json();
    
    return {
      success: true,
      data: parseWeatherData(data),
    };
  } catch (error) {
    console.error('Get weather error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Parse and format weather data
 */
const parseWeatherData = (data) => {
  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;
  
  // Get pressure trend (compare with 3 hours ago in hourly data)
  let pressureTrend = 'stable';
  // Note: Open-Meteo doesn't provide hourly pressure, so we'll estimate
  
  const currentWeather = {
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    pressure: Math.round(current.pressure_msl),
    pressureTrend,
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: getWindDirection(current.wind_direction_10m),
    windDegrees: current.wind_direction_10m,
    cloudCover: current.cloud_cover,
    precipitation: current.precipitation,
    weatherCode: current.weather_code,
    condition: getWeatherCondition(current.weather_code),
    icon: getWeatherIcon(current.weather_code),
  };
  
  // Today's data
  const today = {
    sunrise: daily.sunrise[0],
    sunset: daily.sunset[0],
    tempMax: Math.round(daily.temperature_2m_max[0]),
    tempMin: Math.round(daily.temperature_2m_min[0]),
    precipitationChance: daily.precipitation_probability_max[0],
  };
  
  // 7-day forecast
  const forecast = daily.time.map((date, index) => ({
    date,
    dayName: getDayName(date),
    tempMax: Math.round(daily.temperature_2m_max[index]),
    tempMin: Math.round(daily.temperature_2m_min[index]),
    weatherCode: daily.weather_code[index],
    condition: getWeatherCondition(daily.weather_code[index]),
    icon: getWeatherIcon(daily.weather_code[index]),
    precipitationChance: daily.precipitation_probability_max[index],
    windMax: Math.round(daily.wind_speed_10m_max[index]),
    sunrise: daily.sunrise[index],
    sunset: daily.sunset[index],
  }));
  
  // Hourly forecast (next 24 hours)
  const hourlyForecast = hourly.time.slice(0, 24).map((time, index) => ({
    time,
    hour: new Date(time).getHours(),
    temperature: Math.round(hourly.temperature_2m[index]),
    precipitationChance: hourly.precipitation_probability[index],
    weatherCode: hourly.weather_code[index],
    icon: getWeatherIcon(hourly.weather_code[index]),
    windSpeed: Math.round(hourly.wind_speed_10m[index]),
  }));
  
  return {
    current: currentWeather,
    today,
    forecast,
    hourlyForecast,
    timezone: data.timezone,
  };
};

/**
 * Get wind direction from degrees
 */
const getWindDirection = (degrees) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

/**
 * Get day name from date string
 */
const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Convert WMO weather code to condition name
 */
const getWeatherCondition = (code) => {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || 'Unknown';
};

/**
 * Convert WMO weather code to emoji icon
 */
const getWeatherIcon = (code) => {
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌧️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
};


// ============================================
// MARINE / TIDES API (Open-Meteo Marine)
// ============================================

/**
 * Get marine and tide data for coastal locations
 */
export const getMarineData = async (latitude, longitude) => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      hourly: [
        'wave_height',
        'wave_direction',
        'wave_period',
        'swell_wave_height',
        'ocean_current_velocity',
      ].join(','),
      daily: [
        'wave_height_max',
        'wave_direction_dominant',
      ].join(','),
      timezone: 'auto',
      forecast_days: 7,
    });

    const response = await fetch(`${OPEN_METEO_BASE}/marine?${params}`);
    
    if (!response.ok) {
      // Location might be too far from sea
      return {
        success: true,
        data: null,
        isInland: true,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: parseMarineData(data),
      isInland: false,
    };
  } catch (error) {
    console.error('Get marine data error:', error);
    return {
      success: true,
      data: null,
      isInland: true,
    };
  }
};

/**
 * Parse marine data
 */
const parseMarineData = (data) => {
  const hourly = data.hourly;
  const daily = data.daily;
  
  // Current conditions (first hour)
  const current = {
    waveHeight: hourly.wave_height?.[0] || null,
    waveDirection: hourly.wave_direction?.[0] || null,
    wavePeriod: hourly.wave_period?.[0] || null,
    swellHeight: hourly.swell_wave_height?.[0] || null,
    currentVelocity: hourly.ocean_current_velocity?.[0] || null,
  };
  
  // Simulated tides based on lunar cycle
  // Note: Open-Meteo doesn't provide actual tide data
  // This is a simplified estimation
  const tides = generateTideEstimate();
  
  return {
    current,
    tides,
    dailyMax: daily.wave_height_max,
  };
};

/**
 * Generate estimated tide times
 * Note: This is a simplified estimation. For accurate tides,
 * a specialized tide API would be needed.
 */
const generateTideEstimate = () => {
  const now = new Date();
  const moonPhase = getMoonPhase(now);
  
  // Tides are roughly 6 hours apart
  // High tides are higher during full/new moon (spring tides)
  const isSpringTide = moonPhase.phase === 'Full Moon' || moonPhase.phase === 'New Moon';
  const tideStrength = isSpringTide ? 'Strong (Spring)' : 'Moderate (Neap)';
  
  // Generate approximate tide times
  const baseTideHour = (moonPhase.daysInCycle * 0.8) % 12;
  
  const tides = [];
  for (let i = 0; i < 4; i++) {
    const hour = (baseTideHour + (i * 6.2)) % 24;
    const isHigh = i % 2 === 0;
    
    tides.push({
      type: isHigh ? 'High' : 'Low',
      time: `${Math.floor(hour).toString().padStart(2, '0')}:${Math.floor((hour % 1) * 60).toString().padStart(2, '0')}`,
      height: isHigh 
        ? (isSpringTide ? '2.8m' : '2.2m')
        : (isSpringTide ? '0.4m' : '0.8m'),
      icon: isHigh ? '⬆️' : '⬇️',
    });
  }
  
  // Sort by time
  tides.sort((a, b) => a.time.localeCompare(b.time));
  
  return {
    times: tides,
    strength: tideStrength,
    note: 'Estimated times. Check local tide charts for accuracy.',
  };
};


// ============================================
// COMBINED DATA FOR WIDGET
// ============================================

/**
 * Get all fishing-related weather data
 */
export const getFishingWeather = async (latitude, longitude) => {
  try {
    // Fetch weather and marine data in parallel
    const [weatherResult, marineResult] = await Promise.all([
      getWeather(latitude, longitude),
      getMarineData(latitude, longitude),
    ]);
    
    if (!weatherResult.success) {
      throw new Error(weatherResult.error);
    }
    
    const weather = weatherResult.data;
    const marine = marineResult.data;
    const moonPhase = getMoonPhase();
    
    // Get water temperature (sea or estimated freshwater)
    const waterTemperature = await getWaterTemperature(
      latitude,
      longitude,
      weather.current.temperature,
      null, // TODO: could use average temp from forecast
      'lake' // Default to lake, could be user preference
    );
    
    // Add water temperature to current weather for activity calculation
    const currentWithWater = {
      ...weather.current,
      waterTemperature,
    };
    
    // Calculate fishing activity with water temperature
    const fishingActivity = calculateFishingActivity(currentWithWater, moonPhase);
    
    // Get best fishing times
    const bestTimes = getBestFishingTimes(weather.today.sunrise, weather.today.sunset);
    
    // Week forecast with fishing scores
    const weekForecast = weather.forecast.map((day) => {
      const dayMoon = getMoonPhase(new Date(day.date));
      const avgTemp = (day.tempMax + day.tempMin) / 2;
      
      // Estimate water temp for forecast days
      const dayWaterTemp = estimateFreshwaterTemp(avgTemp, null, 'lake');
      
      const dayWeather = {
        temperature: avgTemp,
        waterTemperature: dayWaterTemp,
        windSpeed: day.windMax,
        cloudCover: 50, // Estimate
        precipitation: day.precipitationChance > 50 ? 2 : 0,
        pressure: 1013, // Estimate
      };
      const dayActivity = calculateFishingActivity(dayWeather, dayMoon);
      
      return {
        ...day,
        moonPhase: dayMoon,
        fishingScore: dayActivity.score,
        fishingLabel: dayActivity.label,
        fishingColor: dayActivity.color,
        waterTemp: dayWaterTemp.temperature,
      };
    });
    
    return {
      success: true,
      data: {
        current: weather.current,
        today: weather.today,
        hourly: weather.hourlyForecast,
        forecast: weekForecast,
        moonPhase,
        fishingActivity,
        bestTimes,
        marine,
        waterTemperature,
        isCoastal: !marineResult.isInland,
      },
    };
  } catch (error) {
    console.error('Get fishing weather error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getWeather,
  getMarineData,
  getFishingWeather,
  getMoonPhase,
  getMoonPhasesForWeek,
  calculateFishingActivity,
  getBestFishingTimes,
  getWaterTemperature,
  getSeaTemperature,
  estimateFreshwaterTemp,
};