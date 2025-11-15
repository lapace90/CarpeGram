import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import { useRouter } from 'expo-router'
import Icon from '../assets/icons'
import Input from '../components/Input'
import Button from '../components/Button'
import BackButton from '../components/BackButton'
import { pickAndUploadAvatar } from '../services/imageService'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

const EditProfile = () => {
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
        setSaving(true);
        await pickAndUploadAvatar(user.id, refresh);
        setSaving(false);
    }

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
    }

    if (profileLoading) {
        return (
            <ScreenWrapper bg="white">
                <View style={styles.loading}>
                    <Text>Loading...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bg="white">
            <View style={styles.container}>
                <ScrollView style={styles.form}>
                    <BackButton router={router} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Edit Profile</Text>
                    </View>

                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <Pressable style={styles.cameraIcon} onPress={pickImage}>
                            <Icon name="camera" size={20} strokeWidth={2.5} color="white" />
                        </Pressable>
                    </View>

                    {/* Form */}
                    <Input
                        icon={<Icon name="user" size={26} strokeWidth={1.6} />}
                        placeholder='Username'
                        value={username}
                        onChangeText={setUsername}
                    />

                    <Input
                        icon={<Icon name="user" size={26} strokeWidth={1.6} />}
                        placeholder='First Name'
                        value={firstName}
                        onChangeText={setFirstName}
                    />

                    <Input
                        icon={<Icon name="user" size={26} strokeWidth={1.6} />}
                        placeholder='Last Name'
                        value={lastName}
                        onChangeText={setLastName}
                    />

                    {/* Show Full Name Toggle */}
                    <Pressable
                        style={styles.toggleRow}
                        onPress={() => setShowFullName(!showFullName)}
                    >
                        <Text style={styles.toggleLabel}>Show full name on profile</Text>
                        <View style={[styles.toggle, showFullName && styles.toggleActive]}>
                            <View style={[styles.toggleThumb, showFullName && styles.toggleThumbActive]} />
                        </View>
                    </Pressable>

                    <Input
                        placeholder='Bio'
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        containerStyles={styles.bio}
                    />

                    <Input
                        icon={<Icon name="location" size={26} strokeWidth={1.6} />}
                        placeholder='Location'
                        value={location}
                        onChangeText={setLocation}
                    />

                    <Input
                        icon={<Icon name="call" size={26} strokeWidth={1.6} />}
                        placeholder='Angler since (year)'
                        value={anglerSince}
                        onChangeText={setAnglerSince}
                        keyboardType="number-pad"
                    />

                    <Button
                        title='Save Changes'
                        loading={saving}
                        onPress={onSubmit}
                    />
                </ScrollView>
            </View>
        </ScreenWrapper>
    )
}

export default EditProfile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(5),
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        gap: 25,
    },
    header: {
        marginTop: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: hp(3),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 30,
    },
    avatar: {
        height: hp(14),
        width: hp(14),
        borderRadius: theme.radius.xxl * 1.8,
        borderWidth: 1,
        borderColor: theme.colors.darkLight,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: -10,
        padding: 8,
        borderRadius: 50,
        backgroundColor: theme.colors.primary,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 18,
        backgroundColor: 'white',
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xxl,
        marginBottom: 25,
    },
    toggleLabel: {
        fontSize: hp(1.8),
        color: theme.colors.text,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.gray,
        padding: 2,
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: theme.colors.primary,
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    bio: {
        height: hp(10),
        alignItems: 'flex-start',
        paddingTop: 15,
    },
})