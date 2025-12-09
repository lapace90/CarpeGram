import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { hp } from '../helpers/common';
import Icon from '../assets/icons';

const EmptyState = ({ 
  iconName = 'image', 
  title = 'No content yet', 
  message, 
  buttonText,
  onButtonPress 
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Icon 
        name={iconName} 
        size={60} 
        strokeWidth={1.5} 
        color={theme.colors.textLight} 
      />
      <Text style={[styles.title, { color: theme.colors.text, fontWeight: theme.fonts.bold }]}>
        {title}
      </Text>
      {message && (
        <Text style={[styles.message, { color: theme.colors.textLight }]}>
          {message}
        </Text>
      )}
      
      {buttonText && onButtonPress && (
        <Pressable 
          style={[styles.button, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.lg }]} 
          onPress={onButtonPress}
        >
          <Icon name="plus" size={20} color="white" />
          <Text style={[styles.buttonText, { fontWeight: theme.fonts.semiBold }]}>
            {buttonText}
          </Text>
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
    marginTop: 10,
  },
  message: {
    fontSize: hp(1.8),
    textAlign: 'center',
    lineHeight: hp(2.5),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 10,
  },
  buttonText: {
    fontSize: hp(1.8),
    color: 'white',
  },
});