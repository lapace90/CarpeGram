import { View, Text, StyleSheet, Modal, ScrollView, Pressable, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import Input from '../Input';
import SmartInput from '../SmartInput';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateEvent } from '../../services/eventService';

const EditEventModal = ({ visible, onClose, event, currentUserId, onUpdate }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [maxParticipants, setMaxParticipants] = useState('');
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (visible && event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setLocation(event.location || '');
      setStartDate(new Date(event.event_date));
      setEndDate(event.end_date ? new Date(event.end_date) : new Date(event.event_date));
      setMaxParticipants(event.max_participants ? event.max_participants.toString() : '');
    }
  }, [visible, event]);

  const formatDateTime = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setLoading(true);

    const updates = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim(),
      event_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      max_participants: maxParticipants.trim() ? parseInt(maxParticipants) : null,
    };

    const result = await updateEvent(event.id, updates);

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Event updated successfully! 🎣');
      onUpdate();
      onClose();
    } else {
      Alert.alert('Error', result.error || 'Failed to update event');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
            <Pressable onPress={onClose} disabled={loading}>
              <Text style={[styles.cancelButton, { color: theme.colors.text }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              Edit Event
            </Text>
            <Pressable onPress={handleSave} disabled={loading}>
              <Text style={[
                styles.saveButton, 
                { color: theme.colors.primary, fontWeight: theme.fonts.semibold },
                loading && styles.saveButtonDisabled
              ]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Title */}
            <View style={styles.section}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                Event Title *
              </Text>
              <Input
                placeholder="e.g., Carp Session at Lake Geneva"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                containerStyles={[styles.input, { backgroundColor: theme.colors.card }]}
              />
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                Location *
              </Text>
              <Input
                icon={<Icon name="location" size={22} strokeWidth={1.6} color={theme.colors.textLight} />}
                placeholder="e.g., Lake Geneva, France"
                value={location}
                onChangeText={setLocation}
                maxLength={200}
                containerStyles={[styles.input, { backgroundColor: theme.colors.card }]}
              />
            </View>

            {/* Start Date & Time */}
            <View style={styles.section}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                Start Date & Time *
              </Text>
              <Pressable 
                style={[styles.dateTimeButton, { 
                  backgroundColor: theme.colors.primary + '10',
                  borderRadius: theme.radius.md,
                  borderColor: theme.colors.primary + '30'
                }]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Icon name="calendar" size={20} color={theme.colors.primary} />
                <Text style={[styles.dateTimeText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                  {formatDateTime(startDate)}
                </Text>
              </Pressable>

              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(Platform.OS === 'ios');
                    if (selectedDate) setStartDate(selectedDate);
                  }}
                />
              )}

              {showStartTimePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowStartTimePicker(Platform.OS === 'ios');
                    if (selectedTime) setStartDate(selectedTime);
                  }}
                />
              )}
            </View>

            {/* End Date & Time */}
            <View style={styles.section}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                End Date & Time *
              </Text>
              <Pressable 
                style={[styles.dateTimeButton, { 
                  backgroundColor: theme.colors.primary + '10',
                  borderRadius: theme.radius.md,
                  borderColor: theme.colors.primary + '30'
                }]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Icon name="calendar" size={20} color={theme.colors.primary} />
                <Text style={[styles.dateTimeText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                  {formatDateTime(endDate)}
                </Text>
              </Pressable>

              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(Platform.OS === 'ios');
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                  minimumDate={startDate}
                />
              )}

              {showEndTimePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowEndTimePicker(Platform.OS === 'ios');
                    if (selectedTime) setEndDate(selectedTime);
                  }}
                />
              )}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                Description (Optional)
              </Text>
              <SmartInput
                placeholder="Tell people about this fishing event... 🐟"
                value={description}
                onChangeText={setDescription}
                currentUserId={currentUserId}
                multiline
                numberOfLines={4}
                maxLength={500}
                style={[styles.descriptionInput, { 
                  backgroundColor: theme.colors.gray,
                  borderRadius: theme.radius.xl,
                  color: theme.colors.text
                }]}
              />
            </View>

            {/* Max Participants */}
            <View style={styles.section}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                Max Participants (Optional)
              </Text>
              <Input
                placeholder="Leave empty for unlimited"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="number-pad"
                maxLength={4}
                containerStyles={[styles.input, { backgroundColor: theme.colors.card }]}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: hp(1.8),
  },
  title: {
    fontSize: hp(2.2),
  },
  saveButton: {
    fontSize: hp(1.8),
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  section: {
    marginBottom: hp(2.5),
  },
  label: {
    fontSize: hp(1.8),
    marginBottom: hp(1),
  },
  input: {},
  descriptionInput: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: hp(1.7),
    minHeight: hp(12),
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderWidth: 1,
  },
  dateTimeText: {
    fontSize: hp(1.7),
  },
});

export default EditEventModal;