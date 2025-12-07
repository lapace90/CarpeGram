import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import SmartInput from '../../components/SmartInput';
import Button from '../../components/Button';
import Icon from '../../assets/icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEvent } from '../../services/eventService';
import LocationPicker from '../../components/map/LocationPicker';

const CreateEvent = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000));
  const [maxParticipants, setMaxParticipants] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const formatDateTime = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    if (startDate < new Date()) {
      Alert.alert('Error', 'Start date must be in the future');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setLoading(true);

    const maxPart = maxParticipants.trim() ? parseInt(maxParticipants) : null;

    const result = await createEvent(
      user?.id,
      title.trim(),
      description.trim() || null,
      startDate.toISOString(),
      endDate.toISOString(),
      location.trim(),
      maxPart,
      coordinates?.latitude || null,
      coordinates?.longitude || null,
      null
    );

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', result.msg || 'Failed to create event');
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onStartTimeChange = (event, selectedDate) => {
    setShowStartTimePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const onEndTimeChange = (event, selectedDate) => {
    setShowEndTimePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleLocationSelect = (locationData) => {
    setCoordinates(locationData);
    if (locationData.name) setLocation(locationData.name);
  };

  return (
    <ScreenWrapper bg={theme.colors.card}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Icon name="arrowLeft" size={26} color={theme.colors.text} />
            </Pressable>
            <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              Create Event
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Event Title *
              </Text>
              <Input
                placeholder="e.g., Weekend Fishing Trip"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Description
              </Text>
              <SmartInput
                placeholder="Describe your event..."
                value={description}
                onChangeText={setDescription}
                currentUserId={user?.id}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Location *
              </Text>
              <Input
                placeholder="e.g., Lake Geneva, France"
                value={location}
                onChangeText={setLocation}
                icon={<Icon name="location" size={24} strokeWidth={1.6} color={theme.colors.textLight} />}
              />
              <Pressable
                style={[styles.mapButton, { borderColor: theme.colors.primary, borderRadius: theme.radius.xl }]}
                onPress={() => setShowLocationPicker(true)}
              >
                <Icon name="maps" size={20} color={theme.colors.primary} />
                <Text style={[styles.mapButtonText, { color: theme.colors.primary, fontWeight: theme.fonts.medium }]}>
                  {coordinates ? 'Change location on map' : 'Select on map'}
                </Text>
                {coordinates && <Icon name="check" size={18} color={theme.colors.primary} />}
              </Pressable>
              {coordinates && (
                <Text style={[styles.coordsInfo, { color: theme.colors.textLight }]}>
                  📍 {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                </Text>
              )}
            </View>

            {/* Start Date/Time */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Start *
              </Text>
              <Pressable
                style={[styles.dateButton, { borderColor: theme.colors.text, borderRadius: theme.radius.xxl, backgroundColor: theme.colors.card }]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Icon name="calendar" size={22} color={theme.colors.primary} />
                <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                  {formatDateTime(startDate)}
                </Text>
              </Pressable>
            </View>

            {/* End Date/Time */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                End *
              </Text>
              <Pressable
                style={[styles.dateButton, { borderColor: theme.colors.text, borderRadius: theme.radius.xxl, backgroundColor: theme.colors.card }]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Icon name="calendar" size={22} color={theme.colors.primary} />
                <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                  {formatDateTime(endDate)}
                </Text>
              </Pressable>
            </View>

            {/* Max Participants */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Max Participants (optional)
              </Text>
              <Input
                placeholder="Leave empty for unlimited"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="numeric"
              />
            </View>

            {/* Submit */}
            <Button
              title="Create Event"
              onPress={handleCreate}
              loading={loading}
              buttonStyle={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartTimeChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateChange}
          minimumDate={startDate}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndTimeChange}
        />
      )}

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleLocationSelect}
        initialLocation={coordinates}
        title="Select Event Location"
      />
    </ScreenWrapper>
  );
};

export default CreateEvent;

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
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: hp(2.5),
  },
  form: {
    padding: wp(5),
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: hp(1.8),
  },
  textArea: {
    height: hp(12),
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderWidth: 0.4,
  },
  dateButtonText: {
    fontSize: hp(1.8),
  },
  submitButton: {
    marginTop: 10,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    marginTop: hp(1),
    paddingVertical: hp(1.2),
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  mapButtonText: {
    fontSize: hp(1.6),
  },
  coordsInfo: {
    fontSize: hp(1.4),
    textAlign: 'center',
    marginTop: hp(0.8),
  },
});