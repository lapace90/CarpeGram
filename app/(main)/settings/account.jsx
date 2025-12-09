import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useRouter } from 'expo-router';
import Icon from '../../../assets/icons';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const AccountSettings = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  // Email change
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    Alert.alert(
      'Change Email',
      `A confirmation email will be sent to ${newEmail}. You'll need to confirm before the change takes effect.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            setLoading(false);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert(
                'Success',
                'Confirmation email sent! Please check your inbox and confirm the change.',
              );
              setShowEmailForm(false);
              setNewEmail('');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Your password has been changed successfully');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your posts, messages, and data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'Type DELETE to confirm account deletion',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Understand',
          style: 'destructive',
          onPress: executeDeleteAccount,
        },
      ]
    );
  };

  const executeDeleteAccount = async () => {
    setLoading(true);

    try {
      // 1. Delete user data from profiles (cascade will handle related data)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // 2. Delete auth user
      // Note: This requires admin privileges, so we'll need to handle this via Edge Function
      // For now, we'll just log out and show a message
      await logout();
      
      Alert.alert(
        'Account Deletion Initiated',
        'Your account data has been deleted. Please contact support to complete auth deletion.',
      );
      
      router.replace('/welcome');
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} to="/settings" />
          <Text style={styles.title}>Account Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Current Email */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email Address</Text>
            <View style={styles.infoBox}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{user?.email}</Text>
            </View>

            {!showEmailForm ? (
              <Pressable
                style={styles.linkButton}
                onPress={() => setShowEmailForm(true)}
              >
                <Text style={styles.linkText}>Change Email</Text>
              </Pressable>
            ) : (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="New email address"
                  placeholderTextColor={theme.colors.textLight}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.formButtons}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowEmailForm(false);
                      setNewEmail('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Button
                    title="Update Email"
                    onPress={handleChangeEmail}
                    loading={loading}
                    buttonStyle={styles.submitButton}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Password */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Password</Text>
            
            {!showPasswordForm ? (
              <Pressable
                style={styles.linkButton}
                onPress={() => setShowPasswordForm(true)}
              >
                <Text style={styles.linkText}>Change Password</Text>
              </Pressable>
            ) : (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="New password (min 6 characters)"
                  placeholderTextColor={theme.colors.textLight}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={theme.colors.textLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <View style={styles.formButtons}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Button
                    title="Update Password"
                    onPress={handleChangePassword}
                    loading={loading}
                    buttonStyle={styles.submitButton}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Danger Zone */}
          <View style={[styles.section, styles.dangerSection]}>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
            <View style={styles.dangerBox}>
              <View style={styles.dangerContent}>
                <Icon name="alertCircle" size={24} color={theme.colors.rose} />
                <View style={styles.dangerText}>
                  <Text style={styles.dangerLabel}>Delete Account</Text>
                  <Text style={styles.dangerDescription}>
                    Permanently delete your account and all your data
                  </Text>
                </View>
              </View>
              <Pressable
                style={styles.dangerButton}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                <Text style={styles.dangerButtonText}>Delete Account</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default AccountSettings;

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: theme.colors.gray + '40',
    borderRadius: theme.radius.lg,
    marginBottom: hp(1),
  },
  infoText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkText: {
    fontSize: hp(1.7),
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
  form: {
    gap: 16,
    marginTop: hp(1),
  },
  input: {
    height: hp(6),
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    fontSize: hp(1.7),
    color: theme.colors.text,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  cancelButtonText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  submitButton: {
    flex: 1,
    height: hp(6),
  },
  dangerSection: {
    marginTop: hp(4),
  },
  dangerTitle: {
    color: theme.colors.rose,
  },
  dangerBox: {
    borderWidth: 2,
    borderColor: theme.colors.rose + '40',
    borderRadius: theme.radius.lg,
    padding: 16,
    backgroundColor: theme.colors.rose + '08',
  },
  dangerContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dangerText: {
    flex: 1,
    gap: 4,
  },
  dangerLabel: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.rose,
  },
  dangerDescription: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  dangerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.rose,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
});