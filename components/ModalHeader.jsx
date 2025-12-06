import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { hp } from '../helpers/common';
import Icon from '../assets/icons';

const ModalHeader = ({ title, onClose, rightElement }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.gray }]}>
      <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
        {title}
      </Text>
      
      {rightElement ? (
        <View style={styles.rightContainer}>{rightElement}</View>
      ) : (
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Icon name="arrowLeft" size={24} color={theme.colors.text} />
        </Pressable>
      )}
    </View>
  );
};

export default ModalHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: hp(2.2),
  },
  closeButton: {
    padding: 8,
  },
  rightContainer: {
    padding: 8,
  },
});