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

    // Upload
    const uri = result.assets[0].uri;
    const fileExt = uri.split('.').pop().toLowerCase();
    const fileName = `${userId}/avatar.${fileExt}`;

    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: true
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