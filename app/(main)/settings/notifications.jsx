import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import Icon from '../../../assets/icons';
import BackButton from '../../../components/common/BackButton';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const NotificationsSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Notification preferences
  const [pushEnabled, setPushEnabled] = useState(false);
  const [likesNotif, setLikesNotif] = useState(true);
  const [commentsNotif, setCommentsNotif] = useState(true);
  const [followsNotif, setFollowsNotif] = useState(true);
  const [repostsNotif, setRepostsNotif] = useState(true);
  const [mentionsNotif, setMentionsNotif] = useState(true);
  const [messagesNotif, setMessagesNotif] = useState(true);
  const [eventsNotif, setEventsNotif] = useState(true);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.notification_preferences) {
        const prefs = data.notification_preferences;
        setPushEnabled(prefs.push_enabled || false);
        setLikesNotif(prefs.likes ?? true);
        setCommentsNotif(prefs.comments ?? true);
        setFollowsNotif(prefs.follows ?? true);
        setRepostsNotif(prefs.reposts ?? true);
        setMentionsNotif(prefs.mentions ?? true);
        setMessagesNotif(prefs.messages ?? true);
        setEventsNotif(prefs.events ?? true);
      }
    } catch (error) {
      console.error('Load notification settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationPreference = async (key, value) => {
    setSaving(true);
    try {
      // Get current preferences
      const { data: currentData } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      const currentPrefs = currentData?.notification_preferences || {};

      // Update with new value
      const newPrefs = {
        ...currentPrefs,
        [key]: value,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newPrefs })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Update notification preference error:', error);
      Alert.alert('Error', 'Failed to update notification settings');
      // Revert the change
      loadNotificationSettings();
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async (value) => {
    setPushEnabled(value);
    
    if (value) {
      Alert.alert(
        'Push Notifications',
        'Push notifications will be available in a future update. For now, you can manage in-app notification preferences.',
      );
      setPushEnabled(false);
      return;
    }
    
    await updateNotificationPreference('push_enabled', value);
  };

  const renderNotificationToggle = (icon, label, description, value, setValue, key) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleContent}>
        <View style={styles.toggleHeader}>
          <Icon name={icon} size={20} color={theme.colors.text} />
          <Text style={styles.toggleLabel}>{label}</Text>
        </View>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          setValue(val);
          updateNotificationPreference(key, val);
        }}
        trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
        thumbColor="white"
        disabled={saving}
      />
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton router={router} to="/settings" />
            <Text style={styles.title}>Notifications</Text>
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
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} to="/settings" />
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Push Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Push Notifications</Text>
            
            <View style={styles.toggleItem}>
              <View style={styles.toggleContent}>
                <View style={styles.toggleHeader}>
                  <Icon name="bell" size={20} color={theme.colors.text} />
                  <Text style={styles.toggleLabel}>Enable Push Notifications</Text>
                </View>
                <Text style={styles.toggleDescription}>
                  Receive notifications even when the app is closed
                </Text>
                <Text style={styles.comingSoonBadge}>Coming Soon</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={handlePushToggle}
                trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
                thumbColor="white"
                disabled={true}
              />
            </View>
          </View>

          {/* Activity Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.togglesGroup}>
              {renderNotificationToggle(
                'heart',
                'Likes',
                'When someone likes your post',
                likesNotif,
                setLikesNotif,
                'likes'
              )}
              {renderNotificationToggle(
                'message',
                'Comments',
                'When someone comments on your post',
                commentsNotif,
                setCommentsNotif,
                'comments'
              )}
              {renderNotificationToggle(
                'repeat',
                'Reposts',
                'When someone reposts your content',
                repostsNotif,
                setRepostsNotif,
                'reposts'
              )}
              {renderNotificationToggle(
                'atSign',
                'Mentions',
                'When someone mentions you',
                mentionsNotif,
                setMentionsNotif,
                'mentions'
              )}
            </View>
          </View>

          {/* Social Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social</Text>
            <View style={styles.togglesGroup}>
              {renderNotificationToggle(
                'addUser',
                'New Followers',
                'When someone starts following you',
                followsNotif,
                setFollowsNotif,
                'follows'
              )}
              {renderNotificationToggle(
                'mail',
                'Direct Messages',
                'When you receive a new message',
                messagesNotif,
                setMessagesNotif,
                'messages'
              )}
            </View>
          </View>

          {/* Events Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Events</Text>
            <View style={styles.togglesGroup}>
              {renderNotificationToggle(
                'calendar',
                'Events',
                'Reminders and updates for fishing events',
                eventsNotif,
                setEventsNotif,
                'events'
              )}
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Icon name="info" size={18} color={theme.colors.textLight} />
            <Text style={styles.infoText}>
              These preferences apply to in-app notifications. Push notifications will be added in a future update.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default NotificationsSettings;

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
    marginBottom: hp(1.5),
  },
  togglesGroup: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
    gap: 12,
  },
  toggleContent: {
    flex: 1,
    gap: 4,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  toggleDescription: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2),
  },
  comingSoonBadge: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    backgroundColor: theme.colors.gray + '40',
    borderRadius: theme.radius.md,
    marginTop: hp(2),
  },
  infoText: {
    flex: 1,
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2),
  },
});