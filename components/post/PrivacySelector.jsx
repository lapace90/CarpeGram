import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
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
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
        Who can see this post?
      </Text>
      
      <View style={styles.options}>
        {PRIVACY_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.option,
              { backgroundColor: theme.colors.gray, borderRadius: theme.radius.lg },
              selected === option.value && { 
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.primary + '08',
              }
            ]}
            onPress={() => onSelect(option.value)}
          >
            <View style={[styles.optionIcon, { backgroundColor: theme.colors.card }]}>
              <Icon
                name={option.icon}
                size={24}
                color={selected === option.value ? theme.colors.primary : theme.colors.textLight}
              />
            </View>
            
            <View style={styles.optionText}>
              <Text style={[
                styles.optionLabel,
                { fontWeight: theme.fonts.medium, color: theme.colors.text },
                selected === option.value && { 
                  color: theme.colors.primary,
                  fontWeight: theme.fonts.semiBold,
                }
              ]}>
                {option.label}
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.textLight }]}>
                {option.description}
              </Text>
            </View>

            {selected === option.value && (
              <View style={styles.checkmark}>
                <Icon name="check" size={18} color={theme.colors.primary} />
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
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  optionDescription: {
    fontSize: hp(1.5),
  },
  checkmark: {
    marginLeft: 8,
  },
});