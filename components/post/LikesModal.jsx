import { View, Text, StyleSheet, Modal, FlatList, Pressable, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { commonStyles } from '../../constants/commonStyles'
import { hp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { getPostLikes } from '../../services/likeService'
import Avatar from '../common/Avatar'
import ModalHeader from '../common/ModalHeader'
import EmptyState from '../common/EmptyState'

const LikesModal = ({ visible, onClose, postId }) => {
  const { theme } = useTheme();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && postId) {
      loadLikes();
    }
  }, [visible, postId]);

  const loadLikes = async () => {
    setLoading(true);
    const result = await getPostLikes(postId);
    
    if (result.success) {
      setLikes(result.data || []);
    }
    
    setLoading(false);
  };

  const renderLikeItem = ({ item }) => {
    const profile = item.profiles;
    const displayName = profile?.show_full_name && profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`
      : profile?.username || 'Unknown';

    return (
      <Pressable 
        style={[commonStyles.flexRow, styles.likeItem]}
        onPress={() => {
          console.log('Navigate to profile:', profile?.id);
        }}
      >
        <Avatar profile={item.profiles} size={48} />

        <View style={styles.userInfo}>
          <Text style={[commonStyles.textSemiBold, styles.displayName]}>
            {displayName}
          </Text>
          <Text style={[commonStyles.textLight, styles.username]}>
            @{profile?.username || 'unknown'}
          </Text>
        </View>

        <Icon 
          name="arrowLeft" 
          size={18} 
          color={theme.colors.textLight} 
          style={{ transform: [{ rotate: '180deg' }] }} 
        />
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[commonStyles.absoluteFill, { backgroundColor: theme.colors.card }]}>
        <ModalHeader 
          title={`Likes (${likes.length})`}
          onClose={onClose}
        />

        {loading ? (
          <View style={[commonStyles.center, { flex: 1 }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={likes}
            renderItem={renderLikeItem}
            keyExtractor={(item) => item.user_id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState 
                iconName="heart"
                title="No likes yet"
                message="Be the first to like this post! ❤️"
              />
            }
          />
        )}
      </View>
    </Modal>
  );
};

export default LikesModal;

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  likeItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: hp(1.8),
  },
  username: {
    fontSize: hp(1.6),
  },
});