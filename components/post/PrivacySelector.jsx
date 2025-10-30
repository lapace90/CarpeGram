import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { theme } from '../../constants/theme'
import { hp } from '../../helpers/common'
import Icon from '../../assets/icons'

const PRIVACY_OPTIONS = [
  {
    value: 'public',
    icon: 'unlock',
    label: 'Public',
    description: 'Everyone can see this post',
  },
  {
    value: 'followers',
    icon: 'user',
    label: 'Followers',
    description: 'Only your followers',
  },
  {
    value: 'close_friends',
    icon: 'heart',
    label: 'Close Friends',
    description: 'Your close friends only',
  },
];

const PrivacySelector = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who can see this post?</Text>
      
      <View style={styles.options}>
        {PRIVACY_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.option,
              selected === option.value && styles.optionSelected
            ]}
            onPress={() => onSelect(option.value)}
          >
            <View style={styles.optionIcon}>
              <Icon
                name={option.icon}
                size={24}
                color={selected === option.value ? theme.colors.primary : theme.colors.textLight}
              />
            </View>
            
            <View style={styles.optionText}>
              <Text style={[
                styles.optionLabel,
                selected === option.value && styles.optionLabelSelected
              ]}>
                {option.label}
              </Text>
              <Text style={styles.optionDescription}>
                {option.description}
              </Text>
            </View>

            {selected === option.value && (
              <View style={styles.checkmark}>
                <Icon name="heart" size={18} color={theme.colors.primary} />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default PrivacySelector;

const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  title: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0, 194, 47, 0.05)',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
  optionDescription: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  checkmark: {
    marginLeft: 8,
  },
});