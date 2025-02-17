import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { wp, hp } from '../helpers/common'
import {theme} from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper bg = "white">
      <StatusBar style="dark" />    
      <View style={styles.container}>
        {/* welcome image */}
        <Image style={styles.welcomeImage} resizeMode='contain' source={require('../assets/images/7.png')} />

        {/* title */}
        <View style={{ gap: 20 }}>
          <Text style={ styles.title }>Welcome to Carpegram</Text>
          {/* <Text style={ styles.punchline }>Hook memories, reel in moments!</Text> */}
          <Text style={ styles.punchline }>Catch the moment, connect with anglers!</Text>
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Button
            title='Getting Started'
            buttonStyle={{marginHorizontal: wp(3)}}
            onPress={()=>router.push('signUp')}
          />

          <View style={styles.bottomTextContainer}>
            <Text style={styles.loginText}>
              Already have an account!
            </Text>
            <Pressable onPress={()=>router.push('login')}>
            <Text style={[styles.loginText, {color: theme.colors.primary, fontWeight: theme.fonts.semiBold}]}>
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
    backgroundColor: 'white',
    paddingHorizontal: wp(4)
  },
  welcomeImage: {
    width: wp(60),
    height: wp(100)
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(4),
    fontWeight: theme.fonts.extraBold,
    textAlign: 'center'
  },
  punchline: {
    color: theme.colors.text,
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
    color: theme.colors.text,
    fontSize: hp(1.6)
  }
})