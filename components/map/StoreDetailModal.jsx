import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';

const StoreDetailModal = ({ visible, onClose, store }) => {
  const { theme } = useTheme();

  if (!store) return null;

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    if (store.phone) {
      Linking.openURL(`tel:${store.phone}`);
    }
  };

  const handleEmail = () => {
    if (store.email) {
      Linking.openURL(`mailto:${store.email}`);
    }
  };

  const handleWebsite = () => {
    if (store.website) {
      let url = store.website;
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      Linking.openURL(url);
    }
  };

  const formatOpeningHours = () => {
    if (!store.opening_hours) return null;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const hours = store.opening_hours[day];
      if (!hours) return null;
      return {
        day: dayLabels[index],
        hours: hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`,
      };
    }).filter(Boolean);
  };

  const openingHours = formatOpeningHours();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.storeIcon}>🏪</Text>
                <View style={styles.headerInfo}>
                  <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]} numberOfLines={2}>
                    {store.name}
                  </Text>
                  {store.is_verified && (
                    <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.sm }]}>
                      <Icon name="check" size={12} color="white" />
                      <Text style={[styles.verifiedText, { fontWeight: theme.fonts.semibold }]}>Verified</Text>
                    </View>
                  )}
                </View>
              </View>
              <Pressable onPress={onClose} hitSlop={10}>
                <Icon name="delete" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            {/* Address */}
            {store.address && (
              <Pressable 
                style={[styles.addressRow, { backgroundColor: theme.colors.backgroundLight, borderRadius: theme.radius.xl }]} 
                onPress={handleNavigate}
              >
                <Icon name="location" size={20} color={theme.colors.primary} />
                <Text style={[styles.addressText, { color: theme.colors.text }]}>{store.address}</Text>
                <Icon name="arrowRight" size={18} color={theme.colors.textLight} />
              </Pressable>
            )}

            {/* Description */}
            {store.description && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                  About
                </Text>
                <Text style={[styles.description, { color: theme.colors.textDark }]}>
                  {store.description}
                </Text>
              </View>
            )}

            {/* Contact Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                Contact
              </Text>
              
              {store.phone && (
                <Pressable style={styles.contactRow} onPress={handleCall}>
                  <Icon name="call" size={20} color={theme.colors.primary} />
                  <Text style={[styles.contactText, { color: theme.colors.primary }]}>{store.phone}</Text>
                </Pressable>
              )}

              {store.email && (
                <Pressable style={styles.contactRow} onPress={handleEmail}>
                  <Icon name="email" size={20} color={theme.colors.primary} />
                  <Text style={[styles.contactText, { color: theme.colors.primary }]}>{store.email}</Text>
                </Pressable>
              )}

              {store.website && (
                <Pressable style={styles.contactRow} onPress={handleWebsite}>
                  <Icon name="globe" size={20} color={theme.colors.primary} />
                  <Text style={[styles.contactText, { color: theme.colors.primary }]} numberOfLines={1}>
                    {store.website}
                  </Text>
                </Pressable>
              )}

              {!store.phone && !store.email && !store.website && (
                <Text style={[styles.noContact, { color: theme.colors.textLight }]}>
                  No contact information available
                </Text>
              )}
            </View>

            {/* Opening Hours */}
            {openingHours && openingHours.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                  Opening Hours
                </Text>
                {openingHours.map((item, index) => (
                  <View key={index} style={styles.hoursRow}>
                    <Text style={[styles.dayText, { color: theme.colors.textLight }]}>{item.day}</Text>
                    <Text style={[styles.hoursText, { color: theme.colors.text }]}>{item.hours}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={[styles.actions, { borderTopColor: theme.colors.gray }]}>
              <Pressable 
                style={[styles.actionButtonPrimary, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl }]} 
                onPress={handleNavigate}
              >
                <Icon name="location" size={22} color="white" />
                <Text style={[styles.actionTextPrimary, { fontWeight: theme.fonts.semibold }]}>Get Directions</Text>
              </Pressable>

              {store.phone && (
                <Pressable 
                  style={[styles.actionButtonSecondary, { backgroundColor: theme.colors.backgroundLight, borderRadius: theme.radius.xl }]} 
                  onPress={handleCall}
                >
                  <Icon name="call" size={22} color={theme.colors.primary} />
                  <Text style={[styles.actionTextSecondary, { color: theme.colors.primary, fontWeight: theme.fonts.semibold }]}>
                    Call
                  </Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default StoreDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    padding: wp(5),
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(2),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: wp(2),
  },
  storeIcon: {
    fontSize: hp(3),
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: hp(2.2),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    alignSelf: 'flex-start',
    marginTop: hp(0.5),
    gap: 4,
  },
  verifiedText: {
    color: 'white',
    fontSize: hp(1.2),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3),
    marginBottom: hp(2),
    gap: wp(2),
  },
  addressText: {
    flex: 1,
    fontSize: hp(1.7),
  },
  section: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: hp(1.7),
    marginBottom: hp(1),
  },
  description: {
    fontSize: hp(1.7),
    lineHeight: hp(2.4),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
    gap: wp(3),
  },
  contactText: {
    fontSize: hp(1.7),
    flex: 1,
  },
  noContact: {
    fontSize: hp(1.6),
    fontStyle: 'italic',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(0.5),
  },
  dayText: {
    fontSize: hp(1.6),
    width: wp(12),
  },
  hoursText: {
    fontSize: hp(1.6),
  },
  actions: {
    flexDirection: 'row',
    gap: wp(3),
    paddingTop: hp(2),
    borderTopWidth: 1,
    marginTop: hp(1),
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    gap: wp(2),
  },
  actionTextPrimary: {
    color: 'white',
    fontSize: hp(1.7),
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    gap: wp(2),
  },
  actionTextSecondary: {
    fontSize: hp(1.7),
  },
});