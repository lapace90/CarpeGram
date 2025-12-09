// app/editProfile.jsx
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import ScreenWrapper from '../components/ScreenWrapper'
import { useTheme } from '../contexts/ThemeContext'
import { hp, wp } from '../helpers/common'
import { useRouter } from 'expo-router'
import Icon from '../assets/icons'
import Input from '../components/Input'
import Button from '../components/Button'
import BackButton from '../components/BackButton'
import ImageCropper from '../components/common/ImageCropper'
import { uploadAvatarImage } from '../services/imageService'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

const EditProfile = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const { profile, loading: profileLoading, updateProfile, refresh } = useProfile(user?.id);
    const [saving, setSaving] = useState(false);

    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [anglerSince, setAnglerSince] = useState('');
    const [showFullName, setShowFullName] = useState(false);

    // Cropper state
    const [showCropper, setShowCropper] = useState(false);
    const [tempImageUri, setTempImageUri] = useState(null);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setFirstName(profile.first_name || '');
            setLastName(profile.last_name || '');
            setBio(profile.bio || '');
            setLocation(profile.location || '');
            setAnglerSince(profile.angler_since?.toString() || '');
            setShowFullName(profile.show_full_name || false);
        }
    }, [profile]);

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
            setTempImageUri(result.assets[0].uri);
            setShowCropper(true);
        }
    };

    const handleCrop = async (croppedUri) => {
        setShowCropper(false);
        setTempImageUri(null);
        
        setSaving(true);
        const { url, error } = await uploadAvatarImage(user.id, croppedUri);
        setSaving(false);
        
        if (!error && url) {
            Alert.alert('Success', 'Profile picture updated!');
            refresh();
        } else {
            Alert.alert('Error', 'Failed to upload image');
        }
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        setTempImageUri(null);
    };

    const onSubmit = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Username is required');
            return;
        }

        setSaving(true);

        const updates = {
            username: username.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            bio: bio.trim(),
            location: location.trim(),
            angler_since: anglerSince.trim() ? parseInt(anglerSince) : null,
            show_full_name: showFullName,
        };

        const result = await updateProfile(updates);

        setSaving(false);

        if (result.success) {
            Alert.alert('Success', 'Profile updated successfully!');
            router.back();
        } else {
            Alert.alert('Error', result.error || 'Failed to update profile');
        }
    };

    if (profileLoading) {
        return (
            <ScreenWrapper bg={theme.colors.card}>
                <View style={styles.loading}>
                    <Text style={{ color: theme.colors.text }}>Loading...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bg={theme.colors.card}>
            <View style={styles.container}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.formContent}
                    showsVerticalScrollIndicator={false}
                >
                    <BackButton router={router} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                            Edit Profile
                        </Text>
                    </View>

                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/150' }}
                            style={[
                                styles.avatar, 
                                { 
                                    borderRadius: theme.radius.xxl * 1.8,
                                    borderColor: theme.colors.darkLight,
                                }
                            ]}
                        />
                        <Pressable 
                            style={[styles.cameraIcon, { backgroundColor: theme.colors.primary }]} 
                            onPress={pickImage}
                            disabled={saving}
                        >
                            <Icon name="camera" size={20} strokeWidth={2.5} color="white" />
                        </Pressable>
                    </View>

                    {/* Username */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Username *</Text>
                        <Input 
                            placeholder="Your username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* First Name */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>First Name</Text>
                        <Input 
                            placeholder="Your first name"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>

                    {/* Last Name */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Last Name</Text>
                        <Input 
                            placeholder="Your last name"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    {/* Show Full Name Toggle */}
                    <Pressable 
                        style={styles.toggleContainer}
                        onPress={() => setShowFullName(!showFullName)}
                    >
                        <View style={styles.toggleInfo}>
                            <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                                Show full name on profile
                            </Text>
                            <Text style={[styles.toggleHint, { color: theme.colors.textLight }]}>
                                When enabled, your full name will be visible to other users
                            </Text>
                        </View>
                        <View style={[
                            styles.toggle,
                            { backgroundColor: showFullName ? theme.colors.primary : theme.colors.gray }
                        ]}>
                            <View style={[
                                styles.toggleCircle,
                                showFullName && styles.toggleCircleActive
                            ]} />
                        </View>
                    </Pressable>

                    {/* Bio */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Bio</Text>
                        <Input 
                            placeholder="Tell us about yourself..."
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={3}
                            containerStyle={{ height: 100, alignItems: 'flex-start' }}
                        />
                    </View>

                    {/* Location */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Location</Text>
                        <Input 
                            placeholder="Your city or region"
                            value={location}
                            onChangeText={setLocation}
                            icon={<Icon name="mapPin" size={20} color={theme.colors.textLight} />}
                        />
                    </View>

                    {/* Angler Since */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Fishing since (year)</Text>
                        <Input 
                            placeholder="e.g., 2010"
                            value={anglerSince}
                            onChangeText={setAnglerSince}
                            keyboardType="numeric"
                            maxLength={4}
                            icon={<Icon name="calendar" size={20} color={theme.colors.textLight} />}
                        />
                    </View>

                    {/* Save Button */}
                    <Button 
                        title="Save Changes"
                        onPress={onSubmit}
                        loading={saving}
                        buttonStyle={{ marginTop: hp(2) }}
                    />

                </ScrollView>
            </View>

            {/* Image Cropper Modal */}
            <ImageCropper
                visible={showCropper}
                imageUri={tempImageUri}
                onCrop={handleCrop}
                onCancel={handleCancelCrop}
                cropShape="circle"
                initialAspectRatio="1:1"
                showAspectRatioSelector={false}
                outputSize={400}
            />
        </ScreenWrapper>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    formContent: {
        paddingBottom: hp(4),
    },
    header: {
        marginVertical: hp(2),
    },
    title: {
        fontSize: hp(3),
        textAlign: 'center',
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: hp(3),
    },
    avatar: {
        width: hp(14),
        height: hp(14),
        borderWidth: 3,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: -5,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    inputContainer: {
        marginBottom: hp(2),
    },
    label: {
        fontSize: hp(1.6),
        marginBottom: hp(0.5),
        fontWeight: '500',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: hp(1.5),
        marginBottom: hp(2),
    },
    toggleInfo: {
        flex: 1,
        marginRight: wp(3),
    },
    toggleLabel: {
        fontSize: hp(1.7),
        fontWeight: '500',
    },
    toggleHint: {
        fontSize: hp(1.4),
        marginTop: 2,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 2,
    },
    toggleCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
    },
    toggleCircleActive: {
        transform: [{ translateX: 22 }],
    },
});