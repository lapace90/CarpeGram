import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { wp, hp } from '../helpers/common'
import { useTheme } from '../contexts/ThemeContext'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper bg={theme.colors.card}>
      <StatusBar style="dark" />    
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        {/* welcome image */}
        <Image 
          style={styles.welcomeImage} 
          resizeMode='contain' 
          source={require('../assets/images/7.png')} 
        />

        {/* title */}
        <View style={{ gap: 20 }}>
          <Text style={[styles.title, { color: theme.colors.text, fontWeight: theme.fonts.extraBold }]}>
            Welcome to Carpegram
          </Text>
          <Text style={[styles.punchline, { color: theme.colors.text }]}>
            Catch the moment, connect with anglers!
          </Text>
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Button
            title='Getting Started'
            buttonStyle={{marginHorizontal: wp(3)}}
            onPress={()=>router.push('signUp')}
          />

          <View style={styles.bottomTextContainer}>
            <Text style={[styles.loginText, { color: theme.colors.text }]}>
              Already have an account!
            </Text>
            <Pressable onPress={()=>router.push('login')}>
              <Text style={[styles.loginText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semiBold }]}>
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: wp(4)
  },
  welcomeImage: {
    width: wp(60),
    height: wp(100)
  },
  title: {
    fontSize: hp(4),
    textAlign: 'center'
  },
  punchline: {
    paddingHorizontal: wp(10),
    fontSize: hp(1.7),
    textAlign: 'center'
  },
  footer:{
    gap: 30,
    width: '100%'
  },
  bottomTextContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  loginText:{
    textAlign: 'center',
    fontSize: hp(1.6)
  }
})