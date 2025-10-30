import { useState } from 'react';
import { Alert } from 'react-native';
import { createPost } from '../services/postService';

export const useCreatePost = (userId) => {
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [fishSpecies, setFishSpecies] = useState('');
  const [fishWeight, setFishWeight] = useState('');
  const [bait, setBait] = useState('');
  const [spot, setSpot] = useState('');
  const [privacy, setPrivacy] = useState('public');

  const validate = () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please add a description');
      return false;
    }
    if (description.trim().length < 3) {
      Alert.alert('Error', 'Description must be at least 3 characters');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setImageUri(null);
    setDescription('');
    setFishSpecies('');
    setFishWeight('');
    setBait('');
    setSpot('');
    setPrivacy('public');
  };

  const submitPost = async () => {
    if (!validate()) return false;

    setLoading(true);

    const postData = {
      user_id: userId,
      image_uri: imageUri,
      description: description.trim(),
      fish_species: fishSpecies.trim() || null,
      fish_weight: fishWeight ? parseFloat(fishWeight) : null,
      bait: bait.trim() || null,
      spot: spot.trim() || null,
      privacy,
    };

    const result = await createPost(postData);

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Post created successfully! 🎣');
      resetForm();
      return true;
    } else {
      Alert.alert('Error', result.error);
      return false;
    }
  };

  return {
    // State
    loading,
    imageUri,
    description,
    fishSpecies,
    fishWeight,
    bait,
    spot,
    privacy,
    
    // Setters
    setImageUri,
    setDescription,
    setFishSpecies,
    setFishWeight,
    setBait,
    setSpot,
    setPrivacy,
    
    // Actions
    submitPost,
    resetForm,
  };
};