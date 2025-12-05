import { View, Text, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import React from 'react';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons';
import { ACTIVITY_FACTORS } from '../../services/weatherService';

const ActivityExplainerModal = ({ visible, onClose, factors }) => {
  // Factor weights as percentage
  const getWeightPercent = (weight) => Math.round(weight * 100);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>How It Works</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Disclaimer Banner */}
            <View style={styles.disclaimerBanner}>
              <Icon name="info" size={20} color="#E67E22" />
              <Text style={styles.disclaimerText}>
                This is an <Text style={styles.bold}>estimated score</Text> based on general fishing principles. 
                Actual conditions may vary. Use as a guide, not a guarantee!
              </Text>
            </View>

            {/* Introduction */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎣 Fishing Activity Score</Text>
              <Text style={styles.paragraph}>
                Our algorithm calculates a score from 0-100% based on current weather conditions 
                and astronomical data. The score indicates how likely fish are to be active and feeding.
              </Text>
            </View>

            {/* Formula */}
            <View style={styles.formulaCard}>
              <Text style={styles.formulaTitle}>The Formula</Text>
              <Text style={styles.formula}>
                Score = Σ (Factor Score × Weight)
              </Text>
              <Text style={styles.formulaNote}>
                Each factor is scored 0-100, then multiplied by its weight
              </Text>
            </View>

            {/* Factors Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Factors & Weights</Text>
              
              {Object.entries(ACTIVITY_FACTORS).map(([key, factor]) => (
                <View key={key} style={styles.factorCard}>
                  <View style={styles.factorHeader}>
                    <View style={styles.factorTitleRow}>
                      <Text style={styles.factorIcon}>{factor.icon}</Text>
                      <Text style={styles.factorName}>{factor.name}</Text>
                    </View>
                    <View style={styles.weightBadge}>
                      <Text style={styles.weightText}>{getWeightPercent(factor.weight)}%</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.factorDescription}>{factor.description}</Text>
                  
                  {/* Current value if available */}
                  {factors && factors[key] && (
                    <View style={styles.currentValue}>
                      <Text style={styles.currentLabel}>Current:</Text>
                      <Text style={styles.currentData}>{factors[key].value}</Text>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: factors[key].status.color + '20' }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { color: factors[key].status.color }
                        ]}>
                          {factors[key].status.label} ({factors[key].score}%)
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Score Interpretation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Score Interpretation</Text>
              
              <View style={styles.scaleContainer}>
                {[
                  { range: '80-100%', label: 'Excellent', color: '#27AE60', desc: 'Prime conditions! Don\'t miss it.' },
                  { range: '65-79%', label: 'Good', color: '#2ECC71', desc: 'Favorable conditions for fishing.' },
                  { range: '50-64%', label: 'Moderate', color: '#F39C12', desc: 'Decent, patience recommended.' },
                  { range: '35-49%', label: 'Fair', color: '#E67E22', desc: 'Challenging, but possible.' },
                  { range: '0-34%', label: 'Poor', color: '#E74C3C', desc: 'Difficult conditions expected.' },
                ].map((item, index) => (
                  <View key={index} style={styles.scaleItem}>
                    <View style={[styles.scaleDot, { backgroundColor: item.color }]} />
                    <View style={styles.scaleContent}>
                      <View style={styles.scaleHeader}>
                        <Text style={styles.scaleRange}>{item.range}</Text>
                        <Text style={[styles.scaleLabel, { color: item.color }]}>{item.label}</Text>
                      </View>
                      <Text style={styles.scaleDesc}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Scientific Basis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔬 Scientific Basis</Text>
              <Text style={styles.paragraph}>
                This algorithm is inspired by <Text style={styles.bold}>solunar theory</Text>, which suggests 
                that fish and wildlife activity is influenced by the position of the sun and moon.
              </Text>
              <Text style={styles.paragraph}>
                Weather factors like barometric pressure, temperature, and wind are well-documented 
                influences on fish behavior in angling literature.
              </Text>
            </View>

            {/* Limitations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Limitations</Text>
              
              <View style={styles.limitationsList}>
                <View style={styles.limitationItem}>
                  <Text style={styles.limitationBullet}>•</Text>
                  <Text style={styles.limitationText}>
                    <Text style={styles.bold}>Water Temperature:</Text> For freshwater, we estimate based 
                    on air temperature and season. Coastal locations use real satellite data.
                  </Text>
                </View>
                
                <View style={styles.limitationItem}>
                  <Text style={styles.limitationBullet}>•</Text>
                  <Text style={styles.limitationText}>
                    <Text style={styles.bold}>Local Conditions:</Text> Factors like water clarity, 
                    recent stocking, and fishing pressure aren't considered.
                  </Text>
                </View>
                
                <View style={styles.limitationItem}>
                  <Text style={styles.limitationBullet}>•</Text>
                  <Text style={styles.limitationText}>
                    <Text style={styles.bold}>Species Specific:</Text> Different fish species have 
                    different preferences. This is optimized for carp.
                  </Text>
                </View>
                
                <View style={styles.limitationItem}>
                  <Text style={styles.limitationBullet}>•</Text>
                  <Text style={styles.limitationText}>
                    <Text style={styles.bold}>Tidal Data:</Text> Tide times are estimated from lunar 
                    cycles. Check local tide charts for accuracy.
                  </Text>
                </View>
              </View>
            </View>

            {/* Final Note */}
            <View style={styles.finalNote}>
              <Text style={styles.finalNoteIcon}>💡</Text>
              <Text style={styles.finalNoteText}>
                The best anglers know that even on "poor" days, the right technique and patience 
                can lead to great catches. Use this as a tool, not a rule!
              </Text>
            </View>

            {/* Credits */}
            <View style={styles.credits}>
              <Text style={styles.creditsText}>
                Weather data: Open-Meteo API
              </Text>
              <Text style={styles.creditsText}>
                Sea temperature: Open-Meteo Marine API
              </Text>
              <Text style={styles.creditsText}>
                Moon & freshwater temp: Local calculations
              </Text>
            </View>

            <View style={{ height: hp(4) }} />
          </ScrollView>

          {/* Got It Button */}
          <View style={styles.footer}>
            <Pressable style={styles.gotItButton} onPress={onClose}>
              <Text style={styles.gotItText}>Got It!</Text>
            </Pressable>
          </View>
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
    backgroundColor: 'white',
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  
  // Disclaimer
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3E7',
    padding: wp(4),
    borderRadius: theme.radius.lg,
    marginBottom: hp(2.5),
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E67E22',
  },
  disclaimerText: {
    flex: 1,
    fontSize: hp(1.5),
    color: '#9A6700',
    lineHeight: hp(2.2),
  },
  bold: {
    fontWeight: theme.fonts.bold,
  },

  // Sections
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1.5),
  },
  paragraph: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2.3),
    marginBottom: hp(1),
  },

  // Formula Card
  formulaCard: {
    backgroundColor: theme.colors.primary + '10',
    padding: wp(4),
    borderRadius: theme.radius.lg,
    marginBottom: hp(3),
    alignItems: 'center',
  },
  formulaTitle: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.primary,
    marginBottom: hp(1),
  },
  formula: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  formulaNote: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },

  // Factor Cards
  factorCard: {
    backgroundColor: theme.colors.gray + '15',
    padding: wp(4),
    borderRadius: theme.radius.lg,
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
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  weightBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weightText: {
    color: 'white',
    fontSize: hp(1.3),
    fontWeight: theme.fonts.bold,
  },
  factorDescription: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    lineHeight: hp(2),
  },
  currentValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray + '40',
    gap: 8,
    flexWrap: 'wrap',
  },
  currentLabel: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
  currentData: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: hp(1.2),
    fontWeight: theme.fonts.semibold,
  },

  // Scale
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
    alignItems: 'center',
    gap: 8,
  },
  scaleRange: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  scaleLabel: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.bold,
  },
  scaleDesc: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    marginTop: 2,
  },

  // Limitations
  limitationsList: {
    gap: 12,
  },
  limitationItem: {
    flexDirection: 'row',
    gap: 8,
  },
  limitationBullet: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  limitationText: {
    flex: 1,
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    lineHeight: hp(2.1),
  },

  // Final Note
  finalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F8F5',
    padding: wp(4),
    borderRadius: theme.radius.lg,
    marginBottom: hp(2),
    gap: 12,
  },
  finalNoteIcon: {
    fontSize: hp(2),
  },
  finalNoteText: {
    flex: 1,
    fontSize: hp(1.5),
    color: '#1D8348',
    lineHeight: hp(2.2),
    fontStyle: 'italic',
  },

  // Credits
  credits: {
    alignItems: 'center',
    paddingVertical: hp(2),
    gap: 4,
  },
  creditsText: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
  },

  // Footer
  footer: {
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray,
  },
  gotItButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.8),
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  gotItText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
  },
});