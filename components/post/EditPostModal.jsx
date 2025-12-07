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
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import { updatePost } from '../../services/postService';

const EditPostModal = ({ visible, onClose, post, onUpdate }) => {
  const { theme } = useTheme();
  const [description, setDescription] = useState('');
  const [fishSpecies, setFishSpecies] = useState('');
  const [fishWeight, setFishWeight] = useState('');
  const [bait, setBait] = useState('');
  const [spot, setSpot] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [loading, setLoading] = useState(false);

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
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
            <Pressable onPress={onClose} disabled={loading}>
              <Text style={[styles.cancelButton, { color: theme.colors.text }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              Edit Post
            </Text>
            <Pressable onPress={handleSave} disabled={loading}>
              <Text style={[styles.saveButton, { fontWeight: theme.fonts.bold, color: theme.colors.primary }, loading && styles.saveButtonDisabled]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                📝 Description
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg, color: theme.colors.text }]}
                placeholder="Share your fishing story..."
                placeholderTextColor={theme.colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: theme.colors.textLight }]}>
                {description.length}/500
              </Text>
            </View>

            {/* Fish Details */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                🎣 Catch Details
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                  Fish Species
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg, color: theme.colors.text }]}
                  placeholder="e.g., Common Carp"
                  placeholderTextColor={theme.colors.textLight}
                  value={fishSpecies}
                  onChangeText={setFishSpecies}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                  Weight (kg)
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg, color: theme.colors.text }]}
                  placeholder="e.g., 12.5"
                  placeholderTextColor={theme.colors.textLight}
                  value={fishWeight}
                  onChangeText={setFishWeight}
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                  Bait Used
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg, color: theme.colors.text }]}
                  placeholder="e.g., Boilies, Corn"
                  placeholderTextColor={theme.colors.textLight}
                  value={bait}
                  onChangeText={setBait}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                  Location
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg, color: theme.colors.text }]}
                  placeholder="e.g., Lake Geneva"
                  placeholderTextColor={theme.colors.textLight}
                  value={spot}
                  onChangeText={setSpot}
                  maxLength={100}
                />
              </View>
            </View>

            {/* Privacy */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                👥 Who can see this?
              </Text>
              <View style={styles.privacyOptions}>
                {privacyOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.privacyButton,
                      { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg },
                      privacy === option.value && { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary },
                    ]}
                    onPress={() => setPrivacy(option.value)}
                  >
                    <View
                      style={[
                        styles.privacyIcon,
                        { backgroundColor: theme.colors.primary + '15' },
                        privacy === option.value && { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Icon
                        name={option.icon}
                        size={20}
                        color={privacy === option.value ? theme.colors.card : theme.colors.primary}
                      />
                    </View>
                    <Text style={[
                      styles.privacyLabel,
                      { fontWeight: theme.fonts.semiBold, color: theme.colors.text },
                      privacy === option.value && { color: theme.colors.primary },
                    ]}>
                      {option.label}
                    </Text>
                    {privacy === option.value && (
                      <Icon name="check" size={20} color={theme.colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ height: hp(4) }} />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
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
  section: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  sectionTitle: {
    fontSize: hp(1.9),
    marginBottom: hp(1.5),
  },
  textArea: {
    padding: hp(1.5),
    fontSize: hp(1.7),
    minHeight: hp(12),
    maxHeight: hp(20),
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: hp(1.3),
    textAlign: 'right',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: hp(1.5),
  },
  label: {
    fontSize: hp(1.6),
    marginBottom: hp(0.8),
  },
  input: {
    paddingHorizontal: hp(1.5),
    paddingVertical: hp(1.2),
    fontSize: hp(1.7),
  },
  privacyOptions: {
    gap: hp(1),
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1.5),
    gap: wp(3),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyLabel: {
    flex: 1,
    fontSize: hp(1.7),
  },
});