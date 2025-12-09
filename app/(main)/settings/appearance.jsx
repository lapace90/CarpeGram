import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { hp, wp } from '../../../helpers/common';
import Icon from '../../../assets/icons';

const AppearanceSettings = () => {
  const router = useRouter();
  const { theme, themeId, setTheme, themeList } = useTheme();

  const handleSelectTheme = (newThemeId) => {
    console.log('🎨 User selected theme:', newThemeId);
    setTheme(newThemeId);
  };

  // Mini aperçu d'un thème
  const renderThemePreview = (previewTheme) => {
    const c = previewTheme.colors;
    
    return (
      <View style={styles.preview}>
        {/* Header bar */}
        <View style={[styles.previewHeader, { backgroundColor: c.primary }]} />
        
        {/* Content area */}
        <View style={[styles.previewContent, { backgroundColor: c.background }]}>
          {/* Mini card */}
          <View style={[styles.previewCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.previewAvatar, { backgroundColor: c.primaryLight }]} />
            <View style={styles.previewLines}>
              <View style={[styles.previewLine, { backgroundColor: c.text, width: '60%' }]} />
              <View style={[styles.previewLine, { backgroundColor: c.textLight, width: '40%' }]} />
            </View>
          </View>
          
          {/* Color dots */}
          <View style={styles.previewDots}>
            <View style={[styles.previewDot, { backgroundColor: c.primary }]} />
            <View style={[styles.previewDot, { backgroundColor: c.accent }]} />
            <View style={[styles.previewDot, { backgroundColor: c.rose }]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
          <BackButton router={router} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Appearance</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Title */}
          <Text style={[styles.sectionTitle, { color: theme.colors.textLight }]}>
            CHOOSE YOUR THEME
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textLight }]}>
            Pick a color palette that matches your fishing style
          </Text>

          {/* Theme Cards */}
          <View style={styles.themesGrid}>
            {themeList.map((themeOption) => {
              const isSelected = themeId === themeOption.id;
              
              return (
                <Pressable
                  key={themeOption.id}
                  style={[
                    styles.themeCard,
                    { 
                      backgroundColor: theme.colors.card,
                      borderColor: isSelected ? themeOption.colors.primary : theme.colors.gray,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleSelectTheme(themeOption.id)}
                >
                  {/* Selected badge */}
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: themeOption.colors.primary }]}>
                      <Icon name="check" size={14} color="white" strokeWidth={3} />
                    </View>
                  )}

                  {/* Preview */}
                  {renderThemePreview(themeOption)}

                  {/* Theme Info */}
                  <View style={styles.themeInfo}>
                    <View style={styles.themeNameRow}>
                      <Text style={styles.themeEmoji}>{themeOption.emoji}</Text>
                      <Text style={[styles.themeName, { color: theme.colors.text }]}>
                        {themeOption.name}
                      </Text>
                    </View>
                    <Text style={[styles.themeDescription, { color: theme.colors.textLight }]}>
                      {themeOption.description}
                    </Text>
                    
                    {/* Color palette */}
                    <View style={styles.palette}>
                      <View style={[styles.paletteColor, { backgroundColor: themeOption.colors.primary }]} />
                      <View style={[styles.paletteColor, { backgroundColor: themeOption.colors.primaryLight }]} />
                      <View style={[styles.paletteColor, { backgroundColor: themeOption.colors.accent }]} />
                      <View style={[styles.paletteColor, { backgroundColor: themeOption.colors.rose }]} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Info Note */}
          <View style={[styles.infoBox, { backgroundColor: theme.colors.backgroundDark || theme.colors.darkLight }]}>
            <Icon name="info" size={18} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.textLight }]}>
              Theme changes are applied instantly and saved automatically.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default AppearanceSettings;

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
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: wp(5),
    paddingBottom: hp(4),
  },
  sectionTitle: {
    fontSize: hp(1.6),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(0.5),
  },
  sectionDescription: {
    fontSize: hp(1.6),
    marginBottom: hp(3),
  },
  themesGrid: {
    gap: hp(2),
  },
  themeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  preview: {
    height: 100,
    overflow: 'hidden',
  },
  previewHeader: {
    height: 28,
  },
  previewContent: {
    flex: 1,
    padding: 10,
    gap: 8,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  previewAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  previewLines: {
    flex: 1,
    gap: 4,
  },
  previewLine: {
    height: 5,
    borderRadius: 2.5,
  },
  previewDots: {
    flexDirection: 'row',
    gap: 6,
  },
  previewDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themeInfo: {
    padding: 16,
    gap: 6,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeEmoji: {
    fontSize: hp(2.2),
  },
  themeName: {
    fontSize: hp(2),
    fontWeight: '600',
  },
  themeDescription: {
    fontSize: hp(1.6),
  },
  palette: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  paletteColor: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: hp(3),
  },
  infoText: {
    flex: 1,
    fontSize: hp(1.5),
    lineHeight: hp(2.1),
  },
});