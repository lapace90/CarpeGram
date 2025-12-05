import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, defaultTheme, themeList } from '../constants/themes';

const THEME_STORAGE_KEY = '@carpegram_theme';

const ThemeContext = createContext({
  theme: defaultTheme,
  themeId: 'freshCatch',
  setTheme: () => {},
  themeList: [],
  isLoading: true,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      console.log('🎨 Loaded theme from storage:', savedThemeId);
      
      if (savedThemeId && themes[savedThemeId]) {
        setThemeState(themes[savedThemeId]);
        console.log('🎨 Applied theme:', savedThemeId);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (themeId) => {
    console.log('🎨 setTheme called with:', themeId);
    
    if (!themes[themeId]) {
      console.warn(`Theme "${themeId}" not found`);
      return;
    }

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      console.log('🎨 Saved to AsyncStorage:', themeId);
      
      setThemeState(themes[themeId]);
      console.log('🎨 State updated to:', themes[themeId].name);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  console.log('🎨 ThemeProvider render, current theme:', theme.name);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId: theme.id,
        setTheme,
        themeList,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook pour accéder au thème
 * 
 * Usage:
 * const { theme, setTheme, themeId } = useTheme();
 * 
 * // Accéder aux couleurs
 * theme.colors.primary
 * 
 * // Changer de thème
 * setTheme('goldenHour');
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;