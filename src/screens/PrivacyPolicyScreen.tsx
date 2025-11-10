import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WoodBackground } from '../components/WoodBackground';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorContrasts,
} from '../utils/constants';

/**
 * PrivacyPolicyScreen
 * Comprehensive privacy policy
 * Implements CRITICAL FIX #4: Clear privacy messaging
 */
export const PrivacyPolicyScreen: React.FC = () => {
  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

          {/* Photo Privacy Section (CRITICAL FIX #4) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Photo Privacy</Text>
            <Text style={styles.sectionText}>
              Your privacy is our top priority. We want to be completely transparent about how we handle your photos:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>
                • Photos are analyzed instantly on secure servers using AI technology
              </Text>
              <Text style={styles.bulletPoint}>
                • We NEVER save or store your photos on our servers
              </Text>
              <Text style={styles.bulletPoint}>
                • Photos are processed in real-time and immediately discarded
              </Text>
              <Text style={styles.bulletPoint}>
                • Only you can see your wardrobe items and style analysis
              </Text>
              <Text style={styles.bulletPoint}>
                • All photo processing happens through secure, encrypted connections
              </Text>
            </View>
          </View>

          {/* Data Storage Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Local Storage</Text>
            <Text style={styles.sectionText}>
              All your personal data is stored locally on your device:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>
                • User profile and measurements
              </Text>
              <Text style={styles.bulletPoint}>
                • Wardrobe items (photos stored on device only)
              </Text>
              <Text style={styles.bulletPoint}>
                • Style check history
              </Text>
              <Text style={styles.bulletPoint}>
                • Chat session history
              </Text>
              <Text style={styles.bulletPoint}>
                • Style preferences and settings
              </Text>
            </View>
            <Text style={styles.sectionText}>
              We do not upload your personal data to our servers. Your information stays on your device and is never shared with third parties.
            </Text>
          </View>

          {/* Affiliate Disclosure */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ Affiliate Disclosure</Text>
            <Text style={styles.sectionText}>
              GAUGE uses affiliate links when recommending products from retailers like Amazon, Nordstrom, J.Crew, and Bonobos.
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>
                • We earn a small commission when you make a purchase through our links
              </Text>
              <Text style={styles.bulletPoint}>
                • This comes at no additional cost to you
              </Text>
              <Text style={styles.bulletPoint}>
                • Commissions help us keep the app free and improve our service
              </Text>
              <Text style={styles.bulletPoint}>
                • We only recommend products that match your style and measurements
              </Text>
              <Text style={styles.bulletPoint}>
                • You are never obligated to purchase through our links
              </Text>
            </View>
          </View>

          {/* Third Party Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 Third Party Services</Text>
            <Text style={styles.sectionText}>
              GAUGE uses the following third-party services:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>
                • Anthropic Claude AI: For style analysis and recommendations (no personal data shared)
              </Text>
              <Text style={styles.bulletPoint}>
                • Expo: For app development framework (standard app analytics only)
              </Text>
              <Text style={styles.bulletPoint}>
                • React Native: For app functionality (no data collection)
              </Text>
            </View>
            <Text style={styles.sectionText}>
              We do not share your personal information, photos, or wardrobe data with any third-party services except for real-time AI analysis (which does not store your data).
            </Text>
          </View>

          {/* User Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Your Rights</Text>
            <Text style={styles.sectionText}>
              You have complete control over your data:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>
                • Delete your wardrobe items at any time
              </Text>
              <Text style={styles.bulletPoint}>
                • Clear your style check history
              </Text>
              <Text style={styles.bulletPoint}>
                • Reset your profile and measurements
              </Text>
              <Text style={styles.bulletPoint}>
                • Uninstall the app to remove all local data
              </Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📧 Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have questions about this privacy policy or how we handle your data, please contact us:
            </Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>privacy@gauge.app</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Support:</Text>
              <Text style={styles.contactValue}>support@gauge.app</Text>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText}>
              GAUGE respects your privacy. We never store your photos, keep all data local to your device, and are transparent about affiliate relationships. Your style journey is private and secure.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: TailorSpacing.xl,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
    textAlign: 'center',
  },
  lastUpdated: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    textAlign: 'center',
    marginBottom: TailorSpacing.xl,
  },
  section: {
    marginBottom: TailorSpacing.xl,
  },
  sectionTitle: {
    ...TailorTypography.h2,
    color: TailorColors.gold,
    marginBottom: TailorSpacing.md,
  },
  sectionText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.md,
    lineHeight: 24,
  },
  bulletList: {
    marginBottom: TailorSpacing.md,
  },
  bulletPoint: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.sm,
    paddingLeft: TailorSpacing.md,
    lineHeight: 24,
  },
  contactInfo: {
    flexDirection: 'row',
    marginBottom: TailorSpacing.sm,
  },
  contactLabel: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    fontWeight: '600',
    marginRight: TailorSpacing.sm,
  },
  contactValue: {
    ...TailorTypography.body,
    color: TailorColors.gold,
  },
  summaryBox: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.lg,
    borderRadius: TailorSpacing.md,
    marginTop: TailorSpacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: TailorColors.gold,
  },
  summaryTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.sm,
  },
  summaryText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    lineHeight: 24,
  },
});

