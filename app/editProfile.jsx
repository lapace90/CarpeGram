import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { useTheme } from '../contexts/ThemeContext'
import { hp, wp } from '../helpers/common'
import { useRouter } from 'expo-router'
import Icon from '../assets/icons'
import Input from '../components/Input'
import Button from '../components/Button'
import BackButton from '../components/BackButton'
import { pickAndUploadAvatar } from '../services/imageService'
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
                        >
                            <Icon name="camera" size={20} strokeWidth={2.5} color={theme.colors.card} />
                        </Pressable>
                    </View>

                    {/* Form Fields with proper spacing */}
                    <View style={styles.inputWrapper}>
                        <Input
                            icon={<Icon name="user" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
                            placeholder='Username'
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Input
                            icon={<Icon name="user" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
                            placeholder='First Name'
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Input
                            icon={<Icon name="user" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
                            placeholder='Last Name'
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    {/* Show Full Name Toggle */}
                    <Pressable
                        style={[
                            styles.toggleRow, 
                            { 
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.text,
                                borderRadius: theme.radius.xxl,
                            }
                        ]}
                        onPress={() => setShowFullName(!showFullName)}
                    >
                        <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                            Show full name on profile
                        </Text>
                        <View style={[
                            styles.toggle, 
                            { backgroundColor: theme.colors.gray },
                            showFullName && { backgroundColor: theme.colors.primary }
                        ]}>
                            <View style={[
                                styles.toggleThumb, 
                                { backgroundColor: theme.colors.card },
                                showFullName && styles.toggleThumbActive
                            ]} />
                        </View>
                    </Pressable>

                    <View style={styles.inputWrapper}>
                        <Input
                            placeholder='Bio'
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            containerStyles={styles.bio}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Input
                            icon={<Icon name="location" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
                            placeholder='Location'
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Input
                            icon={<Icon name="calendar" size={26} strokeWidth={1.6} color={theme.colors.textLight} />}
                            placeholder='Angler since (year)'
                            value={anglerSince}
                            onChangeText={setAnglerSince}
                            keyboardType="number-pad"
                        />
                    </View>

                    <View style={styles.buttonWrapper}>
                        <Button
                            title='Save Changes'
                            loading={saving}
                            onPress={onSubmit}
                        />
                    </View>
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
    scrollView: {
        flex: 1,
    },
    formContent: {
        paddingBottom: hp(5),
    },
    header: {
        marginTop: hp(2),
        marginBottom: hp(2),
    },
    title: {
        fontSize: hp(3),
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: hp(4),
    },
    avatar: {
        height: hp(14),
        width: hp(14),
        borderWidth: 1,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: -10,
        padding: 8,
        borderRadius: 50,
    },
    inputWrapper: {
        marginBottom: hp(2),
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 18,
        borderWidth: 0.4,
        marginBottom: hp(2),
    },
    toggleLabel: {
        fontSize: hp(1.8),
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 2,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    bio: {
        height: hp(10),
        alignItems: 'flex-start',
        paddingTop: 15,
    },
    buttonWrapper: {
        marginTop: hp(2),
        marginBottom: hp(3),
    },
})