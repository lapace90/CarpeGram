import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';

const SPOT_TYPES = [
  { value: 'lake', label: 'Lake' },
  { value: 'river', label: 'River' },
  { value: 'pond', label: 'Pond' },
  { value: 'canal', label: 'Canal' },
  { value: 'sea', label: 'Sea' },
];

const FISH_TYPES = [
  'Carp', 'Pike', 'Catfish', 'Black bass',
  'Zander', 'Perch', 'Roach', 'Tench', 'Grass carp',
];

const PRIVACY_OPTIONS = [
  { value: 'public', icon: 'unlock', label: 'Public' },
  { value: 'followers', icon: 'user', label: 'Followers' },
  { value: 'close_friends', icon: 'heart', label: 'Close Friends' },
  { value: 'private', icon: 'lock', label: 'Private' },
];

const CreateSpotModal = ({ 
  visible, 
  onClose, 
  coordinates, 
  onCreateSpot,
  loading = false 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [waterType, setWaterType] = useState('lake');
  const [fishTypes, setFishTypes] = useState([]);
  const [privacy, setPrivacy] = useState('public');

  const toggleFishType = (fish) => {
    setFishTypes(prev => 
      prev.includes(fish) 
        ? prev.filter(f => f !== fish)
        : [...prev, fish]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Spot name is required');
      return;
    }

    const spotData = {
      name: name.trim(),
      description: description.trim() || null,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      water_type: waterType,
      fish_types: fishTypes,
      privacy,
    };

    const success = await onCreateSpot(spotData);
    
    if (success) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setWaterType('lake');
    setFishTypes([]);
    setPrivacy('public');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!coordinates) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>New Spot</Text>
              <Pressable onPress={handleClose} hitSlop={10}>
                <Icon name="delete" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            {/* Coordinates */}
            <Text style={styles.coordsText}>
              📍 {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
            </Text>

            {/* Name */}
            <TextInput
              style={styles.input}
              placeholder="Spot name *"
              value={name}
              onChangeText={setName}
              placeholderTextColor={theme.colors.textLight}
              maxLength={100}
            />

            {/* Water Type */}
            <View style={styles.section}>
              <Text style={styles.label}>Water type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SPOT_TYPES.map(type => (
                  <Pressable
                    key={type.value}
                    style={[styles.typeChip, waterType === type.value && styles.typeChipActive]}
                    onPress={() => setWaterType(type.value)}
                  >
                    <Text style={[
                      styles.typeChipText,
                      waterType === type.value && styles.typeChipTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Fish Types */}
            <View style={styles.section}>
              <Text style={styles.label}>Fish species (optional)</Text>
              <View style={styles.fishGrid}>
                {FISH_TYPES.map(fish => (
                  <Pressable
                    key={fish}
                    style={[
                      styles.fishChip,
                      fishTypes.includes(fish) && styles.fishChipActive
                    ]}
                    onPress={() => toggleFishType(fish)}
                  >
                    <Text style={[
                      styles.fishChipText,
                      fishTypes.includes(fish) && styles.fishChipTextActive
                    ]}>
                      {fish}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Description */}
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={theme.colors.textLight}
              maxLength={500}
            />

            {/* Privacy */}
            <View style={styles.section}>
              <Text style={styles.label}>Who can see this spot</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRIVACY_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.privacyChip,
                      privacy === option.value && styles.privacyChipActive
                    ]}
                    onPress={() => setPrivacy(option.value)}
                  >
                    <Icon
                      name={option.icon}
                      size={16}
                      color={privacy === option.value ? 'white' : theme.colors.text}
                    />
                    <Text style={[
                      styles.privacyChipText,
                      privacy === option.value && styles.privacyChipTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.createButton]}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createButtonText}>Create Spot</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CreateSpotModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: theme.radius.xxl,
    padding: wp(5),
    width: wp(92),
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  title: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  coordsText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginBottom: hp(2),
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.xl,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: hp(1.8),
    color: theme.colors.text,
    marginBottom: hp(2),
  },
  textArea: {
    height: hp(12),
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    marginBottom: hp(1),
    fontWeight: theme.fonts.medium,
  },
  typeChip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    marginRight: wp(2),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    fontSize: hp(1.6),
    color: theme.colors.text,
  },
  typeChipTextActive: {
    color: 'white',
  },
  fishGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  fishChip: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    marginBottom: hp(0.5),
  },
  fishChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  fishChipText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
  },
  fishChipTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.semibold,
  },
  privacyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    marginRight: wp(2),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  privacyChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  privacyChipText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
  },
  privacyChipTextActive: {
    color: 'white',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2),
    gap: wp(3),
  },
  button: {
    flex: 1,
    paddingVertical: hp(1.8),
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.backgroundLight,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
  },
  createButtonText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
  },
});