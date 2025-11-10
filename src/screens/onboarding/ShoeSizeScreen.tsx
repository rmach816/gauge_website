import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
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
} from '../../utils/constants';
import { RootStackParamList } from '../../types';
import { OnboardingService } from '../../services/onboarding';
import { StorageService } from '../../services/storage';

type ShoeSizeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * ShoeSizeScreen
 * Collects user's shoe size during onboarding
 */
export const ShoeSizeScreen: React.FC = () => {
  const navigation = useNavigation<ShoeSizeScreenNavigationProp>();
  const [shoeSize, setShoeSize] = useState('');
  const [error, setError] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(true);

  useEffect(() => {
    loadSavedShoeSize();
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const hasCompleted = await OnboardingService.hasCompletedOnboarding();
    setIsOnboarding(!hasCompleted);
  };

  const loadSavedShoeSize = async () => {
    try {
      // Try to load from user profile first (if already saved)
      const profile = await StorageService.getUserProfile();
      if (profile?.shoeSize) {
        setShoeSize(profile.shoeSize);
        return;
      }
      // Otherwise load from onboarding state
      const state = await OnboardingService.getOnboardingState();
      if (state.shoeSize) {
        setShoeSize(state.shoeSize);
      }
    } catch (error) {
      console.error('[ShoeSizeScreen] Failed to load saved shoe size:', error);
    }
  };

  const handleContinue = async () => {
    const trimmedSize = shoeSize.trim();
    
    if (!trimmedSize) {
      setError('Please enter your shoe size');
      return;
    }

    if (trimmedSize.length < 1) {
      setError('Please enter a valid shoe size');
      return;
    }

    setError('');

    // Save shoe size to onboarding state
    try {
      const state = await OnboardingService.getOnboardingState();
      state.shoeSize = trimmedSize;
      await OnboardingService.saveOnboardingState(state);

      // Also save directly to user profile (for immediate access in Settings)
      // CRITICAL: Preserve existing measurements when updating profile
      try {
        const profile = await StorageService.getUserProfile();
        if (profile) {
          // Update existing profile, preserving measurements
          profile.shoeSize = trimmedSize;
          profile.updatedAt = new Date().toISOString();
          await StorageService.saveUserProfile(profile);
          console.log('[ShoeSizeScreen] Updated existing profile, measurements preserved:', !!profile.measurements);
        } else {
          // Create profile if it doesn't exist
          // Get measurements from onboarding state to include them in new profile
          const onboardingState = await OnboardingService.getOnboardingState();
          const newProfile: any = {
            id: `user-${Date.now()}`,
            shoeSize: trimmedSize,
            stylePreference: [],
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
            console.log('[ShoeSizeScreen] Creating new profile WITH measurements from onboarding state');
          } else {
            console.log('[ShoeSizeScreen] Creating new profile WITHOUT measurements (none in onboarding state yet)');
          }
          
          await StorageService.saveUserProfile(newProfile);
        }
      } catch (profileError) {
        console.error('[ShoeSizeScreen] Failed to save to profile:', profileError);
      }

      // Mark step as complete
      await OnboardingService.markStepComplete('shoe-size');

      // Check if we're in onboarding or editing from Settings
      const hasCompletedOnboarding = await OnboardingService.hasCompletedOnboarding();
      if (hasCompletedOnboarding) {
        // User is editing from Settings - go back
        navigation.goBack();
      } else {
        // Initial onboarding: navigate to style preferences (next in onboarding flow)
        navigation.replace('StylePreferences');
      }
    } catch (error) {
      console.error('[ShoeSizeScreen] Failed to save shoe size:', error);
      setError('Failed to save shoe size. Please try again.');
    }
  };

  const handleSkip = async () => {
    await OnboardingService.markStepSkipped('shoe-size');
    
      // Check if we're in onboarding or editing from Settings
      const hasCompletedOnboarding = await OnboardingService.hasCompletedOnboarding();
      if (hasCompletedOnboarding) {
        // User is editing from Settings - go back
        navigation.goBack();
      } else {
        // Initial onboarding: navigate to style preferences even if skipped
        navigation.replace('StylePreferences');
      }
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Only show progress indicator during onboarding */}
          {isOnboarding && (
            <ProgressIndicator currentStep={7} totalSteps={8} />
          )}

          <View style={styles.content}>
            <Text style={styles.title}>What's your shoe size?</Text>
            <Text style={styles.subtitle}>
              This helps us recommend shoes that fit perfectly.
            </Text>

            {/* Input Field at Top */}
            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  value={shoeSize}
                  onChangeText={(text) => {
                    setShoeSize(text);
                    setError('');
                  }}
                  placeholder="e.g., 10, 10.5, 42 (EU), 9 (UK)"
                  placeholderTextColor={TailorColors.grayMedium}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
              </View>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              <Text style={styles.helperText}>
                Enter your US size, or include the system (e.g., "42 EU" or "9 UK")
              </Text>
            </View>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>💡 Size Guide</Text>
              <Text style={styles.infoText}>
                • US sizes: 6-16 (most common){'\n'}
                • EU sizes: 39-50{'\n'}
                • UK sizes: 5-15{'\n'}
                • You can update this anytime in Settings
              </Text>
            </View>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <GoldButton
              title="Continue"
              onPress={handleContinue}
              style={styles.continueButton}
            />

            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
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
    marginBottom: TailorSpacing.md,
  },
  subtitle: {
    ...TailorTypography.bodyLarge,
    color: TailorColors.ivory,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: TailorSpacing.xl,
  },
  inputSection: {
    marginBottom: TailorSpacing.xl,
  },
  inputContainer: {
    backgroundColor: TailorColors.parchment,
    borderRadius: TailorBorderRadius.md,
    paddingHorizontal: TailorSpacing.md,
    marginBottom: TailorSpacing.sm,
    borderWidth: 2,
    borderColor: TailorColors.gold,
  },
  input: {
    ...TailorTypography.h2,
    color: TailorColors.navy,
    paddingVertical: TailorSpacing.md,
    textAlign: 'center',
  },
  inputError: {
    borderColor: TailorColors.burgundy,
  },
  errorText: {
    ...TailorTypography.caption,
    color: TailorColors.burgundy,
    textAlign: 'center',
    marginTop: TailorSpacing.sm,
  },
  helperText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    textAlign: 'center',
    marginTop: TailorSpacing.sm,
    fontStyle: 'italic',
  },
  infoContainer: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginTop: TailorSpacing.xl,
  },
  infoTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.sm,
  },
  infoText: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    lineHeight: 22,
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

