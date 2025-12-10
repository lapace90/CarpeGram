import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { hp } from '../../helpers/common'
import Input from '../common/Input'
import Icon from '../../assets/icons'

const FishInfoForm = ({
  fishSpecies,
  fishWeight,
  bait,
  spot,
  onSpeciesChange,
  onWeightChange,
  onBaitChange,
  onSpotChange,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontWeight: theme.fonts.semiBold, color: theme.colors.text }]}>
        Catch Details (Optional)
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textLight }]}>
        Add information about your catch
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { fontWeight: theme.fonts.medium, color: theme.colors.text }]}>
            Fish Species 🐟
          </Text>
          <Input
            placeholder="e.g., Common Carp, Mirror Carp..."
            value={fishSpecies}
            onChangeText={onSpeciesChange}
            containerStyles={[styles.input, { backgroundColor: theme.colors.card }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { fontWeight: theme.fonts.medium, color: theme.colors.text }]}>
            Weight (kg) ⚖️
          </Text>
          <Input
            placeholder="e.g., 15.5"
            value={fishWeight}
            onChangeText={onWeightChange}
            keyboardType="decimal-pad"
            containerStyles={[styles.input, { backgroundColor: theme.colors.card }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { fontWeight: theme.fonts.medium, color: theme.colors.text }]}>
            Bait Used 🎣
          </Text>
          <Input
            placeholder="e.g., Boilies, Corn, Pellets..."
            value={bait}
            onChangeText={onBaitChange}
            containerStyles={[styles.input, { backgroundColor: theme.colors.card }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { fontWeight: theme.fonts.medium, color: theme.colors.text }]}>
            Fishing Spot 📍
          </Text>
          <Input
            icon={<Icon name="location" size={22} strokeWidth={1.6} color={theme.colors.textLight} />}
            placeholder="e.g., Lake Geneva, River Thames..."
            value={spot}
            onChangeText={onSpotChange}
            containerStyles={[styles.input, { backgroundColor: theme.colors.card }]}
          />
        </View>
      </View>
    </View>
  );
};

export default FishInfoForm;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    fontSize: hp(2),
  },
  subtitle: {
    fontSize: hp(1.6),
    marginBottom: 5,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: hp(1.7),
  },
  input: {},
});