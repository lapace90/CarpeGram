import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';
import { updateRepost } from '../services/repostService';

const EditRepostModal = ({ visible, onClose, repost, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && repost) {
      setComment(repost.repost_comment || '');
      setPrivacy(repost.repost_privacy || 'public');
    }
  }, [visible, repost]);

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: 'globe' },
    { value: 'followers', label: 'Followers', icon: 'user' },
    { value: 'close_friends', label: 'Close Friends', icon: 'heart' },
  ];

  const handleSave = async () => {
    setLoading(true);

    const updates = {
      comment: comment.trim() || null,
      privacy,
    };

    const result = await updateRepost(repost.repost_user_id, repost.id, updates);

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Repost updated successfully! 🎣');
      onUpdate();
      onClose();
    } else {
      Alert.alert('Error', result.error || 'Failed to update repost');
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
            <Text style={styles.title}>Edit Repost</Text>
            <Pressable onPress={handleSave} disabled={loading}>
              <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            {/* Comment */}
            <View style={styles.section}>
              <Text style={styles.label}>Your Comment (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Share your thoughts about this catch..."
                placeholderTextColor={theme.colors.textLight}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{comment.length}/500</Text>
            </View>

            {/* Privacy */}
            <View style={styles.privacySection}>
              <Text style={styles.sectionTitle}>👥 Who can see this repost?</Text>
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

            <View style={styles.note}>
              <Icon name="edit" size={16} color={theme.colors.textLight} />
              <Text style={styles.noteText}>
                You can only edit your comment and privacy. The original post cannot be modified.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditRepostModal;

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
  content: {
    flex: 1,
    padding: wp(5),
  },
  section: {
    marginBottom: hp(2),
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
  privacySection: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1.5),
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
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.primary + '08',
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  noteText: {
    flex: 1,
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2),
  },
});