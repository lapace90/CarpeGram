import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { theme } from '../constants/theme';
import { commonStyles } from '../constants/commonStyles';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';

const ProfileTabs = ({ 
  activeTab, 
  onTabPress, 
  showSaved = true,
  postsCount = 0,
  sharedCount = 0,
  savedCount = 0,
}) => {
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  // Tabs configuration
  const tabs = [
    { id: 'posts', label: 'Posts', icon: 'image', count: postsCount },
    { id: 'shared', label: 'Shared', icon: 'share', count: sharedCount },
    ...(showSaved ? [{ id: 'saved', label: 'Saved', icon: 'bookmark', count: savedCount }] : []),
  ];

  const tabWidth = 100 / tabs.length; // Percentage

  // Animer l'indicateur quand la tab change
  useEffect(() => {
    const tabIndex = tabs.findIndex(tab => tab.id === activeTab);
    
    Animated.spring(indicatorPosition, {
      toValue: tabIndex * tabWidth,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
  }, [activeTab, tabs.length]);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, { width: `${tabWidth}%` }]}
              onPress={() => onTabPress(tab.id)}
            >
              <View style={[commonStyles.flexCenter, styles.tabContent]}>
                <Icon
                  name={tab.icon}
                  size={24}
                  color={isActive ? theme.colors.primary : theme.colors.textLight}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Count badge (optionnel) */}
                {tab.count > 0 && (
                  <Text style={[
                    styles.countText,
                    isActive && styles.countTextActive
                  ]}>
                    {tab.count}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Indicateur animé */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: `${tabWidth}%`,
            left: indicatorPosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />

      {/* Ligne de séparation */}
      <View style={styles.separator} />
    </View>
  );
};

export default ProfileTabs;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  tabsRow: {
    flexDirection: 'row',
    height: hp(6),
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    gap: 4,
  },
  countText: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  countTextActive: {
    color: theme.colors.text,
    fontWeight: theme.fonts.semiBold,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: theme.colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray,
  },
});