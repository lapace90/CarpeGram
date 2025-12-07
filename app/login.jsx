import { Alert, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { useRouter } from 'expo-router'
import { useTheme } from '../contexts/ThemeContext'
import Icon from '../assets/icons/index'
import BackButton from '../components/BackButton'
import { hp, wp } from '../helpers/common'
import Input from '../components/Input'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

const Login = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if(!emailRef.current || !passwordRef.current){
      Alert.alert('Login', 'Please, fill all the fields!');
      return;
    }
    
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false);

    if (error) {
      Alert.alert('Login', error.message);
    } else if (session) {
      router.replace('/home');
    }
  }

  return (
    <ScreenWrapper bg={theme.colors.card}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* welcome */}
        <View>
          <Text style={[styles.welcomeText, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            Hey,
          </Text>
          <Text style={[styles.welcomeText, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            Welcome Back!
          </Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please, login to continue
          </Text>
          <Input 
            icon={<Icon name="mail" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
            placeholder='Enter your email'
            onChangeText={value=> emailRef.current = value}
          />
          <Input 
            icon={<Icon name="lock" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
            placeholder='Enter your password'
            secureTextEntry
            onChangeText={value=> passwordRef.current = value}
          />
          <Text style={[styles.forgotPassword, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
            Forgot Password?
          </Text>

          {/* button */}
          <Button title={'Login'} loading={loading} onPress={onSubmit} />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.text }]}>
            Don't have an account?
          </Text>
          <Pressable onPress={()=> router.push('signUp')}>
            <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semiBold }]}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  footerText: {
    textAlign: 'center',
    fontSize: hp(1.6)
  }
})