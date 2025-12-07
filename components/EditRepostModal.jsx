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
import { useTheme } from '../contexts/ThemeContext';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';
import { updateRepost } from '../services/repostService';

const EditRepostModal = ({ visible, onClose, repost, onUpdate }) => {
  const { theme } = useTheme();
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
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.gray }]}>
            <Pressable onPress={onClose} disabled={loading}>
              <Text style={[styles.cancelButton, { color: theme.colors.text }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              Edit Repost
            </Text>
            <Pressable onPress={handleSave} disabled={loading}>
              <Text style={[
                styles.saveButton, 
                { fontWeight: theme.fonts.bold, color: theme.colors.primary },
                loading && styles.saveButtonDisabled
              ]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            {/* Comment */}
            <View style={styles.section}>
              <Text style={[styles.label, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Your Comment (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textArea, 
                  { 
                    backgroundColor: theme.colors.gray + '20',
                    borderRadius: theme.radius.lg,
                    color: theme.colors.text,
                  }
                ]}
                placeholder="Share your thoughts about this catch..."
                placeholderTextColor={theme.colors.textLight}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: theme.colors.textLight }]}>
                {comment.length}/500
              </Text>
            </View>

            {/* Privacy */}
            <View style={styles.privacySection}>
              <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                👥 Who can see this repost?
              </Text>
              <View style={styles.privacyOptions}>
                {privacyOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.privacyButton,
                      { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg },
                      privacy === option.value && { 
                        backgroundColor: theme.colors.primary + '10',
                        borderColor: theme.colors.primary,
                      }
                    ]}
                    onPress={() => setPrivacy(option.value)}
                  >
                    <View
                      style={[
                        styles.privacyIcon,
                        { backgroundColor: theme.colors.primary + '15' },
                        privacy === option.value && { backgroundColor: theme.colors.primary }
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
                      privacy === option.value && { color: theme.colors.primary }
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

            {/* Note */}
            <View style={[
              styles.note, 
              { 
                backgroundColor: theme.colors.primary + '08',
                borderRadius: theme.radius.lg,
                borderLeftColor: theme.colors.primary,
              }
            ]}>
              <Icon name="info" size={18} color={theme.colors.primary} />
              <Text style={[styles.noteText, { color: theme.colors.textLight }]}>
                The original post cannot be modified.
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
  content: {
    flex: 1,
    padding: wp(5),
  },
  section: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: hp(1.6),
    marginBottom: hp(1),
  },
  textArea: {
    padding: hp(1.5),
    fontSize: hp(1.7),
    minHeight: hp(12),
    maxHeight: hp(20),
  },
  charCount: {
    fontSize: hp(1.3),
    textAlign: 'right',
    marginTop: 4,
  },
  privacySection: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: hp(1.9),
    marginBottom: hp(1.5),
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
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: hp(1.5),
    borderLeftWidth: 3,
  },
  noteText: {
    flex: 1,
    fontSize: hp(1.5),
    lineHeight: hp(2),
  },
});