import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WoodBackground } from '../../components/WoodBackground';
import { GoldButton } from '../../components/GoldButton';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../../utils/constants';
import { StylePreference } from '../../types';
import { OnboardingService } from '../../services/onboarding';
import { StorageService } from '../../services/storage';
import { RootStackParamList } from '../../types';

type StylePreferencesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface StyleOption {
  preference: StylePreference;
  name: string;
  description: string;
  emoji: string;
  image: any; // Image source from require()
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    preference: StylePreference.CONSERVATIVE,
    name: 'Conservative',
    description: 'Classic, professional, timeless',
    emoji: '👔',
    image: require('../../../assets/conservative-outfit.png'),
  },
  {
    preference: StylePreference.MODERN,
    name: 'Modern',
    description: 'Smart casual, contemporary, clean',
    emoji: '🧢',
    image: require('../../../assets/modern-outfit.png'),
  },
  {
    preference: StylePreference.STYLISH,
    name: 'Stylish',
    description: 'Well-fitted, polished, put-together',
    emoji: '🎩',
    image: require('../../../assets/stylish-outfit.png'),
  },
  {
    preference: StylePreference.FASHION_FORWARD,
    name: 'Fashion-Forward',
    description: 'Bold, trendy, statement pieces',
    emoji: '✨',
    image: require('../../../assets/fashion_forward-outfit.png'),
  },
  {
    preference: StylePreference.STREET,
    name: 'Street',
    description: 'Urban, casual, sneaker culture',
    emoji: '👟',
    image: require('../../../assets/street-outfit.png'),
  },
];

/**
 * StylePreferencesScreen
 * Allows users to select their style preferences (multi-select)
 */
export const StylePreferencesScreen: React.FC = () => {
  const navigation = useNavigation<StylePreferencesScreenNavigationProp>();
  const [selectedStyles, setSelectedStyles] = useState<StylePreference[]>([]);
  const [isOnboarding, setIsOnboarding] = useState(true);

  useEffect(() => {
    loadSavedPreferences();
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const hasCompleted = await OnboardingService.hasCompletedOnboarding();
    setIsOnboarding(!hasCompleted);
  };

  const loadSavedPreferences = async () => {
    try {
      // Try to load from user profile first (if already saved)
      const profile = await StorageService.getUserProfile();
      if (profile?.stylePreference && profile.stylePreference.length > 0) {
        setSelectedStyles(profile.stylePreference);
        return;
      }
      // Otherwise load from onboarding state
      const state = await OnboardingService.getOnboardingState();
      if (state.stylePreferences && state.stylePreferences.length > 0) {
        setSelectedStyles(state.stylePreferences);
      }
    } catch (error) {
      console.error('[StylePreferencesScreen] Failed to load preferences:', error);
    }
  };

  const toggleStyle = (preference: StylePreference) => {
    setSelectedStyles((prev) => {
      if (prev.includes(preference)) {
        return prev.filter((p) => p !== preference);
      } else {
        return [...prev, preference];
      }
    });
  };

  const handleContinue = async () => {
    // Save style preferences to onboarding state
    const state = await OnboardingService.getOnboardingState();
    state.stylePreferences = selectedStyles;
    await OnboardingService.saveOnboardingState(state);

    // Also save directly to user profile (for immediate access in Settings)
    // CRITICAL: Preserve existing measurements when updating profile
    try {
      const profile = await StorageService.getUserProfile();
      if (profile) {
        // Update existing profile, preserving measurements
        profile.stylePreference = selectedStyles;
        profile.updatedAt = new Date().toISOString();
        await StorageService.saveUserProfile(profile);
        console.log('[StylePreferencesScreen] Updated existing profile, measurements preserved:', !!profile.measurements);
      } else {
        // Create profile if it doesn't exist
        // Get measurements from onboarding state to include them in new profile
        const onboardingState = await OnboardingService.getOnboardingState();
        const newProfile: any = {
          id: `user-${Date.now()}`,
          stylePreference: selectedStyles,
          favoriteOccasions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Include measurements if they exist in onboarding state
        if (onboardingState.measurements) {
          newProfile.measurements = {
            ...onboardingState.measurements,
            preferredFit: 'regular',
            updatedAt: new Date().toISOString(),
          };
          console.log('[StylePreferencesScreen] Creating new profile WITH measurements from onboarding state');
        } else {
          console.log('[StylePreferencesScreen] Creating new profile WITHOUT measurements (none in onboarding state yet)');
        }
        
        // Include shoe size if it exists in onboarding state
        if (onboardingState.shoeSize) {
          newProfile.shoeSize = onboardingState.shoeSize;
        }
        
        await StorageService.saveUserProfile(newProfile);
      }
    } catch (error) {
      console.error('[StylePreferencesScreen] Failed to save to profile:', error);
    }

    // Mark step as complete
    await OnboardingService.markStepComplete('style-preferences');

    // Check if we're in onboarding or editing from Settings
    const hasCompletedOnboarding = await OnboardingService.hasCompletedOnboarding();
    if (hasCompletedOnboarding) {
      // User is editing from Settings - go back (standalone, no auto-navigation)
      navigation.goBack();
    } else {
      // Initial onboarding: navigate to wardrobe photo screen (next in onboarding flow)
      navigation.replace('WardrobePhoto');
    }
  };

  const handleSkip = async () => {
    await OnboardingService.markStepSkipped('style-preferences');
    
    // Check if we're in onboarding or editing from Settings
    const hasCompletedOnboarding = await OnboardingService.hasCompletedOnboarding();
    if (hasCompletedOnboarding) {
      // User is editing from Settings - go back (standalone, no auto-navigation)
      navigation.goBack();
    } else {
      // Initial onboarding: navigate to wardrobe photo screen even if skipped
      navigation.replace('WardrobePhoto');
    }
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Only show progress indicator during onboarding */}
        {isOnboarding && (
          <ProgressIndicator currentStep={6} totalSteps={8} />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>What's your style?</Text>
          <Text style={styles.subtitle}>
            Select all that apply. You can change this anytime.
          </Text>

          <View style={styles.optionsContainer}>
            {STYLE_OPTIONS.map((option) => {
              const isSelected = selectedStyles.includes(option.preference);
              
              return (
                <TouchableOpacity
                  key={option.preference}
                  style={[
                    styles.styleCard,
                    isSelected && styles.styleCardSelected,
                  ]}
                  onPress={() => toggleStyle(option.preference)}
                  activeOpacity={0.7}
                >
                  {/* Style Image */}
                  <View style={styles.imageContainer}>
                    <ExpoImage
                      source={option.image}
                      style={styles.styleImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>

                  {/* Style Info */}
                  <View style={styles.cardContent}>
                    <Text style={styles.styleName}>{option.name}</Text>
                    <Text style={styles.styleDescription}>{option.description}</Text>
                  </View>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedCheckmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <GoldButton
            title="Continue"
            onPress={handleContinue}
            disabled={selectedStyles.length === 0}
            style={styles.continueButton}
          />

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: TailorSpacing.xl,
    paddingBottom: TailorSpacing.xxxl,
  },
  content: {
    flex: 1,
    marginTop: TailorSpacing.lg,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.sm,
  },
  subtitle: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
    marginBottom: TailorSpacing.xl,
  },
  optionsContainer: {
    gap: TailorSpacing.md,
  },
  styleCard: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    ...TailorShadows.medium,
  },
  styleCardSelected: {
    borderColor: TailorColors.gold,
    borderWidth: 3,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: TailorColors.woodDark,
    overflow: 'hidden',
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: TailorSpacing.md,
  },
  styleName: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  styleDescription: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
  },
  selectedIndicator: {
    position: 'absolute',
    top: TailorSpacing.md,
    right: TailorSpacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TailorColors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...TailorShadows.small,
  },
  selectedCheckmark: {
    ...TailorTypography.h3,
    color: TailorContrasts.onGold,
    fontSize: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: TailorSpacing.xl,
  },
  continueButton: {
    marginBottom: TailorSpacing.md,
  },
  skipButton: {
    paddingVertical: TailorSpacing.sm,
    alignItems: 'center',
  },
  skipText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    textDecorationLine: 'underline',
  },
});

