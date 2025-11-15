import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import SmartInput from '../../components/SmartInput'; // ← AJOUTE
import Button from '../../components/Button';
import Icon from '../../assets/icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEvent } from '../../services/eventService';

const CreateEvent = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000)); // +1h par défaut
  const [maxParticipants, setMaxParticipants] = useState('');
  
  // Date pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    const { user } = useAuth();
    setUser(user);
  };

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
    // Validation
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
      maxPart
    );

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Event created successfully! 🎣', [
        {
          text: 'OK',
          onPress: () => router.push('/home')
        }
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to create event');
    }
  };

  return (
    <ScreenWrapper bg="white">
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Fishing Event 🎣</Text>
            <Text style={styles.subtitle}>Organize a fishing session with the community</Text>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Title *</Text>
            <Input
              placeholder="e.g., Carp Session at Lake Geneva"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              containerStyles={styles.input}
            />
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location *</Text>
            <Input
              icon={<Icon name="location" size={22} strokeWidth={1.6} />}
              placeholder="e.g., Lake Geneva, France"
              value={location}
              onChangeText={setLocation}
              maxLength={200}
              containerStyles={styles.input}
            />
          </View>

          {/* Start Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Start Date & Time *</Text>
            <Pressable 
              style={styles.dateTimeButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Icon name="calendar" size={20} color={theme.colors.primary} />
              <Text style={styles.dateTimeText}>{formatDateTime(startDate)}</Text>
            </Pressable>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setStartDate(selectedDate);
                    if (Platform.OS === 'android') {
                      setShowStartTimePicker(true);
                    }
                  }
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
                  if (selectedTime) {
                    setStartDate(selectedTime);
                  }
                }}
              />
            )}
          </View>

          {/* End Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>End Date & Time *</Text>
            <Pressable 
              style={styles.dateTimeButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Icon name="calendar" size={20} color={theme.colors.primary} />
              <Text style={styles.dateTimeText}>{formatDateTime(endDate)}</Text>
            </Pressable>

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={startDate}
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setEndDate(selectedDate);
                    if (Platform.OS === 'android') {
                      setShowEndTimePicker(true);
                    }
                  }
                }}
              />
            )}

            {showEndTimePicker && (
              <DateTimePicker
                value={endDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowEndTimePicker(Platform.OS === 'ios');
                  if (selectedTime) {
                    setEndDate(selectedTime);
                  }
                }}
              />
            )}
          </View>

          {/* Description avec SmartInput */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <SmartInput
              placeholder="Tell people about this fishing event... 🐟"
              value={description}
              onChangeText={setDescription}
              currentUserId={user?.id}
              multiline
              numberOfLines={4}
              maxLength={500}
              style={styles.descriptionInput}
            />
          </View>

          {/* Max Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Max Participants (Optional)</Text>
            <Input
              placeholder="Leave empty for unlimited"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
              maxLength={4}
              containerStyles={styles.input}
            />
          </View>

          {/* Submit Button */}
          <Button
            title={loading ? "Creating..." : "Create Event"}
            onPress={handleCreate}
            loading={loading}
            buttonStyle={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(2),
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(10),
  },
  header: {
    marginBottom: hp(3),
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  input: {
    backgroundColor: 'white',
  },
  descriptionInput: {
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.xl,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: hp(1.7),
    color: theme.colors.text,
    minHeight: hp(12),
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  dateTimeText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  submitButton: {
    marginTop: hp(3),
    height: hp(6.5),
  },
});

export default CreateEvent;