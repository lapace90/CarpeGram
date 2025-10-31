import { View, Text, StyleSheet, Modal, FlatList, Pressable, ActivityIndicator } from 'react-native'
import React from 'react'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import CommentItem from './CommentItem'
import CommentInput from './CommentInput'
import { useComments } from '../../hooks/useComments'

const CommentsModal = ({ visible, onClose, postId, currentUserId }) => {
  const {
    comments,
    commentsCount,
    loading,
    submitting,
    addComment,
    removeComment,
  } = useComments(postId, 0);

  const handleAddComment = async (text) => {
    return await addComment(currentUserId, text);
  };

  const renderComment = ({ item }) => (
    <CommentItem
      comment={item}
      currentUserId={currentUserId}
      onDelete={removeComment}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="comment" size={60} strokeWidth={1.5} color={theme.colors.textLight} />
      <Text style={styles.emptyTitle}>No comments yet</Text>
      <Text style={styles.emptyText}>Be the first to comment! 💬</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comments ({commentsCount})</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="arrowLeft" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Comments List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty()}
          />
        )}

        {/* Input */}
        <CommentInput
          onSubmit={handleAddComment}
          loading={submitting}
        />
      </View>
    </Modal>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
    gap: 12,
  },
  emptyTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: 10,
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
});