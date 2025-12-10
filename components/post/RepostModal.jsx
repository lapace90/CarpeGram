import { View, Text, StyleSheet, Modal, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';

const RepostModal = ({ visible, onClose, onRepost }) => {
  const { theme } = useTheme();
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
    setComment('');
    setSelectedPrivacy('public');
  };

  const handleClose = () => {
    onClose();
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
          <Pressable 
            style={[
              styles.modal, 
              { 
                backgroundColor: theme.colors.card, 
                borderRadius: theme.radius.xxl,
                shadowColor: theme.colors.dark,
              }
            ]} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                Repost
              </Text>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Icon name="delete" size={20} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.commentSection}>
              <Text style={[styles.sectionLabel, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Add your thoughts (optional)
              </Text>
              <TextInput
                style={[
                  styles.commentInput, 
                  { 
                    backgroundColor: theme.colors.gray + '20',
                    borderRadius: theme.radius.lg,
                    color: theme.colors.text,
                  }
                ]}
                placeholder="Share why you're reposting this catch..."
                placeholderTextColor={theme.colors.textLight}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: theme.colors.textLight }]}>
                {comment.length}/500
              </Text>
            </View>

            <View style={styles.privacySection}>
              <Text style={[styles.sectionLabel, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Who can see this?
              </Text>
              <View style={styles.options}>
                {privacyOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.colors.gray + '15', borderRadius: theme.radius.lg },
                      selectedPrivacy === option.value && { 
                        backgroundColor: theme.colors.primary + '10',
                        borderColor: theme.colors.primary,
                      }
                    ]}
                    onPress={() => setSelectedPrivacy(option.value)}
                  >
                    <View style={[
                      styles.optionIcon,
                      { backgroundColor: theme.colors.primary + '15' },
                      selectedPrivacy === option.value && { backgroundColor: theme.colors.primary }
                    ]}>
                      <Icon 
                        name={option.icon} 
                        size={20} 
                        color={selectedPrivacy === option.value ? theme.colors.card : theme.colors.primary}
                      />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.optionDescription, { color: theme.colors.textLight }]}>
                        {option.description}
                      </Text>
                    </View>
                    {selectedPrivacy === option.value && (
                      <Icon name="heart" size={18} color={theme.colors.primary} fill={theme.colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable 
              style={[styles.repostButton, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl }]} 
              onPress={handleRepost}
            >
              <Icon name="share" size={20} color={theme.colors.card} />
              <Text style={[styles.repostButtonText, { fontWeight: theme.fonts.bold }]}>
                Repost
              </Text>
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
    padding: hp(2.5),
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
  },
  closeButton: {
    padding: 8,
  },
  commentSection: {
    marginBottom: hp(2),
  },
  sectionLabel: {
    fontSize: hp(1.6),
    marginBottom: hp(1),
  },
  commentInput: {
    padding: hp(1.5),
    fontSize: hp(1.6),
    minHeight: hp(10),
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
  options: {
    gap: hp(1),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1.5),
    gap: wp(3),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: hp(1.7),
  },
  optionDescription: {
    fontSize: hp(1.4),
    marginTop: 2,
  },
  repostButton: {
    flexDirection: 'row',
    paddingVertical: hp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  repostButtonText: {
    fontSize: hp(1.8),
    color: 'white',
  },
});