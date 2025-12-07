import { View, Text, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import { ACTIVITY_FACTORS } from '../../services/weatherService';

const ActivityExplainerModal = ({ visible, onClose, factors }) => {
  const { theme } = useTheme();
  const getWeightPercent = (weight) => Math.round(weight * 100);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderRadius: theme.radius.xxl }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
              How It Works
            </Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Disclaimer Banner */}
            <View style={[styles.disclaimerBanner, { backgroundColor: '#FFF3E0', borderRadius: theme.radius.lg }]}>
              <Icon name="info" size={20} color="#E67E22" />
              <Text style={[styles.disclaimerText, { color: theme.colors.text }]}>
                This is an <Text style={{ fontWeight: theme.fonts.bold }}>estimated score</Text> based on general fishing principles. 
                Actual conditions may vary. Use as a guide, not a guarantee!
              </Text>
            </View>

            {/* Introduction */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                🎣 Fishing Activity Score
              </Text>
              <Text style={[styles.paragraph, { color: theme.colors.textLight }]}>
                Our algorithm calculates a score from 0-100% based on current weather conditions 
                and astronomical data. The score indicates how likely fish are to be active and feeding.
              </Text>
            </View>

            {/* Factors Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                📊 Factors We Consider
              </Text>

              {ACTIVITY_FACTORS && Object.entries(ACTIVITY_FACTORS).map(([key, factor]) => (
                <View key={key} style={[styles.factorCard, { backgroundColor: theme.colors.gray + '20', borderRadius: theme.radius.lg }]}>
                  <View style={styles.factorHeader}>
                    <View style={styles.factorTitleRow}>
                      <Text style={styles.factorIcon}>{factor.icon}</Text>
                      <Text style={[styles.factorName, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                        {factor.name}
                      </Text>
                    </View>
                    <View style={[styles.weightBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.weightText, { fontWeight: theme.fonts.bold }]}>
                        {getWeightPercent(factor.weight)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.factorDescription, { color: theme.colors.textLight }]}>
                    {factor.description}
                  </Text>
                </View>
              ))}
            </View>

            {/* Score Scale */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontWeight: theme.fonts.bold, color: theme.colors.text }]}>
                📈 Score Scale
              </Text>
              
              <View style={styles.scaleContainer}>
                {[
                  { range: '80-100%', label: 'Excellent', color: '#27AE60', desc: 'Perfect conditions!' },
                  { range: '60-79%', label: 'Good', color: '#7ED321', desc: 'Favorable conditions' },
                  { range: '40-59%', label: 'Fair', color: '#F5A623', desc: 'Average activity' },
                  { range: '20-39%', label: 'Poor', color: '#F39C12', desc: 'Below average' },
                  { range: '0-19%', label: 'Bad', color: '#E74C3C', desc: 'Unfavorable conditions' },
                ].map((item, index) => (
                  <View key={index} style={styles.scaleItem}>
                    <View style={[styles.scaleDot, { backgroundColor: item.color }]} />
                    <View style={styles.scaleContent}>
                      <View style={styles.scaleHeader}>
                        <Text style={[styles.scaleRange, { fontWeight: theme.fonts.semibold, color: theme.colors.text }]}>
                          {item.range}
                        </Text>
                        <Text style={[styles.scaleLabel, { color: item.color, fontWeight: theme.fonts.medium }]}>
                          {item.label}
                        </Text>
                      </View>
                      <Text style={[styles.scaleDesc, { color: theme.colors.textLight }]}>
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ height: hp(4) }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ActivityExplainerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(5),
    paddingBottom: hp(2),
  },
  title: {
    fontSize: hp(2.4),
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
  },
  disclaimerBanner: {
    flexDirection: 'row',
    padding: wp(4),
    gap: 12,
    marginBottom: hp(2),
  },
  disclaimerText: {
    flex: 1,
    fontSize: hp(1.5),
    lineHeight: hp(2.2),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(2),
    marginBottom: hp(1.5),
  },
  paragraph: {
    fontSize: hp(1.6),
    lineHeight: hp(2.4),
  },
  factorCard: {
    padding: wp(4),
    marginBottom: hp(1.5),
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  factorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorIcon: {
    fontSize: hp(2),
  },
  factorName: {
    fontSize: hp(1.7),
  },
  weightBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weightText: {
    color: 'white',
    fontSize: hp(1.3),
  },
  factorDescription: {
    fontSize: hp(1.4),
    lineHeight: hp(2),
  },
  scaleContainer: {
    gap: 12,
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  scaleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  scaleContent: {
    flex: 1,
  },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scaleRange: {
    fontSize: hp(1.5),
  },
  scaleLabel: {
    fontSize: hp(1.4),
  },
  scaleDesc: {
    fontSize: hp(1.3),
    marginTop: 2,
  },
});