import { View, Text, StyleSheet, Modal, Pressable, Alert, TextInput, ScrollView, Share } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { hp, wp } from '../helpers/common'
import Icon from '../assets/icons'
import { unfollowUser } from '../services/followService'
import { toggleCloseFriend, checkIfCloseFriend, blockUser } from '../services/relationshipService'
import { reportUser } from '../services/reportService'

const UserProfileMenu = ({ visible, onClose, userId, targetUserId, targetUsername, isFollowing, onActionComplete }) => {
  const { theme } = useTheme();
  const [isCloseFriend, setIsCloseFriend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReportInput, setShowReportInput] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    if (visible && isFollowing) {
      checkCloseFriendStatus();
    }
  }, [visible, isFollowing]);

  const checkCloseFriendStatus = async () => {
    const result = await checkIfCloseFriend(userId, targetUserId);
    if (result.success) {
      setIsCloseFriend(result.isCloseFriend);
    }
  };

  const handleCloseFriend = async () => {
    setLoading(true);
    const result = await toggleCloseFriend(userId, targetUserId);
    
    if (result.success) {
      setIsCloseFriend(!isCloseFriend);
      Alert.alert(
        'Success',
        isCloseFriend 
          ? `Removed from close friends` 
          : `Added to close friends`
      );
    } else {
      Alert.alert('Error', result.error || 'Something went wrong');
    }
    
    setLoading(false);
  };

  const handleUnfollow = () => {
    Alert.alert(
      'Unfollow',
      `Are you sure you want to unfollow @${targetUsername}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await unfollowUser(userId, targetUserId);
            
            if (result.success) {
              Alert.alert('Success', `You unfollowed @${targetUsername}`);
              onClose();
              if (onActionComplete) onActionComplete('unfollow');
            } else {
              Alert.alert('Error', result.error || 'Something went wrong');
            }
            
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleBlock = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block @${targetUsername}? This will also unfollow them.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await blockUser(userId, targetUserId);
            
            if (result.success) {
              Alert.alert('Success', `You blocked @${targetUsername}`);
              onClose();
              if (onActionComplete) onActionComplete('block');
            } else {
              Alert.alert('Error', result.error || 'Something went wrong');
            }
            
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleReport = async () => {
    if (reportReason.trim().length < 10) {
      Alert.alert('Error', 'Please provide a reason (minimum 10 characters)');
      return;
    }

    setLoading(true);
    const result = await reportUser(userId, targetUserId, reportReason);
    
    if (result.success) {
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review it shortly.'
      );
      setReportReason('');
      setShowReportInput(false);
      onClose();
    } else {
      Alert.alert('Error', result.error || 'Something went wrong');
    }
    
    setLoading(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out @${targetUsername} on Carpegram!`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (showReportInput) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={[styles.reportContainer, { backgroundColor: theme.colors.card }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.reportHeader}>
              <Text style={[styles.reportTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                Report @{targetUsername}
              </Text>
              <Pressable onPress={() => setShowReportInput(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <Text style={[styles.reportLabel, { color: theme.colors.textLight }]}>
              Why are you reporting this user?
            </Text>
            <TextInput
              style={[
                styles.reportInput, 
                { 
                  borderColor: theme.colors.gray,
                  borderRadius: theme.radius.md,
                  color: theme.colors.text,
                }
              ]}
              placeholder="Explain the reason (minimum 10 characters)"
              placeholderTextColor={theme.colors.textLight}
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            <Pressable
              style={[
                styles.reportSubmitBtn, 
                { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md },
                loading && styles.buttonDisabled
              ]}
              onPress={handleReport}
              disabled={loading}
            >
              <Text style={[styles.reportSubmitText, { fontWeight: theme.fonts.semibold }]}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.bottomSheet, { backgroundColor: theme.colors.card }]} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: theme.colors.gray }]} />

          {/* Title */}
          <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            @{targetUsername}
          </Text>

          {/* Options */}
          <ScrollView style={styles.options}>
            {/* Close Friends */}
            {isFollowing && (
              <Pressable
                style={[styles.option, { borderBottomColor: theme.colors.gray }]}
                onPress={handleCloseFriend}
                disabled={loading}
              >
                <Icon
                  name="heart"
                  size={22}
                  color={isCloseFriend ? theme.colors.rose : theme.colors.text}
                  fill={isCloseFriend ? theme.colors.rose : 'none'}
                />
                <Text style={[styles.optionText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                  {isCloseFriend ? 'Remove from Close Friends' : 'Add to Close Friends'}
                </Text>
              </Pressable>
            )}

            {/* Unfollow */}
            {isFollowing && (
              <Pressable
                style={[styles.option, { borderBottomColor: theme.colors.gray }]}
                onPress={handleUnfollow}
                disabled={loading}
              >
                <Icon name="userMinus" size={22} color={theme.colors.text} />
                <Text style={[styles.optionText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                  Unfollow
                </Text>
              </Pressable>
            )}

            {/* Block */}
            <Pressable
              style={[styles.option, { borderBottomColor: theme.colors.gray }]}
              onPress={handleBlock}
              disabled={loading}
            >
              <Icon name="lock" size={22} color={theme.colors.rose} />
              <Text style={[styles.optionText, { color: theme.colors.rose, fontWeight: theme.fonts.medium }]}>
                Block
              </Text>
            </Pressable>

            {/* Report */}
            <Pressable
              style={[styles.option, { borderBottomColor: theme.colors.gray }]}
              onPress={() => setShowReportInput(true)}
              disabled={loading}
            >
              <Icon name="alertCircle" size={22} color={theme.colors.rose} />
              <Text style={[styles.optionText, { color: theme.colors.rose, fontWeight: theme.fonts.medium }]}>
                Report
              </Text>
            </Pressable>

            {/* Share Profile */}
            <Pressable
              style={[styles.option, { borderBottomColor: theme.colors.gray }]}
              onPress={handleShare}
              disabled={loading}
            >
              <Icon name="share" size={22} color={theme.colors.text} />
              <Text style={[styles.optionText, { color: theme.colors.text, fontWeight: theme.fonts.medium }]}>
                Share Profile
              </Text>
            </Pressable>
          </ScrollView>

          {/* Cancel */}
          <Pressable 
            style={[styles.cancelButton, { backgroundColor: theme.colors.gray, borderRadius: theme.radius.md }]} 
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default UserProfileMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: hp(2.2),
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  options: {
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: hp(2),
  },
  cancelButton: {
    marginTop: 15,
    marginHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: hp(2),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  reportContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: hp(2.4),
  },
  reportLabel: {
    fontSize: hp(1.8),
    marginBottom: 10,
  },
  reportInput: {
    borderWidth: 1,
    padding: 12,
    fontSize: hp(1.8),
    height: 120,
    marginBottom: 20,
  },
  reportSubmitBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  reportSubmitText: {
    fontSize: hp(2),
    color: 'white',
  },
});