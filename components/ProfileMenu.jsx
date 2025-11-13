import { View, Text, StyleSheet, Modal, Pressable, Alert, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import Icon from '../assets/icons'
import { supabase } from '../lib/supabase'
import { useRouter } from 'expo-router'

const ProfileMenu = ({ visible, onClose, onLogout }) => {
  const router = useRouter();

  const handleEditProfile = () => {
    onClose();
    router.push('/editProfile');
  };

  const handlePrivacySettings = () => {
    onClose();
    router.push('/privacySettings');
  };

  const handleBlockedUsers = () => {
    onClose();
    router.push('/blockedUsers');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            onClose();
            router.replace('/welcome');  // ← AJOUTE CETTE LIGNE
            if (onLogout) onLogout();
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.bottomSheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>Settings</Text>

          {/* Options */}
          <ScrollView style={styles.options}>
            {/* Edit Profile */}
            <Pressable
              style={styles.option}
              onPress={handleEditProfile}
            >
              <Icon name="edit" size={22} color={theme.colors.text} />
              <Text style={styles.optionText}>Edit Profile</Text>
            </Pressable>

            {/* Privacy Settings */}
            <Pressable
              style={styles.option}
              onPress={handlePrivacySettings}
            >
              <Icon name="lock" size={22} color={theme.colors.text} />
              <Text style={styles.optionText}>Privacy Settings</Text>
            </Pressable>

            {/* Blocked Users */}
            <Pressable
              style={styles.option}
              onPress={handleBlockedUsers}
            >
              <Icon name="user" size={22} color={theme.colors.text} />
              <Text style={styles.optionText}>Blocked Users</Text>
            </Pressable>

            {/* Logout */}
            <Pressable
              style={styles.option}
              onPress={handleLogout}
            >
              <Icon name="logout" size={22} color={theme.colors.rose} />
              <Text style={[styles.optionText, styles.dangerText]}>Logout</Text>
            </Pressable>
          </ScrollView>

          {/* Cancel */}
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProfileMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.gray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  options: {
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  optionText: {
    fontSize: hp(2),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  dangerText: {
    color: theme.colors.rose,
  },
  cancelButton: {
    marginTop: 15,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
});