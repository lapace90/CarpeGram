import { Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { hp } from '../helpers/common'

const FollowButton = ({ 
  isFollowing, 
  onPress, 
  loading = false,
  size = 'medium',
  style 
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = [styles.button, { borderRadius: theme.radius.xl }];
    
    if (size === 'small') {
      baseStyle.push(styles.buttonSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.buttonLarge);
    }
    
    if (isFollowing) {
      baseStyle.push({ backgroundColor: 'white', borderWidth: 1.5, borderColor: theme.colors.gray });
    } else {
      baseStyle.push({ backgroundColor: theme.colors.primary });
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, { fontWeight: theme.fonts.semiBold }];
    
    if (size === 'small') {
      baseStyle.push(styles.textSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.textLarge);
    }
    
    if (isFollowing) {
      baseStyle.push({ color: theme.colors.text });
    } else {
      baseStyle.push({ color: 'white' });
    }
    
    return baseStyle;
  };

  return (
    <Pressable 
      style={getButtonStyle()}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={isFollowing ? theme.colors.text : 'white'} 
        />
      ) : (
        <Text style={getTextStyle()}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </Pressable>
  );
};

export default FollowButton;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonSmall: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 80,
  },
  buttonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    minWidth: 120,
  },
  buttonText: {
    fontSize: hp(1.8),
  },
  textSmall: {
    fontSize: hp(1.6),
  },
  textLarge: {
    fontSize: hp(2),
  },
});