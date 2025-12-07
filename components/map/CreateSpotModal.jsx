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
import { useTheme } from '../../contexts/ThemeContext';
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
  const { theme } = useTheme();
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
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderRadius: theme.radius.xxl }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                New Spot
              </Text>
              <Pressable onPress={handleClose} hitSlop={10}>
                <Icon name="delete" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            {/* Coordinates */}
            <Text style={[styles.coordsText, { color: theme.colors.textLight }]}>
              📍 {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
            </Text>

            {/* Name */}
            <TextInput
              style={[styles.input, { 
                borderColor: theme.colors.gray, 
                borderRadius: theme.radius.xl,
                color: theme.colors.text
              }]}
              placeholder="Spot name *"
              value={name}
              onChangeText={setName}
              placeholderTextColor={theme.colors.textLight}
              maxLength={100}
            />

            {/* Water Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                Water type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SPOT_TYPES.map(type => (
                  <Pressable
                    key={type.value}
                    style={[
                      styles.typeChip, 
                      { borderColor: theme.colors.gray, borderRadius: theme.radius.md },
                      waterType === type.value && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    ]}
                    onPress={() => setWaterType(type.value)}
                  >
                    <Text style={[
                      styles.typeChipText,
                      { color: theme.colors.text },
                      waterType === type.value && { color: 'white' }
                    ]}>
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Fish Types */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                Fish species (optional)
              </Text>
              <View style={styles.fishGrid}>
                {FISH_TYPES.map(fish => (
                  <Pressable
                    key={fish}
                    style={[
                      styles.fishChip,
                      { borderColor: theme.colors.gray, borderRadius: theme.radius.md },
                      fishTypes.includes(fish) && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }
                    ]}
                    onPress={() => toggleFishType(fish)}
                  >
                    <Text style={[
                      styles.fishChipText,
                      { color: theme.colors.text },
                      fishTypes.includes(fish) && { color: theme.colors.primary, fontWeight: theme.fonts.semibold }
                    ]}>
                      {fish}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Description */}
            <TextInput
              style={[styles.input, styles.textArea, { 
                borderColor: theme.colors.gray, 
                borderRadius: theme.radius.xl,
                color: theme.colors.text
              }]}
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
              <Text style={[styles.label, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                Who can see this spot
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRIVACY_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.privacyChip,
                      { borderColor: theme.colors.gray, borderRadius: theme.radius.md },
                      privacy === option.value && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
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
                      { color: theme.colors.text },
                      privacy === option.value && { color: 'white' }
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
                style={[styles.button, { backgroundColor: theme.colors.backgroundLight, borderRadius: theme.radius.xl }]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text, fontWeight: theme.fonts.semibold }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[styles.button, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl }]}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={[styles.createButtonText, { fontWeight: theme.fonts.semibold }]}>
                    Create Spot
                  </Text>
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
  },
  coordsText: {
    fontSize: hp(1.5),
    marginBottom: hp(2),
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: hp(1.8),
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
    marginBottom: hp(1),
  },
  typeChip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    marginRight: wp(2),
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: hp(1.6),
  },
  fishGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  fishChip: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderWidth: 1,
    marginBottom: hp(0.5),
  },
  fishChipText: {
    fontSize: hp(1.5),
  },
  privacyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    marginRight: wp(2),
    borderWidth: 1,
  },
  privacyChipText: {
    fontSize: hp(1.5),
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: hp(1.8),
  },
  createButtonText: {
    color: 'white',
    fontSize: hp(1.8),
  },
});