// components/post/ImagePickerButton.jsx
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { useTheme } from '../../contexts/ThemeContext'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import ImageCropper from '../common/ImageCropper'

const ImagePickerButton = ({ imageUri, onImageSelected }) => {
  const { theme } = useTheme();
  const [showCropper, setShowCropper] = useState(false);
  const [tempUri, setTempUri] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setTempUri(result.assets[0].uri);
      setShowCropper(true);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setTempUri(result.assets[0].uri);
      setShowCropper(true);
    }
  };

  const handleCrop = (croppedUri) => {
    onImageSelected(croppedUri);
    setShowCropper(false);
    setTempUri(null);
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
        <Image source={{ uri: imageUri }} style={[styles.preview, { borderRadius: theme.radius.xl }]} />
        <Pressable 
          style={[styles.changeButton, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.lg }]} 
          onPress={showOptions}
        >
          <Icon name="camera" size={20} color={theme.colors.card} />
          <Text style={[styles.changeButtonText, { fontWeight: theme.fonts.semiBold }]}>
            Change Photo
          </Text>
        </Pressable>

        <ImageCropper
          visible={showCropper}
          imageUri={tempUri}
          onCrop={handleCrop}
          onCancel={() => { setShowCropper(false); setTempUri(null); }}
          cropShape="square"
          initialAspectRatio="1:1"
          showAspectRatioSelector={true}
          outputSize={1080}
        />
      </View>
    );
  }

  return (
    <>
      <Pressable 
        style={[
          styles.pickerButton, 
          { 
            backgroundColor: theme.colors.gray,
            borderRadius: theme.radius.xl,
            borderColor: theme.colors.darkLight,
          }
        ]} 
        onPress={showOptions}
      >
        <Icon name="camera" size={50} color={theme.colors.primary} />
        <Text style={[styles.pickerText, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
          Add a photo of your catch
        </Text>
        <Text style={[styles.pickerSubtext, { color: theme.colors.textLight }]}>
          Tap to take or select
        </Text>
      </Pressable>

      <ImageCropper
        visible={showCropper}
        imageUri={tempUri}
        onCrop={handleCrop}
        onCancel={() => { setShowCropper(false); setTempUri(null); }}
        cropShape="square"
        initialAspectRatio="1:1"
        showAspectRatioSelector={true}
        outputSize={1080}
      />
    </>
  );
};

export default ImagePickerButton;

const styles = StyleSheet.create({
  pickerButton: {
    height: hp(30),
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  pickerText: {
    fontSize: hp(2),
  },
  pickerSubtext: {
    fontSize: hp(1.6),
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: hp(30),
  },
  changeButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  changeButtonText: {
    color: 'white',
    fontSize: hp(1.6),
  },
});