import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';

const FilterChip = ({ label, count, icon, active, onPress, theme }) => (
  <Pressable
    style={[
      styles.chip, 
      { borderRadius: theme.radius.xl, borderColor: theme.colors.gray, backgroundColor: theme.colors.card },
      active && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
    ]}
    onPress={onPress}
  >
    <Icon
      name={icon}
      size={16}
      color={active ? theme.colors.card : theme.colors.text}
    />
    <Text style={[
      styles.chipText, 
      { color: theme.colors.text, fontWeight: theme.fonts.medium },
      active && { color: theme.colors.card }
    ]}>
      {label} ({count})
    </Text>
  </Pressable>
);

const MapFilters = ({
  showSpots,
  showStores,
  showUsers,
  showEvents,
  spotsCount = 0,
  storesCount = 0,
  usersCount = 0,
  eventsCount = 0,
  onToggleSpots,
  onToggleStores,
  onToggleUsers,
  onToggleEvents,
}) => {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <FilterChip
        label="Spots"
        count={spotsCount}
        icon="location"
        active={showSpots}
        onPress={onToggleSpots}
        theme={theme}
      />
      
      <FilterChip
        label="Stores"
        count={storesCount}
        icon="home"
        active={showStores}
        onPress={onToggleStores}
        theme={theme}
      />
      
      <FilterChip
        label="Anglers"
        count={usersCount}
        icon="user"
        active={showUsers}
        onPress={onToggleUsers}
        theme={theme}
      />

      {onToggleEvents && (
        <FilterChip
          label="Events"
          count={eventsCount}
          icon="calendar"
          active={showEvents}
          onPress={onToggleEvents}
          theme={theme}
        />
      )}
    </ScrollView>
  );
};

export default MapFilters;

const styles = StyleSheet.create({
  container: {
    maxHeight: hp(6),
  },
  content: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(1),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    marginRight: wp(2),
    borderWidth: 1,
  },
  chipText: {
    fontSize: hp(1.6),
  },
});