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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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

type MeasurementStepScreenRouteProp = RouteProp<
  { params: { measurementType: string; stepNumber: number; totalSteps: number } },
  'params'
>;
type MeasurementStepScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface MeasurementConfig {
  name: string;
  unit: string;
  placeholder: string;
  instructions: string;
  guideImage?: any;
  min?: number;
  max?: number;
  isHeight?: boolean; // Special flag for height (feet/inches)
}

const MEASUREMENT_CONFIGS: Record<string, MeasurementConfig> = {
  height: {
    name: 'Height',
    unit: 'ft/in',
    placeholder: 'Enter height',
    instructions: 'Stand straight, measure from floor to top of head',
    min: 48, // 4 feet in inches
    max: 84, // 7 feet in inches
    isHeight: true,
  },
  weight: {
    name: 'Weight',
    unit: 'lbs',
    placeholder: 'Enter weight',
    instructions: 'Weigh yourself in the morning, before eating',
    min: 80,
    max: 400,
  },
  chest: {
    name: 'Chest',
    unit: 'inches',
    placeholder: 'Enter chest measurement',
    instructions: 'Measure around the fullest part of your chest, breathe normally',
    min: 30,
    max: 60,
  },
  waist: {
    name: 'Waist',
    unit: 'inches',
    placeholder: 'Enter waist measurement',
    instructions: 'Measure at the narrowest point, don\'t hold your breath',
    min: 24,
    max: 50,
  },
  inseam: {
    name: 'Inseam',
    unit: 'inches',
    placeholder: 'Enter inseam measurement',
    instructions: 'Measure inside leg from crotch to ankle bone',
    min: 24,
    max: 40,
  },
  neck: {
    name: 'Neck',
    unit: 'inches',
    placeholder: 'Enter neck measurement',
    instructions: 'Measure at base of neck, leave 2 fingers of space',
    min: 12,
    max: 20,
  },
  sleeve: {
    name: 'Sleeve',
    unit: 'inches',
    placeholder: 'Enter sleeve measurement',
    instructions: 'Measure from center back neck, over shoulder, to wrist bone',
    min: 28,
    max: 38,
  },
  shoulder: {
    name: 'Shoulder',
    unit: 'inches',
    placeholder: 'Enter shoulder measurement',
    instructions: 'Measure from shoulder point to shoulder point, across back',
    min: 14,
    max: 24,
  },
};

// Measurement order for navigation
const MEASUREMENT_ORDER = ['height', 'weight', 'chest', 'waist', 'inseam', 'neck', 'sleeve', 'shoulder'];

/**
 * MeasurementStepScreen
 * Reusable component for each measurement step in onboarding
 */
export const MeasurementStepScreen: React.FC = () => {
  const navigation = useNavigation<MeasurementStepScreenNavigationProp>();
  const route = useRoute<MeasurementStepScreenRouteProp>();
  const { measurementType, stepNumber, totalSteps } = route.params || {
    measurementType: 'height',
    stepNumber: 1,
    totalSteps: 8,
  };

  const config = MEASUREMENT_CONFIGS[measurementType] || MEASUREMENT_CONFIGS.height;
  const isHeight = config.isHeight || false;

  // For height: two inputs (feet and inches)
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  // For other measurements: single input
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  // Load saved measurement when screen opens or measurementType changes
  useEffect(() => {
    loadSavedMeasurement();
  }, [measurementType]);

  const loadSavedMeasurement = async () => {
    try {
      // CRITICAL FIX: Load from UserProfile first (source of truth for AI Chat)
      // Fall back to OnboardingState if not in profile yet
      const profile = await StorageService.getUserProfile();
      let savedValue: number | undefined;
      
      if (profile?.measurements && (profile.measurements as any)[measurementType]) {
        savedValue = (profile.measurements as any)[measurementType] as number;
        console.log(`[MeasurementStepScreen] Loading ${measurementType} from UserProfile: ${savedValue}`);
      } else {
        // Fall back to OnboardingState (during initial onboarding)
        const state = await OnboardingService.getOnboardingState();
        if (state.measurements && (state.measurements as any)[measurementType]) {
          savedValue = (state.measurements as any)[measurementType] as number;
          console.log(`[MeasurementStepScreen] Loading ${measurementType} from OnboardingState: ${savedValue}`);
        }
      }
      
      if (savedValue !== undefined) {
        if (isHeight) {
          // Convert total inches to feet and inches
          const feetNum = Math.floor(savedValue / 12);
          const inchesNum = savedValue % 12;
          setFeet(feetNum.toString());
          setInches(inchesNum.toString());
        } else {
          // Set the saved value
          setValue(savedValue.toString());
        }
      } else {
        // Clear inputs if no saved value
        setFeet('');
        setInches('');
        setValue('');
      }
      setError('');
    } catch (error) {
      console.error('[MeasurementStepScreen] Failed to load saved measurement:', error);
      // Clear on error
      setFeet('');
      setInches('');
      setValue('');
    }
  };

  const validateAndSave = async () => {
    let numValue: number;

    if (isHeight) {
      // Height: convert feet/inches to total inches
      const feetNum = parseFloat(feet);
      const inchesNum = parseFloat(inches);

      if (!feet.trim() || !inches.trim()) {
        setError('Please enter both feet and inches');
        return;
      }

      if (isNaN(feetNum) || feetNum < 4 || feetNum > 7) {
        setError('Feet should be between 4 and 7');
        return;
      }

      if (isNaN(inchesNum) || inchesNum < 0 || inchesNum >= 12) {
        setError('Inches should be between 0 and 11');
        return;
      }

      numValue = feetNum * 12 + inchesNum;
    } else {
      // Other measurements: single value
      numValue = parseFloat(value);
      
      if (!value.trim()) {
        setError('Please enter a measurement');
        return;
      }

      if (isNaN(numValue) || numValue <= 0) {
        setError('Please enter a valid number');
        return;
      }

      if (config.min && numValue < config.min) {
        setError(`Value should be at least ${config.min} ${config.unit}`);
        return;
      }

      if (config.max && numValue > config.max) {
        setError(`Value should be at most ${config.max} ${config.unit}`);
        return;
      }
    }

    setError('');

    // Save measurement to onboarding state
    const state = await OnboardingService.getOnboardingState();
    if (!state.measurements) {
      state.measurements = {} as any;
    }
    (state.measurements as any)[measurementType] = numValue;
    await OnboardingService.saveOnboardingState(state);

    // Mark step as complete
    await OnboardingService.markStepComplete(measurementType);

    // CRITICAL FIX: ALWAYS save measurements to UserProfile immediately after saving to OnboardingState
    // This ensures measurements are available to AI Chat whether during onboarding or editing from Settings
    try {
      const profile = await StorageService.getUserProfile();
      
      if (profile) {
        // Update existing profile with ALL measurements from OnboardingState
        profile.measurements = {
          ...state.measurements,
          preferredFit: profile.measurements?.preferredFit || 'regular',
          updatedAt: new Date().toISOString(),
        } as any;
        profile.updatedAt = new Date().toISOString();
        await StorageService.saveUserProfile(profile);
        console.log(`[MeasurementStepScreen] ✅ Saved ${measurementType} measurement to UserProfile`);
      } else {
        // Create new profile with current measurements
        const newProfile: any = {
          id: `user-${Date.now()}`,
          measurements: {
            ...state.measurements,
            preferredFit: 'regular',
            updatedAt: new Date().toISOString(),
          },
          stylePreference: state.stylePreferences || [],
          favoriteOccasions: [],
          shoeSize: state.shoeSize,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await StorageService.saveUserProfile(newProfile);
        console.log(`[MeasurementStepScreen] ✅ Created new UserProfile with ${measurementType} measurement`);
      }
    } catch (error) {
      console.error('[MeasurementStepScreen] ❌ Failed to save measurement to UserProfile:', error);
      // Don't throw - allow user to continue even if save fails
    }

    // Navigate to next measurement or next screen
    const currentIndex = MEASUREMENT_ORDER.indexOf(measurementType);
    if (currentIndex < MEASUREMENT_ORDER.length - 1) {
      // Navigate to next measurement
      const nextMeasurement = MEASUREMENT_ORDER[currentIndex + 1];
      navigation.navigate('MeasurementStep', {
        measurementType: nextMeasurement,
        stepNumber: stepNumber + 1,
        totalSteps,
      });
    } else {
      // All measurements done - navigate to style preferences
      navigation.replace('StylePreferences');
    }
  };

  const handleSkip = async () => {
    await OnboardingService.markStepSkipped(measurementType);
    
    // Navigate to next step
    const currentIndex = MEASUREMENT_ORDER.indexOf(measurementType);
    if (currentIndex < MEASUREMENT_ORDER.length - 1) {
      const nextMeasurement = MEASUREMENT_ORDER[currentIndex + 1];
      navigation.navigate('MeasurementStep', {
        measurementType: nextMeasurement,
        stepNumber: stepNumber + 1,
        totalSteps,
      });
    } else {
      // All measurements done, go to style preferences (use replace to prevent going back)
      navigation.replace('StylePreferences');
    }
  };

  const handleGoToSelection = () => {
    navigation.navigate('MeasurementSelection');
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
          <ProgressIndicator currentStep={stepNumber} totalSteps={totalSteps} />

          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{config.name} Measurement</Text>
              <TouchableOpacity
                onPress={handleGoToSelection}
                style={styles.selectionButton}
              >
                <Text style={styles.selectionButtonText}>📋 All</Text>
              </TouchableOpacity>
            </View>

            {/* Input Field at TOP (before guide) */}
            <View style={styles.inputSection}>
              {isHeight ? (
                // Height: Two inputs (feet and inches)
                <View style={styles.heightInputContainer}>
                  <View style={styles.heightInputWrapper}>
                    <TextInput
                      style={[styles.heightInput, error && styles.inputError]}
                      value={feet}
                      onChangeText={(text) => {
                        setFeet(text.replace(/[^0-9]/g, ''));
                        setError('');
                      }}
                      placeholder="5"
                      placeholderTextColor={TailorColors.grayMedium}
                      keyboardType="number-pad"
                      autoFocus
                      maxLength={1}
                    />
                    <Text style={styles.heightLabel}>ft</Text>
                  </View>
                  
                  <Text style={styles.heightSeparator}>'</Text>
                  
                  <View style={styles.heightInputWrapper}>
                    <TextInput
                      style={[styles.heightInput, error && styles.inputError]}
                      value={inches}
                      onChangeText={(text) => {
                        setInches(text.replace(/[^0-9]/g, ''));
                        setError('');
                      }}
                      placeholder="10"
                      placeholderTextColor={TailorColors.grayMedium}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                    <Text style={styles.heightLabel}>in</Text>
                  </View>
                </View>
              ) : (
                // Other measurements: Single input
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={(text) => {
                      setValue(text);
                      setError('');
                    }}
                    placeholder={config.placeholder}
                    placeholderTextColor={TailorColors.grayMedium}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                  <Text style={styles.unit}>{config.unit}</Text>
                </View>
              )}

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructions}>{config.instructions}</Text>
            </View>

            {/* Special message for weight */}
            {measurementType === 'weight' && (
              <View style={styles.reassuranceContainer}>
                <Text style={styles.reassuranceText}>
                  Don't worry, you're in a judgment-free zone. This helps me suggest the right fit.
                </Text>
              </View>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <GoldButton
              title="Next"
              onPress={validateAndSave}
              style={styles.nextButton}
            />

            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip This</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TailorSpacing.xl,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    flex: 1,
  },
  selectionButton: {
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    borderWidth: 1,
    borderColor: TailorColors.gold,
  },
  selectionButtonText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: TailorSpacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TailorColors.parchment,
    borderRadius: TailorBorderRadius.md,
    paddingHorizontal: TailorSpacing.md,
    marginBottom: TailorSpacing.sm,
    borderWidth: 2,
    borderColor: TailorColors.gold,
  },
  input: {
    flex: 1,
    ...TailorTypography.h2,
    color: TailorColors.navy,
    paddingVertical: TailorSpacing.md,
    textAlign: 'center',
  },
  inputError: {
    borderColor: TailorColors.burgundy,
  },
  unit: {
    ...TailorTypography.body,
    color: TailorColors.navyLight,
    marginLeft: TailorSpacing.sm,
  },
  heightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TailorColors.parchment,
    borderRadius: TailorBorderRadius.md,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.md,
    borderWidth: 2,
    borderColor: TailorColors.gold,
  },
  heightInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  heightInput: {
    ...TailorTypography.h2,
    color: TailorColors.navy,
    textAlign: 'center',
    minWidth: 60,
    paddingVertical: TailorSpacing.md,
  },
  heightLabel: {
    ...TailorTypography.body,
    color: TailorColors.navyLight,
    marginLeft: TailorSpacing.xs,
  },
  heightSeparator: {
    ...TailorTypography.h2,
    color: TailorColors.navy,
    marginHorizontal: TailorSpacing.md,
  },
  errorText: {
    ...TailorTypography.caption,
    color: TailorColors.burgundy,
    textAlign: 'center',
    marginTop: TailorSpacing.sm,
  },
  instructionsContainer: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.xl,
  },
  instructions: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  reassuranceContainer: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginTop: TailorSpacing.md,
  },
  reassuranceText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    marginTop: TailorSpacing.xl,
  },
  nextButton: {
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
