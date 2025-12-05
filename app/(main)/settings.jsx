import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import React from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { useRouter } from 'expo-router';
import Icon from '../../assets/icons';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const router = useRouter();
  const { user } = useAuth();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'user',
          label: 'Edit Profile',
          route: '/editProfile',
          description: 'Update your profile information',
        },
        {
          icon: 'mail',
          label: 'Account Settings',
          route: '/settings/account',
          description: 'Email, password, and account management',
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: 'lock',
          label: 'Privacy',
          route: '/settings/privacy',
          description: 'Control who sees your content',
        },
        {
          icon: 'location',
          label: 'Location Sharing',
          route: '/settings/location',
          description: 'Share your position on the map',
        },
        {
          icon: 'alertCircle',
          label: 'Blocked Users',
          route: '/settings/blocked',
          description: 'Manage blocked accounts',
        },
        {
          icon: 'heart',
          label: 'Close Friends',
          route: '/settings/closeFriends',
          description: 'Manage your close friends list',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'bell',
          label: 'Notifications',
          route: '/settings/notifications',
          description: 'Manage notification preferences',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'info',
          label: 'About & Legal',
          route: '/settings/about',
          description: 'Privacy policy, terms, and app info',
        },
      ],
    },
  ];

  const handleNavigate = (route) => {
    router.push(route);
  };

  const renderSettingItem = (item) => (
    <Pressable
      key={item.label}
      style={styles.settingItem}
      onPress={() => handleNavigate(item.route)}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={22} color={theme.colors.primary} />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{item.label}</Text>
        {item.description && (
          <Text style={styles.settingDescription}>{item.description}</Text>
        )}
      </View>

      <Icon name="arrowRight" size={20} color={theme.colors.textLight} />
    </Pressable>
  );

  const renderSection = (section) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, index) => (
          <View key={item.label}>
            {renderSettingItem(item)}
            {index < section.items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Settings List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {settingsSections.map(renderSection)}

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Carpegram v1.0.0</Text>
            <Text style={styles.versionSubtext}>Built with 💚 for anglers</Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Settings;

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
    paddingVertical: hp(2),
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
    paddingHorizontal: wp(5),
    marginBottom: hp(1),
  },
  sectionContent: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(5),
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
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray,
    marginLeft: wp(5) + 52, // Align with content
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: hp(3),
    gap: 4,
  },
  versionText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  versionSubtext: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
});