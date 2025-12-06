import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';

const CreateOptionsModal = ({ visible, onClose, onSelectPost, onSelectEvent }) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderRadius: theme.radius.xl }]}>
          <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            What do you want to create?
          </Text>

          <Pressable 
            style={[
              styles.option, 
              { 
                backgroundColor: theme.colors.background,
                borderRadius: theme.radius.lg,
                borderColor: theme.colors.primary + '20',
              }
            ]}
            onPress={() => {
              onClose();
              onSelectPost();
            }}
          >
            <View style={[
              styles.iconContainer, 
              { borderRadius: theme.radius.md, backgroundColor: theme.colors.primary + '15' }
            ]}>
              <Icon name="image" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                Create Post
              </Text>
              <Text style={[styles.optionSubtitle, { color: theme.colors.textLight }]}>
                Share your catch
              </Text>
            </View>
            <Icon name="arrowLeft" size={20} color={theme.colors.textLight} style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>

          <Pressable 
            style={[
              styles.option, 
              { 
                backgroundColor: theme.colors.background,
                borderRadius: theme.radius.lg,
                borderColor: theme.colors.primary + '20',
              }
            ]}
            onPress={() => {
              onClose();
              onSelectEvent();
            }}
          >
            <View style={[
              styles.iconContainer, 
              { borderRadius: theme.radius.md, backgroundColor: theme.colors.primary + '15' }
            ]}>
              <Icon name="calendar" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                Create Event
              </Text>
              <Text style={[styles.optionSubtitle, { color: theme.colors.textLight }]}>
                Organize a fishing session
              </Text>
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
    padding: wp(5),
    gap: hp(2),
  },
  title: {
    fontSize: hp(2.2),
    textAlign: 'center',
    marginBottom: hp(1),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    gap: wp(3),
    borderWidth: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: hp(1.9),
  },
  optionSubtitle: {
    fontSize: hp(1.5),
    marginTop: 2,
  },
});

export default CreateOptionsModal;