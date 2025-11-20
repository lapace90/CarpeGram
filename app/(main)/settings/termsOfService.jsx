import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import BackButton from '../../../components/BackButton';

const TermsOfService = () => {
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} to="/settings" />
          <Text style={styles.title}>Terms of Service</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.lastUpdated}>Last updated: November 16, 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing or using Carpegram, you agree to be bound by these Terms of Service and
              our Privacy Policy. If you don't agree to these terms, please don't use our service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Eligibility</Text>
            <Text style={styles.paragraph}>
              You must be at least 13 years old to use Carpegram. By using our service, you
              represent that you meet this age requirement.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.paragraph}>
              You are responsible for maintaining the security of your account and password. You
              must provide accurate and complete information when creating your account.
            </Text>
            <Text style={styles.listItem}>• You may not impersonate others</Text>
            <Text style={styles.listItem}>• You may not create multiple accounts</Text>
            <Text style={styles.listItem}>
              • You may not share your account with others
            </Text>
            <Text style={styles.listItem}>
              • You are responsible for all activity on your account
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. User Content</Text>
            <Text style={styles.paragraph}>
              You retain ownership of content you post on Carpegram. However, by posting content,
              you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and
              display your content in connection with operating the service.
            </Text>
            <Text style={styles.paragraph}>You agree not to post content that:</Text>
            <Text style={styles.listItem}>• Violates laws or regulations</Text>
            <Text style={styles.listItem}>• Infringes on intellectual property rights</Text>
            <Text style={styles.listItem}>• Contains hate speech or harassment</Text>
            <Text style={styles.listItem}>• Is sexually explicit or violent</Text>
            <Text style={styles.listItem}>• Contains spam or misleading information</Text>
            <Text style={styles.listItem}>• Harms minors in any way</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Community Guidelines</Text>
            <Text style={styles.paragraph}>
              Carpegram is a community for fishing enthusiasts. We expect all users to:
            </Text>
            <Text style={styles.listItem}>• Be respectful and courteous</Text>
            <Text style={styles.listItem}>• Share authentic fishing experiences</Text>
            <Text style={styles.listItem}>• Respect fishing regulations and conservation</Text>
            <Text style={styles.listItem}>• Report inappropriate content</Text>
            <Text style={styles.listItem}>
              • Not engage in bullying, harassment, or hate speech
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Prohibited Activities</Text>
            <Text style={styles.paragraph}>You may not:</Text>
            <Text style={styles.listItem}>• Use the service for illegal purposes</Text>
            <Text style={styles.listItem}>• Attempt to gain unauthorized access</Text>
            <Text style={styles.listItem}>• Distribute malware or viruses</Text>
            <Text style={styles.listItem}>• Scrape or harvest user data</Text>
            <Text style={styles.listItem}>• Interfere with service operation</Text>
            <Text style={styles.listItem}>• Use automated systems (bots) without permission</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The Carpegram name, logo, and all related marks are our property. All content,
              features, and functionality are owned by us and protected by copyright, trademark,
              and other laws.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Content Moderation</Text>
            <Text style={styles.paragraph}>
              We reserve the right to remove any content that violates these terms or our community
              guidelines. We may also suspend or terminate accounts that repeatedly violate our
              policies.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
            <Text style={styles.paragraph}>
              Carpegram is provided "as is" without warranties of any kind. We don't guarantee that
              the service will be uninterrupted, secure, or error-free.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              We are not liable for any indirect, incidental, special, or consequential damages
              arising from your use of the service. Our total liability is limited to the amount
              you paid us in the last 12 months (if any).
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Account Termination</Text>
            <Text style={styles.paragraph}>
              You may delete your account at any time through the app settings. We may suspend or
              terminate your account if you violate these terms. Upon termination, your right to
              use the service ceases immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We may modify these terms at any time. We'll notify you of material changes by
              posting the updated terms in the app. Continued use after changes constitutes
              acceptance of the new terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Governing Law</Text>
            <Text style={styles.paragraph}>
              These terms are governed by the laws of the European Union and France. Any disputes
              will be resolved in the courts of France.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions about these terms, contact us at:
            </Text>
            <Text style={styles.contact}>Email: legal@carpegram.com</Text>
            <Text style={styles.contact}>Support: support@carpegram.com</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using Carpegram, you acknowledge that you have read and agree to these Terms of
              Service.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default TermsOfService;

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
    lineHeight: hp(2),
  },
});