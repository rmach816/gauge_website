import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WoodBackground } from '../../components/WoodBackground';
import { GoldButton } from '../../components/GoldButton';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../../utils/constants';
import { RootStackParamList } from '../../types';
import { StorageService } from '../../services/storage';
import { OnboardingService } from '../../services/onboarding';
import { calculateSizes, CalculatedSizes } from '../../utils/sizeCalculator';

type SizeReportScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * SizeReportScreen
 * Shows calculated clothing sizes based on user's measurements
 * Beautiful, professional presentation of sizing information
 */
export const SizeReportScreen: React.FC = () => {
  const navigation = useNavigation<SizeReportScreenNavigationProp>();
  const [sizes, setSizes] = useState<CalculatedSizes | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromSettings, setIsFromSettings] = useState(false);

  useEffect(() => {
    loadSizesFromMeasurements();
    checkIfFromSettings();
  }, []);

  const checkIfFromSettings = async () => {
    const hasCompleted = await OnboardingService.hasCompletedOnboarding();
    setIsFromSettings(hasCompleted);
  };

  const loadSizesFromMeasurements = async () => {
    try {
      // Get measurements from user profile
      const profile = await StorageService.getUserProfile();
      
      if (profile?.measurements) {
        const calculatedSizes = calculateSizes(profile.measurements);
        setSizes(calculatedSizes);
      }
    } catch (error) {
      console.error('[SizeReportScreen] Failed to calculate sizes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartUsingApp = async () => {
    // Mark onboarding as complete
    await OnboardingService.markOnboardingComplete();
    
    // Go straight to the main app
    navigation.replace('MainTabs');
  };

  const handleLearnHow = async () => {
    // Mark onboarding as complete
    await OnboardingService.markOnboardingComplete();
    
    // Go to tutorial/how-to screen
    navigation.replace('Tutorial');
  };

  const handleGoBack = () => {
    // If viewing from settings, just go back
    navigation.goBack();
  };

  if (loading) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Calculating your sizes...</Text>
          </View>
        </SafeAreaView>
      </WoodBackground>
    );
  }

  if (!sizes) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Unable to calculate sizes. Please ensure you've entered your measurements.
            </Text>
            <GoldButton title="Go Back" onPress={() => navigation.goBack()} />
          </View>
        </SafeAreaView>
      </WoodBackground>
    );
  }

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Back Button (when viewing from Settings) */}
        {isFromSettings && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <ExpoImage
              source={require('../../../assets/gauge-symbol-transparent.png')}
              style={styles.gaugeSymbol}
              contentFit="contain"
              transition={200}
            />
            <Text style={styles.title}>Your Size Profile</Text>
            <Text style={styles.subtitle}>
              Professional sizing recommendations based on your measurements
            </Text>
          </View>

          {/* Jacket Size Card */}
          <View style={styles.sizeCard}>
            <View style={styles.sizeCardHeader}>
              <Text style={styles.sizeCardIcon}>🧥</Text>
              <Text style={styles.sizeCardTitle}>Suit Jacket</Text>
            </View>
            <Text style={styles.sizeCardSize}>{sizes.jacket.size}</Text>
            <Text style={styles.sizeCardDetail}>
              Size {sizes.jacket.numeric} • {sizes.jacket.length === 'S' ? 'Short' : sizes.jacket.length === 'R' ? 'Regular' : 'Long'} Length
            </Text>
            {sizes.jacket.notes.map((note, index) => (
              <Text key={index} style={styles.sizeCardNote}>• {note}</Text>
            ))}
          </View>

          {/* Dress Shirt Size Card */}
          <View style={styles.sizeCard}>
            <View style={styles.sizeCardHeader}>
              <Text style={styles.sizeCardIcon}>👔</Text>
              <Text style={styles.sizeCardTitle}>Dress Shirt</Text>
            </View>
            <Text style={styles.sizeCardSize}>{sizes.dressShirt.size}</Text>
            <Text style={styles.sizeCardDetail}>
              Neck: {sizes.dressShirt.neck}" • Sleeve: {sizes.dressShirt.sleeve}"
            </Text>
            {sizes.dressShirt.notes.map((note, index) => (
              <Text key={index} style={styles.sizeCardNote}>• {note}</Text>
            ))}
          </View>

          {/* Casual Shirt Size Card */}
          <View style={styles.sizeCard}>
            <View style={styles.sizeCardHeader}>
              <Text style={styles.sizeCardIcon}>👕</Text>
              <Text style={styles.sizeCardTitle}>Casual Shirts</Text>
            </View>
            <Text style={styles.sizeCardSize}>{sizes.casualShirt.size}</Text>
            <Text style={styles.sizeCardDetail}>
              T-shirts, Polos, Casual Button-Ups
            </Text>
            {sizes.casualShirt.notes.map((note, index) => (
              <Text key={index} style={styles.sizeCardNote}>• {note}</Text>
            ))}
          </View>

          {/* Dress Pants Size Card */}
          <View style={styles.sizeCard}>
            <View style={styles.sizeCardHeader}>
              <Text style={styles.sizeCardIcon}>👖</Text>
              <Text style={styles.sizeCardTitle}>Dress Pants</Text>
            </View>
            <Text style={styles.sizeCardSize}>{sizes.dressPants.size}</Text>
            <Text style={styles.sizeCardDetail}>
              Waist: {sizes.dressPants.waist}" • Inseam: {sizes.dressPants.inseam}"
            </Text>
            {sizes.dressPants.notes.map((note, index) => (
              <Text key={index} style={styles.sizeCardNote}>• {note}</Text>
            ))}
          </View>

          {/* Casual Pants Size Card */}
          <View style={styles.sizeCard}>
            <View style={styles.sizeCardHeader}>
              <Text style={styles.sizeCardIcon}>👖</Text>
              <Text style={styles.sizeCardTitle}>Jeans & Casual Pants</Text>
            </View>
            <Text style={styles.sizeCardSize}>{sizes.casualPants.size}</Text>
            <Text style={styles.sizeCardDetail}>
              Waist: {sizes.casualPants.waist}" • Inseam: {sizes.casualPants.inseam}"
            </Text>
            {sizes.casualPants.notes.map((note, index) => (
              <Text key={index} style={styles.sizeCardNote}>• {note}</Text>
            ))}
          </View>

          {/* Important Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>📋 Important Notes</Text>
            <Text style={styles.notesText}>
              • These sizes are professional recommendations based on industry standards
            </Text>
            <Text style={styles.notesText}>
              • Sizing can vary between brands - always try on when possible
            </Text>
            <Text style={styles.notesText}>
              • For the perfect fit, consider professional tailoring
            </Text>
            <Text style={styles.notesText}>
              • Update your measurements in Settings for accurate recommendations
            </Text>
          </View>

          {/* Action Buttons */}
          {isFromSettings ? (
            // Viewing from Settings - just show back button
            <GoldButton
              title="Back to Settings"
              onPress={handleGoBack}
              style={styles.continueButton}
            />
          ) : (
            // During onboarding - show two options
            <>
              <GoldButton
                title="Start Using GAUGE"
                onPress={handleStartUsingApp}
                style={styles.primaryButton}
              />
              
              <TouchableOpacity onPress={handleLearnHow} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Learn How to Use GAUGE</Text>
              </TouchableOpacity>

              {/* Accessibility Note */}
              <Text style={styles.accessibilityNote}>
                You can view this report anytime from Settings
              </Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TailorSpacing.lg,
    paddingVertical: TailorSpacing.md,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 28,
    color: TailorColors.gold,
    marginRight: TailorSpacing.xs,
  },
  backText: {
    ...TailorTypography.bodyLarge,
    color: TailorColors.gold,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: TailorSpacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  loadingText: {
    ...TailorTypography.h2,
    color: TailorColors.gold,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  errorText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: TailorSpacing.xl,
  },
  gaugeSymbol: {
    width: 80,
    height: 80,
    marginBottom: TailorSpacing.md,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorColors.gold,
    textAlign: 'center',
    marginTop: TailorSpacing.md,
    marginBottom: TailorSpacing.sm,
  },
  subtitle: {
    ...TailorTypography.body,
    color: TailorColors.cream,
    textAlign: 'center',
    lineHeight: 22,
  },
  sizeCard: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.lg,
    padding: TailorSpacing.lg,
    marginBottom: TailorSpacing.md,
    ...TailorShadows.medium,
  },
  sizeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TailorSpacing.sm,
  },
  sizeCardIcon: {
    fontSize: 32,
    marginRight: TailorSpacing.sm,
  },
  sizeCardTitle: {
    ...TailorTypography.h3,
    color: TailorColors.gold,
    flex: 1,
  },
  sizeCardSize: {
    ...TailorTypography.display,
    fontSize: 42,
    color: TailorContrasts.onWoodMedium,
    textAlign: 'center',
    marginVertical: TailorSpacing.sm,
  },
  sizeCardDetail: {
    ...TailorTypography.bodyLarge,
    color: TailorColors.cream,
    textAlign: 'center',
    marginBottom: TailorSpacing.sm,
  },
  sizeCardNote: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginTop: TailorSpacing.xs,
    lineHeight: 18,
  },
  notesSection: {
    backgroundColor: TailorColors.woodDark,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginVertical: TailorSpacing.lg,
  },
  notesTitle: {
    ...TailorTypography.h3,
    color: TailorColors.gold,
    marginBottom: TailorSpacing.sm,
  },
  notesText: {
    ...TailorTypography.body,
    color: TailorColors.cream,
    marginBottom: TailorSpacing.xs,
    lineHeight: 22,
  },
  continueButton: {
    marginTop: TailorSpacing.md,
    marginBottom: TailorSpacing.sm,
  },
  primaryButton: {
    marginTop: TailorSpacing.lg,
    marginBottom: TailorSpacing.sm,
  },
  secondaryButton: {
    paddingVertical: TailorSpacing.md,
    paddingHorizontal: TailorSpacing.lg,
    alignItems: 'center',
    marginBottom: TailorSpacing.md,
  },
  secondaryButtonText: {
    ...TailorTypography.bodyLarge,
    color: TailorColors.gold,
    textDecorationLine: 'underline',
  },
  accessibilityNote: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    textAlign: 'center',
    marginTop: TailorSpacing.sm,
    marginBottom: TailorSpacing.xl,
  },
});

