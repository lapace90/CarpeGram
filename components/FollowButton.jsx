import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'

const FollowButton = ({ 
  isFollowing, 
  onPress, 
  loading = false,
  size = 'medium', // small, medium, large
  style 
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Size variations
    if (size === 'small') {
      baseStyle.push(styles.buttonSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.buttonLarge);
    }
    
    // Following state
    if (isFollowing) {
      baseStyle.push(styles.buttonFollowing);
    } else {
      baseStyle.push(styles.buttonNotFollowing);
    }
    
    // Custom style
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    if (size === 'small') {
      baseStyle.push(styles.textSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.textLarge);
    }
    
    if (isFollowing) {
      baseStyle.push(styles.textFollowing);
    } else {
      baseStyle.push(styles.textNotFollowing);
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
    borderRadius: theme.radius.xl,
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
  buttonNotFollowing: {
    backgroundColor: theme.colors.primary,
  },
  buttonFollowing: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: theme.colors.gray,
  },
  buttonText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
  },
  textSmall: {
    fontSize: hp(1.6),
  },
  textLarge: {
    fontSize: hp(2),
  },
  textNotFollowing: {
    color: 'white',
  },
  textFollowing: {
    color: theme.colors.text,
  },
});