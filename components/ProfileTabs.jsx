import { View, Pressable, StyleSheet, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { commonStyles } from '../constants/commonStyles';
import { hp } from '../helpers/common';
import Icon from '../assets/icons';

const ProfileTabs = ({ 
  activeTab, 
  onTabPress, 
  showSaved = true,
}) => {
  const { theme } = useTheme();
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  const tabs = [
    { id: 'posts', label: 'Posts', icon: 'image' },
    { id: 'shared', label: 'Shared', icon: 'share' },
    ...(showSaved ? [{ id: 'saved', label: 'Saved', icon: 'bookmark' }] : []),
  ];

  const tabWidth = 100 / tabs.length;

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
    <View style={[styles.container, { borderBottomColor: theme.colors.gray }]}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, { width: `${tabWidth}%` }]}
              onPress={() => onTabPress(tab.id)}
            >
              <View style={[commonStyles.center, styles.tabContent]}>
                <Icon
                  name={tab.icon}
                  size={24}
                  color={isActive ? theme.colors.primary : theme.colors.textLight}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: theme.colors.text },
          {
            width: `${tabWidth}%`,
            left: indicatorPosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />

      <View style={[styles.separator, { backgroundColor: theme.colors.gray }]} />
    </View>
  );
};

export default ProfileTabs;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
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
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
  },
  separator: {
    height: 1,
  },
});