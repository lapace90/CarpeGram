import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const logout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            setLoading(false);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              router.replace('/welcome');
            }
          },
        },
      ]
    );
  };

  return { logout, loading };
};