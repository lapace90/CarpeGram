import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { theme } from '../../constants/theme'
import Icon from '../../assets/icons'
import { hp } from '../../helpers/common'

const TabIcon = ({ name, focused }) => {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Icon
        name={name}
        size={26}
        strokeWidth={1.9}
        color={focused ? theme.colors.primary : theme.colors.textLight}
      />
    </View>
  )
}

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: theme.colors.gray,
          height: hp(10),
          paddingTop: 10,
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="newPost"
        options={{
          title: 'New Post',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="plus" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="userProfile/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  )
}

export default TabLayout