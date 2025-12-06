import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';
import { useRouter } from 'expo-router';
import { useLogout } from '../hooks/useLogout';

const ProfileMenu = ({ visible, onClose, onUpdate }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { logout, loading } = useLogout();

  const handleEditProfile = () => {
    onClose();
    router.push('/editProfile');
  };

  const handleSettings = () => {
    onClose();
    router.push('/settings');
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.container, { borderRadius: theme.radius.xl }]}>
          <Pressable style={styles.option} onPress={handleEditProfile}>
            <Icon name="edit" size={22} color={theme.colors.text} />
            <Text style={[styles.optionText, { fontWeight: theme.fonts.medium, color: theme.colors.text }]}>
              Edit Profile
            </Text>
          </Pressable>

          <View style={[styles.separator, { backgroundColor: theme.colors.gray }]} />

          <Pressable style={styles.option} onPress={handleSettings}>
            <Icon name="alertCircle" size={22} color={theme.colors.text} />
            <Text style={[styles.optionText, { fontWeight: theme.fonts.medium, color: theme.colors.text }]}>
              Settings
            </Text>
          </Pressable>

          <View style={[styles.separator, { backgroundColor: theme.colors.gray }]} />

          <Pressable style={styles.option} onPress={handleLogout} disabled={loading}>
            <Icon name="logout" size={22} color={theme.colors.rose} />
            <Text style={[styles.optionText, { fontWeight: theme.fonts.medium, color: theme.colors.rose }]}>
              {loading ? 'Logging out...' : 'Logout'}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: wp(70),
    backgroundColor: 'white',
    padding: wp(3),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  optionText: {
    fontSize: hp(1.8),
  },
  separator: {
    height: 1,
    marginVertical: hp(0.5),
  },
});

export default ProfileMenu;