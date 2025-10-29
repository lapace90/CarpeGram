import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { hp } from '../../helpers/common'

const NewPost = () => {
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Text style={styles.title}>Nouvelle Prise 🎣</Text>
        <Text style={styles.subtitle}>Bientôt disponible...</Text>
      </View>
    </ScreenWrapper>
  )
}

export default NewPost

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: hp(2),
    color: theme.colors.textLight,
    marginTop: 10,
  },
})