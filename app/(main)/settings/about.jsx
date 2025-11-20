import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import React from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useRouter } from 'expo-router';
import Icon from '../../../assets/icons';
import BackButton from '../../../components/BackButton';

const About = () => {
  const router = useRouter();

  const handleOpenLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const legalItems = [
    {
      icon: 'shield',
      label: 'Privacy Policy',
      description: 'How we handle your data',
      action: () => router.push('/settings/privacyPolicy'),
    },
    {
      icon: 'fileText',
      label: 'Terms of Service',
      description: 'Rules and guidelines',
      action: () => router.push('/settings/termsOfService'),
    },
  ];

  const supportItems = [
    {
      icon: 'mail',
      label: 'Contact Support',
      description: 'support@carpegram.com',
      action: () => handleOpenLink('mailto:support@carpegram.com'),
    },
    {
      icon: 'info',
      label: 'Help Center',
      description: 'Get help and support',
      action: () => handleOpenLink('https://carpegram.com/help'),
    },
  ];

  const appInfo = {
    version: '1.0.0',
    buildNumber: '1',
    releaseDate: 'November 2025',
  };

  const renderItem = (item) => (
    <Pressable
      key={item.label}
      style={styles.item}
      onPress={item.action}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={22} color={theme.colors.primary} />
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}
      </View>

      <Icon name="arrowRight" size={20} color={theme.colors.textLight} />
    </Pressable>
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} to="/settings" />
          <Text style={styles.title}>About & Legal</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* App Logo & Name */}
          <View style={styles.appSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🎣</Text>
            </View>
            <Text style={styles.appName}>Carpegram</Text>
            <Text style={styles.appTagline}>Built with 💚 for anglers</Text>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>{appInfo.version}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Build</Text>
                <Text style={styles.infoValue}>{appInfo.buildNumber}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Release Date</Text>
                <Text style={styles.infoValue}>{appInfo.releaseDate}</Text>
              </View>
            </View>
          </View>

          {/* Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            <View style={styles.itemsGroup}>
              {legalItems.map((item, index) => (
                <View key={item.label}>
                  {renderItem(item)}
                  {index < legalItems.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.itemsGroup}>
              {supportItems.map((item, index) => (
                <View key={item.label}>
                  {renderItem(item)}
                  {index < supportItems.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>

          {/* Credits */}
          <View style={styles.creditsSection}>
            <Text style={styles.creditsText}>
              Made by passionate anglers for the fishing community
            </Text>
            <Text style={styles.creditsSubtext}>
              © 2025 Carpegram. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default About;

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
  scrollContent: {
    padding: wp(5),
    paddingBottom: hp(4),
  },
  appSection: {
    alignItems: 'center',
    paddingVertical: hp(3),
    gap: 8,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  appTagline: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(1.5),
  },
  infoBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
  infoValue: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  itemsGroup: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  itemDescription: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray,
    marginLeft: 68, // Align with content
  },
  creditsSection: {
    alignItems: 'center',
    paddingVertical: hp(3),
    gap: 6,
  },
  creditsText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: hp(2),
  },
  creditsSubtext: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
});