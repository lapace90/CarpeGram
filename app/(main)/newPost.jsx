import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react' // ← ENLEVE useState et useEffect inutiles
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { useRouter } from 'expo-router'
import Button from '../../components/Button'
import ImagePickerButton from '../../components/post/ImagePickerButton'
import PrivacySelector from '../../components/post/PrivacySelector'
import FishInfoForm from '../../components/post/FishInfoForm'
import { useCreatePost } from '../../hooks/useCreatePost'
import SmartInput from '../../components/SmartInput'
import { useAuth } from '../../hooks/useAuth' 

const NewPost = () => {
  const router = useRouter()
  const { user } = useAuth() 

  const {
    loading,
    imageUri,
    description,
    fishSpecies,
    fishWeight,
    bait,
    spot,
    privacy,
    setImageUri,
    setDescription,
    setFishSpecies,
    setFishWeight,
    setBait,
    setSpot,
    setPrivacy,
    submitPost,
  } = useCreatePost(user?.id)

  const handleSubmit = async () => {
    const success = await submitPost()
    if (success) {
      router.push('/home')
    }
  }

  return (
    <ScreenWrapper bg="white">
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Share Your Catch 🎣</Text>
          <Text style={styles.subtitle}>Show off your fishing success!</Text>
        </View>

        {/* Image Picker */}
        <ImagePickerButton
          imageUri={imageUri}
          onImageSelected={setImageUri}
        />

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <SmartInput
            placeholder="Tell your fishing story... 🐟"
            value={description}
            onChangeText={setDescription}
            currentUserId={user?.id}
            multiline
            numberOfLines={4}
            maxLength={1000}
            style={styles.descriptionTextInput}
          />
        </View>

        {/* Fish Info */}
        <FishInfoForm
          fishSpecies={fishSpecies}
          fishWeight={fishWeight}
          bait={bait}
          spot={spot}
          onSpeciesChange={setFishSpecies}
          onWeightChange={setFishWeight}
          onBaitChange={setBait}
          onSpotChange={setSpot}
        />

        {/* Privacy */}
        <PrivacySelector
          selected={privacy}
          onSelect={setPrivacy}
        />

        {/* Submit Button */}
        <Button
          title="Share Post"
          loading={loading}
          onPress={handleSubmit}
          buttonStyle={styles.submitButton}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </ScreenWrapper>
  )
}

export default NewPost

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  scrollContent: {
    paddingTop: 20,
    gap: 25,
  },
  header: {
    gap: 5,
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  descriptionInput: {
    height: hp(12),
    alignItems: 'flex-start',
    paddingTop: 15,
    backgroundColor: 'white',
  },
  descriptionTextInput: {
    height: hp(12),
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    paddingHorizontal: 18,
    paddingTop: 15,
    fontSize: hp(1.7),
    color: theme.colors.text,
    backgroundColor: 'white',
  },
  submitButton: {
    marginTop: 10,
  },
})