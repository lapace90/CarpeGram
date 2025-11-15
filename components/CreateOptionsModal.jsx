import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import React from 'react';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';

const CreateOptionsModal = ({ visible, onClose, onSelectPost, onSelectEvent }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Text style={styles.title}>What do you want to create?</Text>

          <Pressable 
            style={styles.option}
            onPress={() => {
              onClose();
              onSelectPost();
            }}
          >
            <View style={styles.iconContainer}>
              <Icon name="image" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Create Post</Text>
              <Text style={styles.optionSubtitle}>Share your catch</Text>
            </View>
            <Icon name="arrowLeft" size={20} color={theme.colors.textLight} style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>

          <Pressable 
            style={styles.option}
            onPress={() => {
              onClose();
              onSelectEvent();
            }}
          >
            <View style={styles.iconContainer}>
              <Icon name="calendar" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Create Event</Text>
              <Text style={styles.optionSubtitle}>Organize a fishing session</Text>
            </View>
            <Icon name="arrowLeft" size={20} color={theme.colors.textLight} style={{ transform: [{ rotate: '180deg' }] }} />
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
    width: wp(85),
    backgroundColor: 'white',
    borderRadius: theme.radius.xl,
    padding: wp(5),
    gap: hp(2),
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: hp(1),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.aquaLight,
    padding: wp(4),
    borderRadius: theme.radius.lg,
    gap: wp(3),
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  optionSubtitle: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginTop: 2,
  },
});

export default CreateOptionsModal;