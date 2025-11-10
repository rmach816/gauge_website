import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WoodBackground } from '../components/WoodBackground';
import { GoldButton } from '../components/GoldButton';
import { StorageService } from '../services/storage';
import { PremiumService } from '../services/premium';
import { OnboardingService } from '../services/onboarding';
import { runChatDiagnostics, formatDiagnosticReport } from '../utils/chatDiagnostics';
import {
  UserProfile,
  UserMeasurements,
  StylePreference,
  Occasion,
  RootStackParamList,
  PriceRange,
} from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import Constants from 'expo-constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * SettingsScreen
 * Comprehensive settings with all sections
 * Implements CRITICAL FIX #4: Privacy & Data section
 */
export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus (e.g., after editing preferences)
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const p = await StorageService.getUserProfile();
    setProfile(p);
    const status = await PremiumService.getStatus();
    setPremiumStatus(status);
  };

  const handleRestartOnboarding = async () => {
    Alert.alert(
      'Restart Onboarding',
      'This will reset your onboarding progress. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await OnboardingService.resetOnboarding();
            // Navigate to welcome screen
            navigation.replace('Welcome');
          },
        },
      ]
    );
  };

  const handleTestProfileData = async () => {
    Alert.alert('Testing Profile Data', 'Running diagnostics...');
    
    try {
      const report = await runChatDiagnostics();
      
      // Format results for display
      let message = 'DIAGNOSTIC REPORT:\n\n';
      
      message += `Profile: ${report.profileExists ? '✅ Found' : '❌ Missing'}\n`;
      message += `Profile ID: ${report.profileId || 'N/A'}\n\n`;
      
      message += `Measurements: ${report.measurementsValid ? '✅ Complete' : report.measurementsExist ? '⚠️ Incomplete' : '❌ Missing'}\n`;
      if (report.measurementsDetails) {
        message += `  - Height: ${report.measurementsDetails.height ? Math.floor(report.measurementsDetails.height / 12) + "'" + (report.measurementsDetails.height % 12) + '"' : 'N/A'}\n`;
        message += `  - Weight: ${report.measurementsDetails.weight || 'N/A'} lbs\n`;
        message += `  - Chest: ${report.measurementsDetails.chest || 'N/A'}"\n`;
        message += `  - Waist: ${report.measurementsDetails.waist || 'N/A'}"\n`;
        message += `  - Neck: ${report.measurementsDetails.neck || 'N/A'}"\n`;
        message += `  - Sleeve: ${report.measurementsDetails.sleeve || 'N/A'}"\n`;
        message += `  - Shoulder: ${report.measurementsDetails.shoulder || 'N/A'}"\n`;
        message += `  - Inseam: ${report.measurementsDetails.inseam || 'N/A'}"\n`;
      }
      message += '\n';
      
      message += `Shoe Size: ${report.shoeSizeExists ? '✅ ' + report.shoeSize : '❌ Missing'}\n\n`;
      
      message += `Style Preferences: ${report.stylePreferencesExist ? '✅ ' + report.stylePreferences?.join(', ') : '❌ Missing'}\n\n`;
      
      message += `Favorite Occasions: ${report.favoriteOccasionsExist ? '✅ ' + report.favoriteOccasions?.join(', ') : '❌ Missing'}\n\n`;
      
      if (report.storageErrors.length > 0) {
        message += `ERRORS:\n${report.storageErrors.map(e => `  - ${e}`).join('\n')}\n\n`;
      }
      
      if (report.recommendations.length > 0) {
        message += `RECOMMENDATIONS:\n${report.recommendations.map(r => `  - ${r}`).join('\n')}`;
      }
      
      Alert.alert('Profile Data Diagnostic', message, [{ text: 'OK' }], { cancelable: true });
      
      // Also log to console for debugging
      console.log('\n═══════ MANUAL DIAGNOSTIC TEST FROM SETTINGS ═══════');
      console.log(message);
      console.log('═══════════════════════════════════════════════════\n');
    } catch (error) {
      Alert.alert('Error', `Failed to run diagnostics: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleManageWardrobe = () => {
    navigation.navigate('MainTabs', { screen: 'Closet' });
  };

  const SettingsItem: React.FC<{
    icon: string;
    title: string;
    description?: string;
    onPress: () => void;
    showArrow?: boolean;
  }> = ({ icon, title, description, onPress, showArrow = true }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.settingsIcon}>{icon}</Text>
      <View style={styles.settingsItemContent}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingsItemDescription}>{description}</Text>
        )}
      </View>
      {showArrow && <Text style={styles.settingsArrow}>→</Text>}
    </TouchableOpacity>
  );

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header removed for cleaner look */}

          {/* Premium Status Banner */}
          {premiumStatus.isPremium && (
            <View style={styles.premiumBanner}>
              <Text style={styles.premiumIcon}>✨</Text>
              <Text style={styles.premiumText}>Premium Member</Text>
            </View>
          )}

          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Profile</Text>
            <SettingsItem
              icon="🔍"
              title="Test Profile Data"
              description="Verify your data is saved correctly"
              onPress={handleTestProfileData}
            />
            <SettingsItem
              icon="📏"
              title="Edit Measurements"
              description="Update your body measurements"
              onPress={() => {
                // Navigate to measurement selection screen
                navigation.navigate('MeasurementSelection');
              }}
            />
            <SettingsItem
              icon="👔"
              title="Style Preferences"
              description={
                profile?.stylePreference && profile.stylePreference.length > 0
                  ? `Current: ${profile.stylePreference.join(', ')}`
                  : 'Not set'
              }
              onPress={() => {
                navigation.navigate('StylePreferences');
              }}
            />
            <SettingsItem
              icon="👟"
              title="Shoe Size"
              description={profile?.shoeSize ? `Current: ${profile.shoeSize}` : 'Not set'}
              onPress={() => {
                // Navigate to shoe size screen
                navigation.navigate('ShoeSize');
              }}
            />
          </View>

          {/* Wardrobe Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Wardrobe</Text>
            <SettingsItem
              icon="👕"
              title="Manage Wardrobe Items"
              description="View and edit your closet"
              onPress={handleManageWardrobe}
            />
            <SettingsItem
              icon="🔄"
              title="Restart Wardrobe Setup"
              description="Clear and restart wardrobe photo setup"
              onPress={() => {
                Alert.alert(
                  'Restart Wardrobe Setup',
                  'This will clear your wardrobe photos. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: async () => {
                        // Clear wardrobe items
                        const items = await StorageService.getClosetItems();
                        for (const item of items) {
                          await StorageService.deleteClosetItem(item.id);
                        }
                        Alert.alert('Success', 'Wardrobe cleared.');
                      },
                    },
                  ]
                );
              }}
            />
          </View>

          {/* Shopping Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Shopping Preferences</Text>
            <SettingsItem
              icon="💰"
              title="Budget Settings"
              description={
                profile?.budgetSettings?.preferredPriceRange
                  ? `Preferred: ${profile.budgetSettings.preferredPriceRange}`
                  : 'Set your price range preferences'
              }
              onPress={() => {
                Alert.alert('Coming Soon', 'Budget settings editor will be added.');
              }}
            />
            <SettingsItem
              icon="🏪"
              title="Preferred Retailers"
              description="Choose your favorite stores"
              onPress={() => {
                Alert.alert('Coming Soon', 'Retailer preferences will be added.');
              }}
            />
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Account</Text>
            <SettingsItem
              icon="🌐"
              title="Language"
              description="English (US)"
              onPress={() => {
                Alert.alert('Coming Soon', 'Language selection will be added.');
              }}
            />
            {premiumStatus.isPremium ? (
              <SettingsItem
                icon="⭐"
                title="Premium Subscription"
                description="Active • Manage subscription"
                onPress={() => {
                  navigation.navigate('Paywall');
                }}
              />
            ) : (
              <SettingsItem
                icon="⭐"
                title="Upgrade to Premium"
                description="$6.99/month • Unlimited features"
                onPress={() => {
                  navigation.navigate('Paywall');
                }}
              />
            )}
            <SettingsItem
              icon="🔄"
              title="Restart Onboarding"
              description="Complete setup again"
              onPress={handleRestartOnboarding}
            />
          </View>

          {/* Privacy & Data Section (CRITICAL FIX #4) */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Privacy & Data</Text>
            <SettingsItem
              icon="🔒"
              title="Photo Privacy"
              description="Photos are never uploaded to our servers"
              onPress={() => {
                navigation.navigate('PrivacyPolicy');
              }}
            />
            <SettingsItem
              icon="📱"
              title="Local Storage"
              description="All your data is stored on your device"
              onPress={() => {
                Alert.alert(
                  'Local Storage',
                  'All your data (profile, wardrobe, history) is stored locally on your device. We never upload your personal information to our servers.'
                );
              }}
            />
            <SettingsItem
              icon="🛍️"
              title="Affiliate Disclosure"
              description="We earn commissions on purchases"
              onPress={() => {
                Alert.alert(
                  'Affiliate Disclosure',
                  'GAUGE uses affiliate links when recommending products. We earn a small commission when you make a purchase through our links, at no additional cost to you. This helps us keep the app free and improve our service.'
                );
              }}
            />
            <SettingsItem
              icon="📄"
              title="Privacy Policy"
              description="Read our complete privacy policy"
              onPress={() => {
                navigation.navigate('PrivacyPolicy');
              }}
            />
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Instructions</Text>
            <SettingsItem
              icon="📖"
              title="How GAUGE Works"
              description="Learn how to use all features"
              onPress={() => {
                navigation.navigate('Tutorial');
              }}
            />
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Quick Guide</Text>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionIcon}>💬</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Chat with Your Tailor (Premium)</Text>
                  <Text style={styles.instructionText}>
                    Open the chat and ask questions naturally. Upload photos, get style advice, and build outfits through conversation.
                  </Text>
                </View>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionIcon}>📸</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Quick Style Check</Text>
                  <Text style={styles.instructionText}>
                    Take photos of your outfit (top, bottom, shoes). Get instant feedback on fit, style, and occasion appropriateness.
                  </Text>
                </View>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionIcon}>🎯</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Build an Outfit</Text>
                  <Text style={styles.instructionText}>
                    Select an occasion, choose wardrobe mode (your closet, shopping, or mixed), and optionally set a price range. We'll suggest a complete outfit.
                  </Text>
                </View>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionIcon}>👕</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Manage Your Wardrobe</Text>
                  <Text style={styles.instructionText}>
                    Add items by taking photos. Our AI automatically categorizes them (shirt, pants, shoes, etc.) and extracts details like color and style.
                  </Text>
                </View>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionIcon}>📋</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>View History</Text>
                  <Text style={styles.instructionText}>
                    See all your past style checks, chat sessions, and outfit recommendations. Premium users can resume conversations.
                  </Text>
                </View>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionIcon}>🛍️</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Shop with Confidence</Text>
                  <Text style={styles.instructionText}>
                    When we recommend items to buy, we provide affiliate links filtered by your size, style preferences, and budget. We earn a small commission at no extra cost to you.
                  </Text>
                </View>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionIcon}>📏</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Update Your Profile</Text>
                  <Text style={styles.instructionText}>
                    Keep your measurements, style preferences, and wardrobe up to date in Settings for the best recommendations.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>About</Text>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>App Version</Text>
              <Text style={styles.aboutValue}>
                {Constants.expoConfig?.version || '1.0.0'}
              </Text>
            </View>
            <SettingsItem
              icon="📋"
              title="Terms of Service"
              description="Read our terms and conditions"
              onPress={() => {
                Alert.alert('Terms of Service', 'Terms of service will be available soon.');
              }}
            />
            <SettingsItem
              icon="📧"
              title="Contact Support"
              description="Get help or report an issue"
              onPress={() => {
                Alert.alert(
                  'Contact Support',
                  'Email: support@gauge.app\n\nWe typically respond within 24 hours.'
                );
              }}
            />
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
  header: {
    marginBottom: TailorSpacing.xl,
    alignItems: 'center',
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
  },
  premiumBanner: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 4,
    borderLeftColor: TailorColors.gold,
  },
  premiumIcon: {
    fontSize: 24,
    marginRight: TailorSpacing.sm,
  },
  premiumText: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
  },
  section: {
    marginBottom: TailorSpacing.xl,
  },
  sectionHeader: {
    ...TailorTypography.h2,
    color: TailorColors.gold,
    marginBottom: TailorSpacing.md,
    borderBottomWidth: 2,
    borderBottomColor: TailorColors.gold,
    paddingBottom: TailorSpacing.xs,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.sm,
    ...TailorShadows.small,
  },
  settingsIcon: {
    fontSize: 24,
    marginRight: TailorSpacing.md,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
    marginBottom: TailorSpacing.xs / 2,
  },
  settingsItemDescription: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 12,
  },
  settingsArrow: {
    ...TailorTypography.h2,
    color: TailorColors.gold,
    fontSize: 20,
    marginLeft: TailorSpacing.sm,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.sm,
  },
  aboutLabel: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
  },
  aboutValue: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
  },
  instructionsCard: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginBottom: TailorSpacing.sm,
  },
  instructionsTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.md,
    fontWeight: '600',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: TailorSpacing.md,
    alignItems: 'flex-start',
  },
  instructionIcon: {
    fontSize: 24,
    marginRight: TailorSpacing.sm,
    marginTop: TailorSpacing.xs,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
    marginBottom: TailorSpacing.xs,
  },
  instructionText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    lineHeight: 18,
  },
});

