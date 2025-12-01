import { View, StyleSheet, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps'
import { Platform, StatusBar, Alert } from 'react-native'
import { theme } from '../../constants/theme'
import { useMap } from '../../hooks/useMap'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { useAuth } from '../../contexts/AuthContext'
import { mapService } from '../../services/mapService'

const Map = () => {
    const mapRef = useRef(null)
    const { user } = useAuth()
    const {
        spots,
        stores,
        users,
        loading,
        getCurrentLocation,
        loadMapData
    } = useMap()

    const [region, setRegion] = useState(null)
    const [searchText, setSearchText] = useState('')
    const [showSpots, setShowSpots] = useState(true)
    const [showStores, setShowStores] = useState(true)
    const [showUsers, setShowUsers] = useState(true)

    // Pour la création de spot
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newSpotCoords, setNewSpotCoords] = useState(null)
    const [newSpotName, setNewSpotName] = useState('')
    const [newSpotDescription, setNewSpotDescription] = useState('')
    const [newSpotPrivacy, setNewSpotPrivacy] = useState('public')
    const [creating, setCreating] = useState(false)
    const [newSpotType, setNewSpotType] = useState('lake')
    const [newSpotFishTypes, setNewSpotFishTypes] = useState([])

    const privacyOptions = [
        { value: 'public', icon: 'unlock', label: 'Public' },
        { value: 'followers', icon: 'user', label: 'Followers' },
        { value: 'close_friends', icon: 'heart', label: 'Close Friends' },
        { value: 'private', icon: 'lock', label: 'Private' }
    ];

    const spotTypes = [
        { value: 'lake', label: 'Lake' },
        { value: 'river', label: 'River' },
        { value: 'pond', label: 'Pond' },
        { value: 'canal', label: 'Canal' },
        { value: 'sea', label: 'Sea' }
    ];

    const fishTypes = [
        'Carp', 'Pike', 'Catfish', 'Black bass',
        'Zander', 'Perch', 'Roach', 'Tench', 'Grass carp'
    ]

    useEffect(() => {
        setupMap()
    }, [])

    const setupMap = async () => {
        const location = await getCurrentLocation()

        const initialRegion = {
            latitude: location?.latitude || 43.2965,
            longitude: location?.longitude || 5.3698,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }

        setRegion(initialRegion)

        const bounds = {
            northEast: {
                latitude: initialRegion.latitude + initialRegion.latitudeDelta / 2,
                longitude: initialRegion.longitude + initialRegion.longitudeDelta / 2,
            },
            southWest: {
                latitude: initialRegion.latitude - initialRegion.latitudeDelta / 2,
                longitude: initialRegion.longitude - initialRegion.longitudeDelta / 2,
            },
        }
        loadMapData(bounds)
    }

    const handleRegionChange = (newRegion) => {
        const bounds = {
            northEast: {
                latitude: newRegion.latitude + newRegion.latitudeDelta / 2,
                longitude: newRegion.longitude + newRegion.longitudeDelta / 2,
            },
            southWest: {
                latitude: newRegion.latitude - newRegion.latitudeDelta / 2,
                longitude: newRegion.longitude - newRegion.longitudeDelta / 2,
            },
        }
        loadMapData(bounds)
    }

    // Gestion du long press pour créer un spot
    const handleLongPress = (e) => {
        if (!user) {
            Alert.alert('Login required', 'Please login to add a spot')
            return
        }
        setNewSpotCoords(e.nativeEvent.coordinate)
        setShowCreateModal(true)
    }

    // Créer le nouveau spot
    const handleCreateSpot = async () => {
        if (!newSpotName.trim()) {
            Alert.alert('Error', 'Spot name is required')
            return
        }

        setCreating(true)
        const result = await mapService.createSpot({
            name: newSpotName,
            description: newSpotDescription,
            latitude: newSpotCoords.latitude,
            longitude: newSpotCoords.longitude,
            spot_type: newSpotPrivacy,
            fish_types: newSpotFishTypes,
            water_type: newSpotType
        })

        if (result.success) {
            Alert.alert('Success', 'Spot created successfully!')
            setShowCreateModal(false)
            setNewSpotName('')
            setNewSpotDescription('')
            setNewSpotPrivacy('public')
            setNewSpotCoords(null)

            // Recharger les données
            handleRegionChange(region)
        } else {
            Alert.alert('Error', result.error || 'Failed to create spot')
        }
        setCreating(false)
    }

    if (!region) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        )
    }

    // Filtrer les éléments selon la recherche
    const filteredSpots = showSpots ? spots.filter(s =>
        s.name?.toLowerCase().includes(searchText.toLowerCase())
    ) : []

    const filteredStores = showStores ? stores.filter(s =>
        s.name?.toLowerCase().includes(searchText.toLowerCase())
    ) : []

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Map</Text>
                <View style={styles.headerButtons}>
                    <Pressable onPress={setupMap} style={styles.locationButton}>
                        <Icon name="location" size={24} color={theme.colors.primary} />
                    </Pressable>
                    <Pressable
                        onPress={() => Alert.alert('Help', 'Long press on the map to add a spot')}
                        style={styles.helpButton}
                    >
                        <Icon name="info" size={24} color={theme.colors.textLight} />
                    </Pressable>
                </View>
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color={theme.colors.textLight} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search spots or stores..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor={theme.colors.textLight}
                />
                {searchText.length > 0 && (
                    <Pressable onPress={() => setSearchText('')}>
                        <Icon name="close" size={20} color={theme.colors.textLight} />
                    </Pressable>
                )}
            </View>

            {/* Filtres */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
            >
                <Pressable
                    style={[styles.filterChip, showSpots && styles.filterChipActive]}
                    onPress={() => setShowSpots(!showSpots)}
                >
                    <Icon
                        name="location"
                        size={16}
                        color={showSpots ? 'white' : theme.colors.text}
                    />
                    <Text style={[styles.filterText, showSpots && styles.filterTextActive]}>
                        Spots ({spots.length})
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.filterChip, showStores && styles.filterChipActive]}
                    onPress={() => setShowStores(!showStores)}
                >
                    <Icon
                        name="home"
                        size={16}
                        color={showStores ? 'white' : theme.colors.text}
                    />
                    <Text style={[styles.filterText, showStores && styles.filterTextActive]}>
                        Stores ({stores.length})
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.filterChip, showUsers && styles.filterChipActive]}
                    onPress={() => setShowUsers(!showUsers)}
                >
                    <Icon
                        name="user"
                        size={16}
                        color={showUsers ? 'white' : theme.colors.text}
                    />
                    <Text style={[styles.filterText, showUsers && styles.filterTextActive]}>
                        Anglers ({users.length})
                    </Text>
                </Pressable>
            </ScrollView>

            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                initialRegion={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
                onRegionChangeComplete={handleRegionChange}
                onLongPress={handleLongPress}
            >
                {/* Marker temporaire pour le nouveau spot */}
                {newSpotCoords && (
                    <Marker
                        coordinate={newSpotCoords}
                        pinColor="yellow"
                        title="New Spot"
                    />
                )}

                {filteredSpots.map((spot) => (
                    <Marker
                        key={spot.id}
                        coordinate={{
                            latitude: parseFloat(spot.latitude),
                            longitude: parseFloat(spot.longitude),
                        }}
                        title={spot.name}
                        description={spot.description}
                        pinColor={theme.colors.primary}
                    />
                ))}

                {filteredStores.map((store) => (
                    <Marker
                        key={store.id}
                        coordinate={{
                            latitude: parseFloat(store.latitude),
                            longitude: parseFloat(store.longitude),
                        }}
                        title={store.name}
                        description={store.address}
                        pinColor="blue"
                    />
                ))}

                {showUsers && users.map((user) => (
                    <Marker
                        key={user.user_id}
                        coordinate={{
                            latitude: parseFloat(user.latitude),
                            longitude: parseFloat(user.longitude),
                        }}
                        title="Angler"
                        pinColor="green"
                    />
                ))}
            </MapView>

            {/* Modal de création de spot */}
            <Modal
                visible={showCreateModal}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Spot</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Spot name *"
                            value={newSpotName}
                            onChangeText={setNewSpotName}
                            placeholderTextColor={theme.colors.textLight}
                        />
                        <View style={styles.spotTypeContainer}>
                            <Text style={styles.label}>Spot type :</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {spotTypes.map(type => (
                                    <Pressable
                                        key={type.value}
                                        style={[styles.typeOption, newSpotType === type.value && styles.typeActive]}
                                        onPress={() => setNewSpotType(type.value)}
                                    >
                                        <Text style={[styles.typeText, newSpotType === type.value && styles.typeTextActive]}>
                                            {type.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.fishContainer}>
                            <Text style={styles.label}>Fish species :</Text>
                            <View style={styles.fishGrid}>
                                {fishTypes.map(fish => (
                                    <Pressable
                                        key={fish}
                                        style={[styles.fishChip, newSpotFishTypes.includes(fish) && styles.fishChipActive]}
                                        onPress={() => {
                                            if (newSpotFishTypes.includes(fish)) {
                                                setNewSpotFishTypes(newSpotFishTypes.filter(f => f !== fish))
                                            } else {
                                                setNewSpotFishTypes([...newSpotFishTypes, fish])
                                            }
                                        }}
                                    >
                                        <Text style={[styles.fishText, newSpotFishTypes.includes(fish) && styles.fishTextActive]}>
                                            {fish}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Description (optional)"
                            value={newSpotDescription}
                            onChangeText={setNewSpotDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor={theme.colors.textLight}
                        />

                        <View style={styles.privacyContainer}>
                            <Text style={styles.privacyLabel}>Who can see this spot :</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.privacyScroll}>
                                {privacyOptions.map(option => (
                                    <Pressable
                                        key={option.value}
                                        style={[styles.privacyOption, newSpotPrivacy === option.value && styles.privacyActive]}
                                        onPress={() => setNewSpotPrivacy(option.value)}
                                    >
                                        <Icon
                                            name={option.icon}
                                            size={16}
                                            color={newSpotPrivacy === option.value ? 'white' : theme.colors.text}
                                        />
                                        <Text style={[styles.privacyText, newSpotPrivacy === option.value && styles.privacyTextActive]}>
                                            {option.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => {
                                    setShowCreateModal(false)
                                    setNewSpotCoords(null)
                                }}
                                disabled={creating}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.button, styles.createButton]}
                                onPress={handleCreateSpot}
                                disabled={creating}
                            >
                                {creating ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.createButtonText}>Create</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: hp(1.5),
        paddingHorizontal: wp(5),
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.gray,
    },
    headerTitle: {
        fontSize: hp(2.8),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    locationButton: {
        padding: 8,
    },
    helpButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundLight,
        marginHorizontal: wp(5),
        marginVertical: hp(1),
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.2),
        borderRadius: theme.radius.xxl,
    },
    searchInput: {
        flex: 1,
        marginLeft: wp(2),
        fontSize: hp(1.8),
        color: theme.colors.text,
    },
    filtersContainer: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(1),
        maxHeight: hp(6),
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: wp(3),
        paddingVertical: hp(1),
        marginRight: wp(2),
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.gray,
        backgroundColor: 'white',
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        fontSize: hp(1.6),
        color: theme.colors.text,
        fontWeight: theme.fonts.medium,
    },
    filterTextActive: {
        color: 'white',
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: theme.radius.xxl,
        padding: wp(6),
        width: wp(90),
    },
    modalTitle: {
        fontSize: hp(2.5),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
        marginBottom: hp(2),
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.gray,
        borderRadius: theme.radius.xl,
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        fontSize: hp(1.8),
        color: theme.colors.text,
        marginBottom: hp(2),
    },
    textArea: {
        height: hp(12),
        textAlignVertical: 'top',
    },
    privacyContainer: {
        marginBottom: hp(2),
    },
    privacyLabel: {
        fontSize: hp(1.8),
        color: theme.colors.text,
        marginBottom: hp(1),
        fontWeight: theme.fonts.medium,
    },
    spotTypeContainer: {
        marginBottom: hp(2),
    },
    label: {
        fontSize: hp(1.8),
        color: theme.colors.text,
        marginBottom: hp(1),
        fontWeight: theme.fonts.medium,
    },
    typeOption: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        marginRight: wp(2),
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.gray,
    },
    typeActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeText: {
        fontSize: hp(1.6),
        color: theme.colors.text,
    },
    typeTextActive: {
        color: 'white',
    },
    fishContainer: {
        marginBottom: hp(2),
    },
    fishGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    fishChip: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.gray,
        marginBottom: hp(1),
    },
    fishChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    fishText: {
        fontSize: hp(1.4),
        color: theme.colors.text,
    },
    fishTextActive: {
        color: 'white',
    }, privacyScroll: {
        maxHeight: hp(5),
        marginTop: hp(1),
    },
    privacyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: wp(3),
        paddingVertical: hp(1),
        marginRight: wp(2),
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.gray,
        backgroundColor: 'white',
    },
    privacyActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    privacyText: {
        fontSize: hp(.9),
        color: theme.colors.text,
    },
    privacyTextActive: {
        color: 'white',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: hp(1.8),
        borderRadius: theme.radius.xl,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.gray,
    },
    cancelButtonText: {
        fontSize: hp(1.8),
        color: theme.colors.text,
        fontWeight: theme.fonts.semiBold,
    },
    createButton: {
        backgroundColor: theme.colors.primary,
    },
    createButtonText: {
        fontSize: hp(1.8),
        color: 'white',
        fontWeight: theme.fonts.semiBold,
    },
})

export default Map