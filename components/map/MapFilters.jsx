import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';

const FilterChip = ({ label, count, icon, active, onPress }) => (
  <Pressable
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
  >
    <Icon
      name={icon}
      size={16}
      color={active ? 'white' : theme.colors.text}
    />
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
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
      />
      
      <FilterChip
        label="Stores"
        count={storesCount}
        icon="home"
        active={showStores}
        onPress={onToggleStores}
      />
      
      <FilterChip
        label="Anglers"
        count={usersCount}
        icon="user"
        active={showUsers}
        onPress={onToggleUsers}
      />

      {onToggleEvents && (
        <FilterChip
          label="Events"
          count={eventsCount}
          icon="calendar"
          active={showEvents}
          onPress={onToggleEvents}
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
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    backgroundColor: 'white',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: hp(1.6),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  chipTextActive: {
    color: 'white',
  },
});