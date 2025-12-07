import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';

const MapSearchBar = ({ value, onChangeText, placeholder = 'Search spots or stores...' }) => {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.container, 
      { backgroundColor: theme.colors.backgroundLight, borderRadius: theme.radius.xxl }
    ]}>
      <Icon name="search" size={20} color={theme.colors.textLight} />
      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={theme.colors.textLight}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={10}>
          <Icon name="delete" size={18} color={theme.colors.textLight} />
        </Pressable>
      )}
    </View>
  );
};

export default MapSearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(5),
    marginVertical: hp(1),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
  },
  input: {
    flex: 1,
    marginLeft: wp(2),
    fontSize: hp(1.8),
  },
});