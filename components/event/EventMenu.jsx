import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import React from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import { deleteEvent } from '../../services/eventService';
import { Alert } from 'react-native';

const EventMenu = ({ visible, onClose, eventId, onAction }) => {
  const handleDelete = async () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteEvent(eventId);
            if (result.success) {
              Alert.alert('Success', 'Event deleted successfully');
              onAction('delete');
              onClose();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    onAction('edit');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Pressable style={styles.option} onPress={handleEdit}>
            <Icon name="edit" size={22} color={theme.colors.text} />
            <Text style={styles.optionText}>Edit Event</Text>
          </Pressable>

          <View style={styles.separator} />

          <Pressable style={styles.option} onPress={handleDelete}>
            <Icon name="delete" size={22} color={theme.colors.rose} />
            <Text style={[styles.optionText, { color: theme.colors.rose }]}>
              Delete Event
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
    borderRadius: theme.radius.xl,
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
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray,
    marginVertical: hp(0.5),
  },
});

export default EventMenu;