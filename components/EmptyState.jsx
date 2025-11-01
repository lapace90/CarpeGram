import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import Icon from '../assets/icons';

const EmptyState = ({ 
  iconName = 'image', 
  title = 'No content yet', 
  message, 
  buttonText,
  onButtonPress 
}) => {
  return (
    <View style={styles.container}>
      <Icon 
        name={iconName} 
        size={60} 
        strokeWidth={1.5} 
        color={theme.colors.textLight} 
      />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      
      {buttonText && onButtonPress && (
        <Pressable style={styles.button} onPress={onButtonPress}>
          <Icon name="plus" size={20} color="white" />
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(8),
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: 10,
  },
  message: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: hp(2.5),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    marginTop: 10,
  },
  buttonText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
});