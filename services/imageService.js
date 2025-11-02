import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import { Alert } from 'react-native'

export const pickAndUploadAvatar = async (userId, onSuccess) => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    // ✅ CORRECTION: Upload avec nom unique (timestamp) pour éviter le cache
    const uri = result.assets[0].uri;
    const fileExt = uri.split('.').pop().toLowerCase();
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // ✅ Supprimer l'ancien avatar d'abord pour économiser du storage
    const { data: oldProfile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();
    
    if (oldProfile?.avatar_url) {
      try {
        const oldFileName = oldProfile.avatar_url.split('/').pop();
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/${oldFileName}`]);
      } catch (e) {
        console.log('Old avatar deletion failed (non-critical):', e);
      }
    }

    // ✅ Upload le nouvel avatar avec nom unique
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    Alert.alert('Success', 'Profile picture updated!');
    
    if (onSuccess) onSuccess(urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    Alert.alert('Error', error.message);
    return null;
  }
}