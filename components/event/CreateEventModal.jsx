import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Alert, Platform } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEvent } from '../../services/eventService';

const CreateEventModal = ({ visible, onClose, currentUserId, onEventCreated }) => {
  const { theme } = useTheme();
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
    if (selectedDate) setEventDate(selectedDate);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setEventDate(selectedTime);
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
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
            <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              Create Event
            </Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Icon name="delete" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.field}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Event Title *
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.gray + '30',
                  borderRadius: theme.radius.lg,
                  borderColor: theme.colors.gray,
                  color: theme.colors.text
                }]}
                placeholder="e.g., Weekend Fishing Trip"
                placeholderTextColor={theme.colors.textLight}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Description
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { 
                  backgroundColor: theme.colors.gray + '30',
                  borderRadius: theme.radius.lg,
                  borderColor: theme.colors.gray,
                  color: theme.colors.text
                }]}
                placeholder="Describe your event..."
                placeholderTextColor={theme.colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: theme.colors.textLight }]}>
                {description.length}/500
              </Text>
            </View>

            {/* Date */}
            <View style={styles.field}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Date *
              </Text>
              <Pressable 
                style={[styles.dateButton, { 
                  backgroundColor: theme.colors.gray + '30',
                  borderRadius: theme.radius.lg,
                  borderColor: theme.colors.gray
                }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={20} color={theme.colors.primary} />
                <Text style={[styles.dateText, { color: theme.colors.text }]}>
                  {formatDate(eventDate)}
                </Text>
              </Pressable>
            </View>

            {/* Time */}
            <View style={styles.field}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Time *
              </Text>
              <Pressable 
                style={[styles.dateButton, { 
                  backgroundColor: theme.colors.gray + '30',
                  borderRadius: theme.radius.lg,
                  borderColor: theme.colors.gray
                }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Icon name="clock" size={20} color={theme.colors.primary} />
                <Text style={[styles.dateText, { color: theme.colors.text }]}>
                  {formatTime(eventDate)}
                </Text>
              </Pressable>
            </View>

            {/* Max participants */}
            <View style={styles.field}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Max Participants (optional)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.gray + '30',
                  borderRadius: theme.radius.lg,
                  borderColor: theme.colors.gray,
                  color: theme.colors.text
                }]}
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
              { backgroundColor: theme.colors.primary, borderRadius: theme.radius.lg },
              (!title.trim() || loading) && { backgroundColor: theme.colors.gray }
            ]}
            onPress={handleCreate}
            disabled={!title.trim() || loading}
          >
            <Text style={[styles.createButtonText, { fontWeight: theme.fonts.bold }]}>
              {loading ? 'Creating...' : 'Create Event'}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

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
  },
  title: {
    fontSize: hp(2.4),
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
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: hp(1.7),
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: hp(1.4),
    textAlign: 'right',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  dateText: {
    fontSize: hp(1.7),
    textTransform: 'capitalize',
  },
  createButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: hp(1.9),
    color: 'white',
  },
});