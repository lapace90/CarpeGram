import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { theme } from '../../constants/theme';
import { hp } from '../../helpers/common';
import Icon from '../../assets/icons';
import Avatar from '../Avatar';
import { commonStyles } from '../../constants/commonStyles';

const RepostHeader = ({ 
  repostProfile, 
  comment, 
  isOwnRepost, 
  onMenuPress 
}) => {
  const displayName = repostProfile?.show_full_name && repostProfile?.first_name
    ? `${repostProfile.first_name} ${repostProfile.last_name || ''}`
    : `@${repostProfile?.username || 'unknown'}`;

  return (
    <View style={styles.container}>
      {/* Ligne simple avec juste l'icône */}
      <View style={styles.repostIndicator}>
        <Icon name="share" size={14} color={theme.colors.primary} />
        <Text style={styles.repostText}>Reposted</Text>
      </View>
      
      {/* Section avec avatar + commentaire/nom + menu */}
      <View style={styles.contentSection}>
        <View style={[commonStyles.flexRowBetween, { alignItems: 'flex-start' }]}>
          <View style={[commonStyles.flexRow, { flex: 1, gap: 10 }]}>
            <Avatar profile={repostProfile} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={styles.username}>{displayName}</Text>
              {comment && <Text style={styles.commentText}>{comment}</Text>}
            </View>
          </View>
          
          {/* Menu ICI si c'est ton repost */}
          {isOwnRepost && onMenuPress && (
            <Pressable 
              onPress={onMenuPress}
              style={styles.menuButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="threeDotsHorizontal" size={18} color={theme.colors.text} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

export default RepostHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  repostIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary + '08',
  },
  repostText: {
    fontSize: hp(1.3),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  contentSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  username: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  commentText: {
    fontSize: hp(1.6),
    color: theme.colors.text,
    lineHeight: hp(2.2),
  },
  menuButton: {
    padding: 4,
  },
});