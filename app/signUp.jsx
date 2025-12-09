import { Alert, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/common/ScreenWrapper'
import { useRouter } from 'expo-router'
import { useTheme } from '../contexts/ThemeContext'
import Icon from '../assets/icons/index'
import BackButton from '../components/common/BackButton'
import { hp, wp } from '../helpers/common'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { supabase } from '../lib/supabase'

const SignUp = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const emailRef = useRef("");
  const firstNameRef = useRef("");
  const lastNameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Sign Up', 'Please, fill all the fields!');
      return;
    }

    let first_name = firstNameRef.current.trim();
    let last_name = lastNameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name
        }
      }
    })

    setLoading(false);

    if (error) {
      Alert.alert('Sign Up', error.message);
    } else if (session) {
      Alert.alert('Success', 'Account created successfully!');
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
            Let's
          </Text>
          <Text style={[styles.welcomeText, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
            Get Started!
          </Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please, fill the form to create a new account.
          </Text>
          <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
            placeholder='Enter your first name'
            onChangeText={value => firstNameRef.current = value}
          />
          <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
            placeholder='Enter your last name'
            onChangeText={value => lastNameRef.current = value}
          />
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
            placeholder='Enter your email'
            onChangeText={value => emailRef.current = value}
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
            placeholder='Enter your password'
            secureTextEntry
            onChangeText={value => passwordRef.current = value}
          />

          {/* button */}
          <Button title={'Sign Up'} loading={loading} onPress={onSubmit} />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.text }]}>
            Already have an account?
          </Text>
          <Pressable onPress={() => router.push('login')}>
            <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semiBold }]}>
              Login
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default SignUp

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