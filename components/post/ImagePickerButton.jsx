import { View, Text, StyleSheet, Pressable, Alert } from 'react-native'
import { Image } from 'expo-image'
import React from 'react'
import * as ImagePicker from 'expo-image-picker'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'

const ImagePickerButton = ({ imageUri, onImageSelected }) => {

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (imageUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.preview} />
        <Pressable style={styles.changeButton} onPress={showOptions}>
          <Icon name="camera" size={20} color="white" />
          <Text style={styles.changeButtonText}>Change Photo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={styles.pickerButton} onPress={showOptions}>
      <Icon name="camera" size={50} color={theme.colors.primary} />
      <Text style={styles.pickerText}>Add a photo of your catch</Text>
      <Text style={styles.pickerSubtext}>Tap to take or select</Text>
    </Pressable>
  );
};

export default ImagePickerButton;

const styles = StyleSheet.create({
  pickerButton: {
    height: hp(30),
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: theme.colors.darkLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  pickerText: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  pickerSubtext: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: hp(30),
    borderRadius: theme.radius.xl,
  },
  changeButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: theme.radius.lg,
  },
  changeButtonText: {
    color: 'white',
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
  },
});