import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import { supabase } from '../lib/supabase'
import { useRouter } from 'expo-router'
import Icon from '../assets/icons'
import Input from '../components/Input'
import Button from '../components/Button'
import BackButton from '../components/BackButton'
import { pickAndUploadAvatar } from '../services/imageService'
import { useAuth } from '../../hooks/useAuth'

const EditProfile = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [anglerSince, setAnglerSince] = useState('');
    const [showFullName, setShowFullName] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);

        const { user } = useAuth();
        setUser(user);

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUsername(profile.username || '');
                setFirstName(profile.first_name || '');
                setLastName(profile.last_name || '');
                setBio(profile.bio || '');
                setLocation(profile.location || '');
                setAnglerSince(profile.angler_since?.toString() || '');
                setShowFullName(profile.show_full_name || false);
                setAvatarUrl(profile.avatar_url || '');
            }
        }

        setLoading(false);
    }

    const pickImage = async () => {
        console.log('🎯 EditProfile: pickImage called');
        console.log('User ID:', user?.id);

        setLoading(true);
        const newUrl = await pickAndUploadAvatar(user.id, (url) => {
            console.log('✅ EditProfile: Callback received URL:', url);
            setAvatarUrl(url);
        });
        console.log('📸 EditProfile: Final newUrl:', newUrl);
        setLoading(false);
    }

    const onSubmit = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Username is required');
            return;
        }

        const usernameRegex = /^[a-z0-9_]{3,30}$/;
        if (!usernameRegex.test(username)) {
            Alert.alert('Error', 'Username must be 3-30 characters (lowercase, numbers, underscore only)');
            return;
        }

        setLoading(true);

        try {
            const updates = {
                username: username.toLowerCase().trim(),
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                bio: bio.trim(),
                location: location.trim(),
                angler_since: anglerSince ? parseInt(anglerSince) : null,
                show_full_name: showFullName,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) {
                if (error.code === '23505') {
                    Alert.alert('Error', 'This username is already taken');
                } else {
                    throw error;
                }
            } else {
                Alert.alert('Success', 'Profile updated successfully!');
                router.back();
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenWrapper bg="white">
            <View style={styles.container}>
                <BackButton router={router} />

                <Text style={styles.title}>Edit Profile</Text>

                <ScrollView
                    style={styles.form}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.formContent}
                >
                    <View style={styles.avatarSection}>
                        <Pressable onPress={pickImage} style={styles.avatarContainer}>
                            {avatarUrl ? (
                                <Image source={{ uri: `${avatarUrl}?t=${Date.now()}` }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Icon name="user" size={60} color={theme.colors.primary} />
                                </View>
                            )}
                            <View style={styles.cameraIcon}>
                                <Icon name="camera" size={18} color="white" />
                            </View>
                        </Pressable>
                        <Text style={styles.avatarLabel}>Change Profile Picture</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username *</Text>
                        <Input
                            placeholder="username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First Name</Text>
                        <Input
                            placeholder="John"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last Name</Text>
                        <Input
                            placeholder="Doe"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    <Pressable
                        style={styles.toggleRow}
                        onPress={() => setShowFullName(!showFullName)}
                    >
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>Show full name publicly</Text>
                            <Text style={styles.toggleDescription}>
                                Display your full name on your profile
                            </Text>
                        </View>
                        <View style={[styles.toggle, showFullName && styles.toggleActive]}>
                            {showFullName && <View style={styles.toggleDot} />}
                        </View>
                    </Pressable>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <Input
                            placeholder="Tell us about yourself..."
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            containerStyles={{ height: hp(12), alignItems: 'flex-start', paddingTop: 15 }}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location</Text>
                        <Input
                            icon={<Icon name="location" size={24} strokeWidth={1.6} />}
                            placeholder="City, Country"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Angler Since</Text>
                        <Input
                            placeholder="2010"
                            value={anglerSince}
                            onChangeText={setAnglerSince}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                    </View>

                    <Button
                        title="Save Changes"
                        loading={loading}
                        onPress={onSubmit}
                        buttonStyle={{ marginTop: 20 }}
                    />

                    <View style={{ height: 50 }} />
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
        gap: 20,
    },
    title: {
        fontSize: hp(3.5),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    form: {
        flex: 1,
    },
    formContent: {
        gap: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: hp(14),
        height: hp(14),
        borderRadius: hp(7),
    },
    avatarPlaceholder: {
        width: hp(14),
        height: hp(14),
        borderRadius: hp(7),
        backgroundColor: theme.colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 35,
        height: 35,
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    avatarLabel: {
        fontSize: hp(1.6),
        color: theme.colors.textLight,
        marginTop: 10,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: hp(1.8),
        fontWeight: theme.fonts.medium,
        color: theme.colors.text,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        backgroundColor: theme.colors.gray,
        borderRadius: theme.radius.xl,
    },
    toggleInfo: {
        flex: 1,
        gap: 4,
    },
    toggleLabel: {
        fontSize: hp(1.8),
        fontWeight: theme.fonts.medium,
        color: theme.colors.text,
    },
    toggleDescription: {
        fontSize: hp(1.5),
        color: theme.colors.textLight,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.darkLight,
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    toggleActive: {
        backgroundColor: theme.colors.primary,
        alignItems: 'flex-end',
    },
    toggleDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'white',
    },
})