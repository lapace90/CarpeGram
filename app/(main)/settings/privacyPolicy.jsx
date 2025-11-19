import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import BackButton from '../../../components/BackButton';

const PrivacyPolicy = () => {
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.title}>Privacy Policy</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.lastUpdated}>Last updated: November 16, 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to Carpegram. We respect your privacy and are committed to protecting your
              personal data. This privacy policy will inform you about how we handle your personal
              data when you use our mobile application and tell you about your privacy rights.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect and process the following types of information:
            </Text>
            <Text style={styles.listItem}>
              • Account Information: Username, email address, password (encrypted), and profile
              details (name, bio, location, profile picture)
            </Text>
            <Text style={styles.listItem}>
              • Content: Posts, comments, messages, and other content you create or share
            </Text>
            <Text style={styles.listItem}>
              • Usage Data: How you interact with the app, features you use, and time spent
            </Text>
            <Text style={styles.listItem}>
              • Device Information: Device type, operating system, unique device identifiers
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.paragraph}>We use your data to:</Text>
            <Text style={styles.listItem}>• Provide and maintain our services</Text>
            <Text style={styles.listItem}>• Improve user experience and app functionality</Text>
            <Text style={styles.listItem}>• Communicate with you about your account</Text>
            <Text style={styles.listItem}>• Ensure the security of our platform</Text>
            <Text style={styles.listItem}>• Comply with legal obligations</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Sharing</Text>
            <Text style={styles.paragraph}>
              We do not sell your personal data. We may share your data only in the following
              circumstances:
            </Text>
            <Text style={styles.listItem}>
              • With other users: Your public profile and posts are visible according to your
              privacy settings
            </Text>
            <Text style={styles.listItem}>
              • With service providers: Third-party services that help us operate the app
              (authentication, storage, analytics)
            </Text>
            <Text style={styles.listItem}>
              • For legal reasons: When required by law or to protect our rights
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rights (GDPR)</Text>
            <Text style={styles.paragraph}>Under GDPR, you have the right to:</Text>
            <Text style={styles.listItem}>• Access your personal data</Text>
            <Text style={styles.listItem}>• Rectify inaccurate data</Text>
            <Text style={styles.listItem}>• Request erasure of your data</Text>
            <Text style={styles.listItem}>• Object to data processing</Text>
            <Text style={styles.listItem}>• Data portability</Text>
            <Text style={styles.listItem}>• Withdraw consent at any time</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate technical and organizational measures to protect your
              personal data. However, no method of transmission over the internet is 100% secure.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your personal data only for as long as necessary to fulfill the purposes
              outlined in this policy. When you delete your account, we delete your data within 30
              days, except where we're required to retain it by law.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Children's Privacy</Text>
            <Text style={styles.paragraph}>
              Carpegram is not intended for users under 13 years of age. We do not knowingly
              collect data from children under 13.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this privacy policy from time to time. We will notify you of any
              changes by posting the new policy in the app and updating the "Last updated" date.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions about this privacy policy or want to exercise your rights,
              contact us at:
            </Text>
            <Text style={styles.contact}>Email: privacy@carpegram.com</Text>
            <Text style={styles.contact}>Support: support@carpegram.com</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using Carpegram, you agree to this Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    padding: wp(5),
    paddingBottom: hp(4),
  },
  lastUpdated: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    fontStyle: 'italic',
    marginBottom: hp(3),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  paragraph: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    lineHeight: hp(2.4),
    marginBottom: hp(1),
  },
  listItem: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    lineHeight: hp(2.6),
    marginBottom: hp(0.5),
  },
  contact: {
    fontSize: hp(1.7),
    color: theme.colors.primary,
    lineHeight: hp(2.4),
    marginTop: hp(0.5),
  },
  footer: {
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray,
    alignItems: 'center',
  },
  footerText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});