import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import { updatePost } from '../../services/postService';

const EditPostModal = ({ visible, onClose, post, onUpdate }) => {
  const [description, setDescription] = useState('');
  const [fishSpecies, setFishSpecies] = useState('');
  const [fishWeight, setFishWeight] = useState('');
  const [bait, setBait] = useState('');
  const [spot, setSpot] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [loading, setLoading] = useState(false);

  // Charger les données du post quand le modal s'ouvre
  useEffect(() => {
    if (visible && post) {
      setDescription(post.description || '');
      setFishSpecies(post.fish_species || '');
      setFishWeight(post.fish_weight ? post.fish_weight.toString() : '');
      setBait(post.bait || '');
      setSpot(post.spot || '');
      setPrivacy(post.privacy || 'public');
    }
  }, [visible, post]);

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: 'globe' },
    { value: 'followers', label: 'Followers', icon: 'user' },
    { value: 'close_friends', label: 'Close Friends', icon: 'heart' },
  ];

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Description cannot be empty');
      return;
    }

    if (description.trim().length < 3) {
      Alert.alert('Error', 'Description must be at least 3 characters');
      return;
    }

    setLoading(true);

    const updates = {
      description: description.trim(),
      fish_species: fishSpecies.trim(),
      fish_weight: fishWeight,
      bait: bait.trim(),
      spot: spot.trim(),
      privacy,
    };

    const result = await updatePost(post.id, post.user_id, updates);

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Post updated successfully! 🎣');
      onUpdate();
      onClose();
    } else {
      Alert.alert('Error', result.error || 'Failed to update post');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} disabled={loading}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </Pressable>
            <Text style={styles.title}>Edit Post</Text>
            <Pressable onPress={handleSave} disabled={loading}>
              <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about this catch..."
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

            {/* Fish Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>🎣 Catch Details (Optional)</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Species</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., European Carp"
                  placeholderTextColor={theme.colors.textLight}
                  value={fishSpecies}
                  onChangeText={setFishSpecies}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 12.5"
                  placeholderTextColor={theme.colors.textLight}
                  value={fishWeight}
                  onChangeText={setFishWeight}
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bait Used</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Boilies, Corn"
                  placeholderTextColor={theme.colors.textLight}
                  value={bait}
                  onChangeText={setBait}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Lake Geneva"
                  placeholderTextColor={theme.colors.textLight}
                  value={spot}
                  onChangeText={setSpot}
                  maxLength={100}
                />
              </View>
            </View>

            {/* Privacy */}
            <View style={styles.privacySection}>
              <Text style={styles.sectionTitle}>👥 Who can see this?</Text>
              <View style={styles.privacyOptions}>
                {privacyOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.privacyButton,
                      privacy === option.value && styles.privacyButtonActive,
                    ]}
                    onPress={() => setPrivacy(option.value)}
                  >
                    <View
                      style={[
                        styles.privacyIcon,
                        privacy === option.value && styles.privacyIconActive,
                      ]}
                    >
                      <Icon
                        name={option.icon}
                        size={20}
                        color={privacy === option.value ? 'white' : theme.colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.privacyLabel,
                        privacy === option.value && styles.privacyLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {privacy === option.value && (
                      <Icon
                        name="heart"
                        size={16}
                        color={theme.colors.primary}
                        fill={theme.colors.primary}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditPostModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  cancelButton: {
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  saveButton: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  section: {
    padding: wp(5),
  },
  label: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  textArea: {
    backgroundColor: theme.colors.gray + '20',
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    fontSize: hp(1.7),
    color: theme.colors.text,
    minHeight: hp(12),
    maxHeight: hp(20),
  },
  charCount: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  detailsSection: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  sectionTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1.5),
  },
  inputGroup: {
    marginBottom: hp(1.5),
  },
  input: {
    backgroundColor: theme.colors.gray + '20',
    borderRadius: theme.radius.lg,
    paddingHorizontal: hp(1.5),
    paddingVertical: hp(1.2),
    fontSize: hp(1.7),
    color: theme.colors.text,
  },
  privacySection: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  privacyOptions: {
    gap: hp(1),
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.gray + '20',
    gap: wp(3),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyButtonActive: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyIconActive: {
    backgroundColor: theme.colors.primary,
  },
  privacyLabel: {
    flex: 1,
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  privacyLabelActive: {
    color: theme.colors.primary,
  },
});