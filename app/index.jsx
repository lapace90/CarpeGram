import { View, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    // Vérifie si l'utilisateur est déjà connecté
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Utilisateur connecté → va vers l'app (à créer plus tard)
        router.replace('/home') // On créera cette page plus tardR
      } else {
        // Pas connecté → va vers welcome
        router.replace('/welcome')
      }
    })
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#00C22F" />
    </View>
  )
}

export default Index