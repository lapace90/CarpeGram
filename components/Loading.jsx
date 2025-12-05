import { ActivityIndicator, View } from 'react-native'
import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const Loading = ({ size = 'large', color }) => {
  const { theme } = useTheme();
  
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={size} color={color || theme.colors.primary} />
    </View>
  )
}

export default Loading