import { View, StyleSheet, Modal, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { theme } from '../../constants/theme'
import { commonStyles } from '../../constants/commonStyles'
import { hp } from '../../helpers/common'
import { getPostComments, addComment, deleteComment } from '../../services/commentService'
import CommentItem from './CommentItem'
import CommentInput from './CommentInput'
import ModalHeader from '../ModalHeader'
import EmptyState from '../EmptyState'

const CommentsModal = ({ visible, onClose, postId, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId]);

  const loadComments = async () => {
    setLoading(true);
    const result = await getPostComments(postId);
    
    if (result.success) {
      setComments(result.data || []);
    }
    
    setLoading(false);
  };

  const handleAddComment = async (text) => {
    setSubmitting(true);
    const result = await addComment(postId, currentUserId, text);
    
    if (result.success) {
      setComments([result.data, ...comments]);
    }
    
    setSubmitting(false);
    return result.success;
  };

  const handleDeleteComment = async (commentId, commentUserId) => {
    if (commentUserId !== currentUserId) return;

    const result = await deleteComment(commentId);
    
    if (result.success) {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  const renderComment = ({ item }) => (
    <CommentItem
      {...item}
      currentUserId={currentUserId}
      onDelete={handleDeleteComment}
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={commonStyles.absoluteFill}>
        <ModalHeader 
          title={`Comments (${comments.length})`}
          onClose={onClose}
        />

        {loading ? (
          <View style={[commonStyles.center, { flex: 1 }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState 
                iconName="comment"
                title="No comments yet"
                message="Be the first to share your thoughts! 💬"
              />
            }
          />
        )}

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
  listContent: {
    paddingVertical: 8,
  },
});