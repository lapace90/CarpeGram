import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import React from 'react';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';

const RepostModal = ({ visible, onClose, onRepost }) => {
  const privacyOptions = [
    { 
      value: 'public', 
      label: 'Public', 
      icon: 'globe',
      description: 'Anyone can see this repost'
    },
    { 
      value: 'followers', 
      label: 'Followers', 
      icon: 'user',
      description: 'Only your followers can see'
    },
    { 
      value: 'close_friends', 
      label: 'Close Friends', 
      icon: 'heart',
      description: 'Only close friends can see'
    },
  ];

  const handleRepost = (privacy) => {
    onRepost(privacy);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Repost to...</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="delete" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.options}>
            {privacyOptions.map((option) => (
              <Pressable
                key={option.value}
                style={styles.optionButton}
                onPress={() => handleRepost(option.value)}
              >
                <View style={styles.optionIcon}>
                  <Icon name={option.icon} size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RepostModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: wp(85),
    backgroundColor: 'white',
    borderRadius: theme.radius.xxl,
    padding: hp(2.5),
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  options: {
    gap: hp(1),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.gray + '15',
    gap: wp(3),
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: 2,
  },
});