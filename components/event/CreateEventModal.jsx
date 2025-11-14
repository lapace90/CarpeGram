import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Alert, Platform } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEvent } from '../../services/eventService';

const CreateEventModal = ({ visible, onClose, currentUserId, onEventCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (eventDate < new Date()) {
      Alert.alert('Error', 'Event date must be in the future');
      return;
    }

    setLoading(true);

    const maxPart = maxParticipants.trim() ? parseInt(maxParticipants) : null;

    const result = await createEvent(
      currentUserId,
      title.trim(),
      description.trim() || null,
      eventDate.toISOString(),
      maxPart
    );

    setLoading(false);

    if (result.success) {
      onEventCreated?.(result.data);
      handleClose();
    } else {
      Alert.alert('Error', result.error || 'Failed to create event');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setEventDate(new Date());
    setMaxParticipants('');
    onClose();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setEventDate(selectedTime);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Event</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Icon name="delete" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View style={styles.field}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Fishing trip at Lake Madine"
                placeholderTextColor={theme.colors.textLight}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell people what this event is about..."
                placeholderTextColor={theme.colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>

            {/* Date */}
            <View style={styles.field}>
              <Text style={styles.label}>Date *</Text>
              <Pressable 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={20} color={theme.colors.primary} />
                <Text style={styles.dateText}>{formatDate(eventDate)}</Text>
              </Pressable>
            </View>

            {/* Time */}
            <View style={styles.field}>
              <Text style={styles.label}>Time *</Text>
              <Pressable 
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Icon name="clock" size={20} color={theme.colors.primary} />
                <Text style={styles.dateText}>{formatTime(eventDate)}</Text>
              </Pressable>
            </View>

            {/* Max participants */}
            <View style={styles.field}>
              <Text style={styles.label}>Max Participants (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Leave empty for unlimited"
                placeholderTextColor={theme.colors.textLight}
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </ScrollView>

          {/* Create Button */}
          <Pressable
            style={[
              styles.createButton,
              (!title.trim() || loading) && styles.createButtonDisabled
            ]}
            onPress={handleCreate}
            disabled={!title.trim() || loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Event'}
            </Text>
          </Pressable>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={eventDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CreateEventModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.gray + '30',
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: hp(1.7),
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.gray + '30',
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  dateText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: theme.colors.gray,
  },
  createButtonText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
});