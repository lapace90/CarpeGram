import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import { deletePost } from '../../services/postService';
import { Alert } from 'react-native';

const PostMenu = ({ visible, onClose, postId, onAction }) => {
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    onAction('edit');
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this catch? This action cannot be undone.',
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
            const result = await deletePost(postId);
            setLoading(false);

            if (result.success) {
              Alert.alert('Success', 'Post deleted successfully');
              onAction('delete');
              onClose();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete post');
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
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Post Options</Text>
          </View>

          <View style={styles.options}>
            {/* Edit Button */}
            <Pressable style={styles.optionButton} onPress={handleEdit}>
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <Icon name="edit" size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.optionText}>Edit Post</Text>
            </Pressable>

            {/* Delete Button */}
            <Pressable
              style={styles.optionButton}
              onPress={handleDelete}
              disabled={loading}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.rose + '15' }]}>
                <Icon name="delete" size={22} color={theme.colors.rose} />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.rose }]}>
                {loading ? 'Deleting...' : 'Delete Post'}
              </Text>
            </Pressable>

            {/* Cancel Button */}
            <Pressable style={styles.optionButton} onPress={onClose}>
              <View style={styles.optionIcon}>
                <Icon name="delete" size={22} color={theme.colors.text} />
              </View>
              <Text style={styles.optionText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PostMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: hp(2.5),
    paddingBottom: hp(4),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  options: {
    gap: hp(1.5),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.gray + '20',
    gap: wp(3),
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.gray + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
});