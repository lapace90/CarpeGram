import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp } from '../../helpers/common';
import Icon from '../../assets/icons';
import Avatar from '../common/Avatar';
import { commonStyles } from '../../constants/commonStyles';

const RepostHeader = ({ 
  repostProfile, 
  comment, 
  isOwnRepost, 
  onMenuPress 
}) => {
  const { theme } = useTheme();

  const displayName = repostProfile?.show_full_name && repostProfile?.first_name
    ? `${repostProfile.first_name} ${repostProfile.last_name || ''}`
    : `@${repostProfile?.username || 'unknown'}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={[styles.repostIndicator, { backgroundColor: theme.colors.primary + '08' }]}>
        <Icon name="share" size={14} color={theme.colors.primary} />
        <Text style={[styles.repostText, { color: theme.colors.primary, fontWeight: theme.fonts.medium }]}>
          Reposted
        </Text>
      </View>
      
      <View style={[styles.contentSection, { borderBottomColor: theme.colors.gray }]}>
        <View style={[commonStyles.flexRowBetween, { alignItems: 'flex-start' }]}>
          <View style={[commonStyles.flexRow, { flex: 1, gap: 10 }]}>
            <Avatar profile={repostProfile} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.username, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
                {displayName}
              </Text>
              {comment && (
                <Text style={[styles.commentText, { color: theme.colors.text }]}>
                  {comment}
                </Text>
              )}
            </View>
          </View>
          
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
  container: {},
  repostIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  repostText: {
    fontSize: hp(1.3),
  },
  contentSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  username: {
    fontSize: hp(1.7),
    marginBottom: 4,
  },
  commentText: {
    fontSize: hp(1.6),
    lineHeight: hp(2.2),
  },
  menuButton: {
    padding: 4,
  },
});