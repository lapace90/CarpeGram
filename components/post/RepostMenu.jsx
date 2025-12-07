import { View, Text, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import { deleteRepost } from '../../services/repostService';

const RepostMenu = ({ visible, onClose, userId, postId, onAction }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    onAction('edit');
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Repost',
      'Are you sure you want to remove this repost? The original post will remain.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await deleteRepost(userId, postId);
            setLoading(false);

            if (result.success) {
              Alert.alert('Success', 'Repost removed successfully');
              onAction('delete');
              onClose();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete repost');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.modal, { backgroundColor: theme.colors.card, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl }]} 
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              Repost Options
            </Text>
          </View>

          <View style={styles.options}>
            {/* Edit Button */}
            <Pressable 
              style={[styles.optionButton, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg }]} 
              onPress={handleEdit}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <Icon name="edit" size={22} color={theme.colors.primary} />
              </View>
              <Text style={[styles.optionText, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Edit Repost
              </Text>
            </Pressable>

            {/* Delete Button */}
            <Pressable
              style={[styles.optionButton, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg }]}
              onPress={handleDelete}
              disabled={loading}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.rose + '15' }]}>
                <Icon name="delete" size={22} color={theme.colors.rose} />
              </View>
              <Text style={[styles.optionText, { fontWeight: theme.fonts.semiBold, color: theme.colors.rose }]}>
                {loading ? 'Deleting...' : 'Delete Repost'}
              </Text>
            </Pressable>

            {/* Cancel Button */}
            <Pressable 
              style={[styles.optionButton, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg }]} 
              onPress={onClose}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.gray + '40' }]}>
                <Icon name="delete" size={22} color={theme.colors.text} />
              </View>
              <Text style={[styles.optionText, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RepostMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    padding: hp(2.5),
    paddingBottom: hp(4),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(2),
  },
  options: {
    gap: hp(1.5),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1.5),
    gap: wp(3),
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: hp(1.8),
  },
});