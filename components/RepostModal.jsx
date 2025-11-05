import { View, Text, StyleSheet, Modal, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';

const RepostModal = ({ visible, onClose, onRepost }) => {
  const [selectedPrivacy, setSelectedPrivacy] = useState('public');
  const [comment, setComment] = useState('');

  const privacyOptions = [
    { 
      value: 'public', 
      label: 'Public', 
      icon: 'globe',
      description: 'Anyone can see this repost'
    },
    { 
      value: 'followers', 
      label: 'Followers', 
      icon: 'user',
      description: 'Only your followers can see'
    },
    { 
      value: 'close_friends', 
      label: 'Close Friends', 
      icon: 'heart',
      description: 'Only close friends can see'
    },
  ];

  const handleRepost = () => {
    onRepost(selectedPrivacy, comment.trim() || null);
    onClose();
    // Reset
    setComment('');
    setSelectedPrivacy('public');
  };

  const handleClose = () => {
    onClose();
    // Reset après un délai pour éviter le flash
    setTimeout(() => {
      setComment('');
      setSelectedPrivacy('public');
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>Repost</Text>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Icon name="delete" size={20} color={theme.colors.text} />
              </Pressable>
            </View>

            {/* Optional Comment */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionLabel}>Add your thoughts (optional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Share why you're reposting this catch..."
                placeholderTextColor={theme.colors.textLight}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{comment.length}/500</Text>
            </View>

            {/* Privacy Selection */}
            <View style={styles.privacySection}>
              <Text style={styles.sectionLabel}>Who can see this?</Text>
              <View style={styles.options}>
                {privacyOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      selectedPrivacy === option.value && styles.optionButtonActive
                    ]}
                    onPress={() => setSelectedPrivacy(option.value)}
                  >
                    <View style={[
                      styles.optionIcon,
                      selectedPrivacy === option.value && styles.optionIconActive
                    ]}>
                      <Icon 
                        name={option.icon} 
                        size={20} 
                        color={selectedPrivacy === option.value ? 'white' : theme.colors.primary}
                      />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                    {selectedPrivacy === option.value && (
                      <Icon name="heart" size={18} color={theme.colors.primary} fill={theme.colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Repost Button */}
            <Pressable style={styles.repostButton} onPress={handleRepost}>
              <Icon name="share" size={20} color="white" />
              <Text style={styles.repostButtonText}>Repost</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RepostModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: wp(90),
    maxHeight: hp(80),
    backgroundColor: 'white',
    borderRadius: theme.radius.xxl,
    padding: hp(2.5),
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  commentSection: {
    marginBottom: hp(2),
  },
  sectionLabel: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  commentInput: {
    backgroundColor: theme.colors.gray + '20',
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    fontSize: hp(1.6),
    color: theme.colors.text,
    minHeight: hp(10),
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
  options: {
    gap: hp(1),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.gray + '15',
    gap: wp(3),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconActive: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: 2,
  },
  repostButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  repostButtonText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
});