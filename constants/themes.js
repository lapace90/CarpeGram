/**
 * Carpegram Themes
 * 4 fishing-inspired color palettes
 * 
 * Chaque thème garde la même structure que constants/theme.js
 * pour garantir la compatibilité
 */

// Configuration de base partagée
const baseConfig = {
  fonts: {
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  radius: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
};

// ============================================
// 🎣 FRESH CATCH (Thème actuel)
// ============================================
export const freshCatch = {
  ...baseConfig,
  id: 'freshCatch',
  name: 'Fresh Catch',
  emoji: '🎣',
  description: 'Classic blue waters',
  colors: {
    // Couleurs originales conservées
    primary: '#0088c2ff',
    primaryDark: '#0047c2ff',
    primaryLight: '#33A3D4',
    
    dark: '#3e3e3e',
    darkLight: '#E1E1E1',
    gray: '#E3E3E3',

    text: '#494949',
    textLight: '#7C7C7C',
    textDark: '#1D1D1D',

    rose: '#EF4444',
    roseLight: '#f87171',

    // Couleurs additionnelles
    accent: '#2ECC71',
    accentLight: '#58D68D',
    background: '#FFFFFF',
    backgroundDark: '#F7FAFC',
    card: '#FFFFFF',
    border: '#E3E3E3',
  },
};

// ============================================
// 🌊 DEEP LAKE (Premium & Élégant)
// ============================================
export const deepLake = {
  ...baseConfig,
  id: 'deepLake',
  name: 'Deep Lake',
  emoji: '🌊',
  description: 'Deep blue with gold',
  colors: {
    primary: '#1E6091',
    primaryDark: '#14405F',
    primaryLight: '#3D8AB8',

    dark: '#1A2B3C',
    darkLight: '#E1E8ED',
    gray: '#E1E8ED',

    text: '#1A2B3C',
    textLight: '#6B7C8D',
    textDark: '#0D1821',

    rose: '#E74C3C',
    roseLight: '#F87171',

    accent: '#D4A03A',
    accentLight: '#E8C068',
    background: '#FFFFFF',
    backgroundDark: '#F8FAFB',
    card: '#FFFFFF',
    border: '#E1E8ED',
  },
};

// ============================================
// 🌿 MORNING MIST (Nature & Calme)
// ============================================
export const morningMist = {
  ...baseConfig,
  id: 'morningMist',
  name: 'Morning Mist',
  emoji: '🌿',
  description: 'Natural & calm',
  colors: {
    primary: '#3D7068',
    primaryDark: '#2A4F49',
    primaryLight: '#5A9A90',

    dark: '#2D3B36',
    darkLight: '#D4DDD9',
    gray: '#D4DDD9',

    text: '#2D3B36',
    textLight: '#6B7D75',
    textDark: '#1A2420',

    rose: '#EF5350',
    roseLight: '#F87171',

    accent: '#B87333',
    accentLight: '#D4956B',
    background: '#FFFFFF',
    backgroundDark: '#F5F7F6',
    card: '#FFFFFF',
    border: '#D4DDD9',
  },
};

// ============================================
// 🌅 GOLDEN HOUR (Chaud & Vibrant)
// ============================================
export const goldenHour = {
  ...baseConfig,
  id: 'goldenHour',
  name: 'Golden Hour',
  emoji: '🌅',
  description: 'Warm sunset vibes',
  colors: {
    primary: '#264653',
    primaryDark: '#1A323C',
    primaryLight: '#3A6A7A',

    dark: '#264653',
    darkLight: '#E5DDD4',
    gray: '#E5DDD4',

    text: '#264653',
    textLight: '#5C7A87',
    textDark: '#1A323C',

    rose: '#E63946',
    roseLight: '#FF6B6B',

    accent: '#E9C46A',
    accentLight: '#F4D590',
    background: '#FFFFFF',
    backgroundDark: '#FDFAF6',
    card: '#FFFFFF',
    border: '#E5DDD4',
  },
};

// ============================================
// EXPORTS
// ============================================

export const themes = {
  freshCatch,
  deepLake,
  morningMist,
  goldenHour,
};

export const themeList = [
  freshCatch,
  deepLake,
  morningMist,
  goldenHour,
];

export const defaultThemeId = 'freshCatch';
export const defaultTheme = freshCatch;