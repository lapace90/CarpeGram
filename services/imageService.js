import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import { Alert } from 'react-native'

// Nuova funzione che restituisce l'URI per il cropper
export const pickAvatarImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to your photos');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
};

// Upload avatar già croppato
export const uploadCroppedAvatar = async (userId, croppedUri, onSuccess) => {
  try {
    const fileExt = croppedUri.split('.').pop().toLowerCase();
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

    const response = await fetch(croppedUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Elimina vecchio avatar
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

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
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
};