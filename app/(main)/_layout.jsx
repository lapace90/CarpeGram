import { View, Text, StyleSheet, Pressable } from 'react-native'
import React, { useState } from 'react' // ← MODIFIE
import { Tabs, useRouter } from 'expo-router' // ← MODIFIE
import { theme } from '../../constants/theme'
import Icon from '../../assets/icons'
import { hp } from '../../helpers/common'
import CreateOptionsModal from '../../components/CreateOptionsModal' // ← AJOUTE

const TabIcon = ({ name, focused }) => {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Icon
        name={name}
        size={26}
        strokeWidth={focused ? 2.2 : 1.9}
        color={focused ? theme.colors.primary : theme.colors.textLight}
      />
    </View>
  )
}

const TabLayout = () => {
  const router = useRouter(); // ← AJOUTE
  const [showCreateModal, setShowCreateModal] = useState(false); // ← AJOUTE

  return (
    <>
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
            title: 'Create',
            tabBarIcon: ({ color }) => <Icon name="plus" size={26} color={color} />,
            tabBarButton: (props) => (
              <Pressable
                {...props}
                onPress={() => setShowCreateModal(true)}
              />
            ),
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
          name="notifications"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="post/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="chat/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="userProfile/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="event/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="createEvent"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>

      <CreateOptionsModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSelectPost={() => router.push('/newPost')}
        onSelectEvent={() => router.push('/createEvent')}
      />
    </>
  )
}

export default TabLayout