import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useRouter } from 'expo-router';
import Icon from '../../../assets/icons';
import BackButton from '../../../components/common/BackButton';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const PrivacySettings = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Privacy settings
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [whoCanMessage, setWhoCanMessage] = useState('everyone'); // everyone, followers, none
  const [whoCanSeeMyPosts, setWhoCanSeeMyPosts] = useState('everyone'); // everyone, followers
  const [showFullName, setShowFullName] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_private, who_can_message, who_can_see_posts, show_full_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setIsPrivateAccount(data.is_private || false);
        setWhoCanMessage(data.who_can_message || 'everyone');
        setWhoCanSeeMyPosts(data.who_can_see_posts || 'everyone');
        setShowFullName(data.show_full_name || false);
      }
    } catch (error) {
      console.error('Load privacy settings error:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySetting = async (field, value) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Update privacy setting error:', error);
      Alert.alert('Error', 'Failed to update setting');
      // Revert the change
      loadPrivacySettings();
    } finally {
      setSaving(false);
    }
  };

  const handlePrivateAccountToggle = async (value) => {
    setIsPrivateAccount(value);
    await updatePrivacySetting('is_private', value);

    if (value) {
      Alert.alert(
        'Private Account Enabled',
        'Only your followers will be able to see your posts. New followers will need your approval.',
      );
    }
  };

  const handleShowFullNameToggle = async (value) => {
    setShowFullName(value);
    await updatePrivacySetting('show_full_name', value);
  };

  const handleWhoCanMessageChange = async (value) => {
    setWhoCanMessage(value);
    await updatePrivacySetting('who_can_message', value);
  };

  const handleWhoCanSeePostsChange = async (value) => {
    setWhoCanSeeMyPosts(value);
    await updatePrivacySetting('who_can_see_posts', value);
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton router={router} to="/settings" />
            <Text style={styles.title}>Privacy</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} to="/settings" />
          <Text style={styles.title}>Privacy</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Account Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Privacy</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingHeader}>
                  <Icon name="lock" size={20} color={theme.colors.text} />
                  <Text style={styles.settingLabel}>Private Account</Text>
                </View>
                <Text style={styles.settingDescription}>
                  When your account is private, only followers you approve can see your posts and profile
                </Text>
              </View>
              <Switch
                value={isPrivateAccount}
                onValueChange={handlePrivateAccountToggle}
                trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
                thumbColor="white"
                disabled={saving}
              />
            </View>
          </View>

          {/* Profile Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Visibility</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingHeader}>
                  <Icon name="user" size={20} color={theme.colors.text} />
                  <Text style={styles.settingLabel}>Show Full Name</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Display your first and last name on your profile
                </Text>
              </View>
              <Switch
                value={showFullName}
                onValueChange={handleShowFullNameToggle}
                trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
                thumbColor="white"
                disabled={saving}
              />
            </View>
          </View>

          {/* Posts Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posts Visibility</Text>
            <Text style={styles.sectionSubtitle}>
              Control who can see your posts
            </Text>

            <View style={styles.optionsGroup}>
              <Pressable
                style={[
                  styles.option,
                  whoCanSeeMyPosts === 'everyone' && styles.optionSelected,
                ]}
                onPress={() => handleWhoCanSeePostsChange('everyone')}
                disabled={saving || isPrivateAccount}
              >
                <Icon
                  name="globe"
                  size={20}
                  color={
                    whoCanSeeMyPosts === 'everyone' || isPrivateAccount
                      ? theme.colors.primary
                      : theme.colors.textLight
                  }
                />
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      whoCanSeeMyPosts === 'everyone' && styles.optionLabelSelected,
                    ]}
                  >
                    Everyone
                  </Text>
                  <Text style={styles.optionDescription}>Anyone can see your posts</Text>
                </View>
                {whoCanSeeMyPosts === 'everyone' && !isPrivateAccount && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.option,
                  (whoCanSeeMyPosts === 'followers' || isPrivateAccount) && styles.optionSelected,
                ]}
                onPress={() => handleWhoCanSeePostsChange('followers')}
                disabled={saving || isPrivateAccount}
              >
                <Icon
                  name="users"
                  size={20}
                  color={
                    whoCanSeeMyPosts === 'followers' || isPrivateAccount
                      ? theme.colors.primary
                      : theme.colors.textLight
                  }
                />
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      (whoCanSeeMyPosts === 'followers' || isPrivateAccount) &&
                      styles.optionLabelSelected,
                    ]}
                  >
                    Followers Only
                  </Text>
                  <Text style={styles.optionDescription}>
                    Only your followers can see your posts
                  </Text>
                </View>
                {(whoCanSeeMyPosts === 'followers' || isPrivateAccount) && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </Pressable>
            </View>

            {isPrivateAccount && (
              <Text style={styles.infoText}>
                ℹ️ Posts visibility is automatically set to "Followers Only" for private accounts
              </Text>
            )}
          </View>

          {/* Messages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Messages</Text>
            <Text style={styles.sectionSubtitle}>
              Control who can send you messages
            </Text>

            <View style={styles.optionsGroup}>
              <Pressable
                style={[
                  styles.option,
                  whoCanMessage === 'everyone' && styles.optionSelected,
                ]}
                onPress={() => handleWhoCanMessageChange('everyone')}
                disabled={saving}
              >
                <Icon
                  name="mail"
                  size={20}
                  color={
                    whoCanMessage === 'everyone' ? theme.colors.primary : theme.colors.textLight
                  }
                />
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      whoCanMessage === 'everyone' && styles.optionLabelSelected,
                    ]}
                  >
                    Everyone
                  </Text>
                  <Text style={styles.optionDescription}>Anyone can message you</Text>
                </View>
                {whoCanMessage === 'everyone' && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.option,
                  whoCanMessage === 'followers' && styles.optionSelected,
                ]}
                onPress={() => handleWhoCanMessageChange('followers')}
                disabled={saving}
              >
                <Icon
                  name="users"
                  size={20}
                  color={
                    whoCanMessage === 'followers' ? theme.colors.primary : theme.colors.textLight
                  }
                />
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      whoCanMessage === 'followers' && styles.optionLabelSelected,
                    ]}
                  >
                    Followers Only
                  </Text>
                  <Text style={styles.optionDescription}>
                    Only people you follow can message you
                  </Text>
                </View>
                {whoCanMessage === 'followers' && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </Pressable>

              <Pressable
                style={[styles.option, whoCanMessage === 'none' && styles.optionSelected]}
                onPress={() => handleWhoCanMessageChange('none')}
                disabled={saving}
              >
                <Icon
                  name="close"
                  size={20}
                  color={whoCanMessage === 'none' ? theme.colors.primary : theme.colors.textLight}
                />
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      whoCanMessage === 'none' && styles.optionLabelSelected,
                    ]}
                  >
                    No One
                  </Text>
                  <Text style={styles.optionDescription}>Disable direct messages</Text>
                </View>
                {whoCanMessage === 'none' && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default PrivacySettings;

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
  scrollContent: {
    padding: wp(5),
    paddingBottom: hp(4),
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
    marginBottom: hp(1),
  },
  sectionSubtitle: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginBottom: hp(1.5),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    gap: 12,
  },
  settingContent: {
    flex: 1,
    gap: 6,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2),
  },
  optionsGroup: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    gap: 12,
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.primary + '08',
  },
  optionContent: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  infoText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    fontStyle: 'italic',
    marginTop: hp(1),
    paddingHorizontal: 8,
  },
});