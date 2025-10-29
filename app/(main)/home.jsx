import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'
import Button from '../../components/Button'

const Home = () => {
  const router = useRouter();
  
  const onLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/welcome');
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Home! 🎉</Text>
        <Text style={styles.subtitle}>You're successfully logged in!</Text>
        
        <Button 
          title="Logout" 
          onPress={onLogout}
          buttonStyle={styles.logoutButton}
        />
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    paddingHorizontal: wp(5)
  },
  title: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text
  },
  subtitle: {
    fontSize: hp(2),
    color: theme.colors.textLight
  },
  logoutButton: {
    marginTop: 20,
    width: wp(50)
  }
})