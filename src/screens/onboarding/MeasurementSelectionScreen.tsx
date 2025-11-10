import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
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
import { OnboardingService } from '../../services/onboarding';
import { StorageService } from '../../services/storage';

type MeasurementSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface MeasurementInfo {
  key: string;
  name: string;
  unit: string;
  icon: string;
}

const MEASUREMENTS: MeasurementInfo[] = [
  { key: 'height', name: 'Height', unit: 'ft/in', icon: '📏' },
  { key: 'weight', name: 'Weight', unit: 'lbs', icon: '⚖️' },
  { key: 'chest', name: 'Chest', unit: 'inches', icon: '👔' },
  { key: 'waist', name: 'Waist', unit: 'inches', icon: '👖' },
  { key: 'inseam', name: 'Inseam', unit: 'inches', icon: '🦵' },
  { key: 'neck', name: 'Neck', unit: 'inches', icon: '👕' },
  { key: 'sleeve', name: 'Sleeve', unit: 'inches', icon: '🫱' },
  { key: 'shoulder', name: 'Shoulder', unit: 'inches', icon: '↔️' },
];

/**
 * MeasurementSelectionScreen
 * Allows users to jump to any measurement or continue sequentially
 */
export const MeasurementSelectionScreen: React.FC = () => {
  const navigation = useNavigation<MeasurementSelectionScreenNavigationProp>();
  const [savedMeasurements, setSavedMeasurements] = useState<Record<string, number>>({});
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadSavedMeasurements();
  }, []);

  const loadSavedMeasurements = async () => {
    try {
      // CRITICAL FIX: Load from UserProfile first (source of truth for AI Chat)
      // Then sync to OnboardingState to keep them in sync
      const profile = await StorageService.getUserProfile();
      
      if (profile?.measurements) {
        // User has saved measurements in profile - use those
        const numericMeasurements: Record<string, number> = {};
        Object.keys(profile.measurements).forEach(key => {
          const value = (profile.measurements as any)[key];
          if (typeof value === 'number') {
            numericMeasurements[key] = value;
          }
        });
        setSavedMeasurements(numericMeasurements);
        setCompletedCount(Object.keys(numericMeasurements).length);
        
        // Sync to OnboardingState so editing works correctly
        const state = await OnboardingService.getOnboardingState();
        state.measurements = profile.measurements;
        await OnboardingService.saveOnboardingState(state);
        console.log('[MeasurementSelectionScreen] ✅ Loaded measurements from UserProfile and synced to OnboardingState');
      } else {
        // No profile measurements yet - check OnboardingState (during initial onboarding)
        const state = await OnboardingService.getOnboardingState();
        if (state.measurements) {
          const numericMeasurements: Record<string, number> = {};
          Object.keys(state.measurements).forEach(key => {
            const value = (state.measurements as any)[key];
            if (typeof value === 'number') {
              numericMeasurements[key] = value;
            }
          });
          setSavedMeasurements(numericMeasurements);
          setCompletedCount(Object.keys(numericMeasurements).length);
          console.log('[MeasurementSelectionScreen] Loaded measurements from OnboardingState (initial onboarding)');
        }
      }
    } catch (error) {
      console.error('[MeasurementSelectionScreen] Failed to load measurements:', error);
    }
  };

  const handleSelectMeasurement = (measurementKey: string) => {
    const index = MEASUREMENTS.findIndex(m => m.key === measurementKey);
    navigation.navigate('MeasurementStep', {
      measurementType: measurementKey,
      stepNumber: index + 1,
      totalSteps: MEASUREMENTS.length,
    });
  };

  const handleAllCorrect = async () => {
    // CRITICAL FIX: Save measurements from onboarding state to user profile
    try {
      const state = await OnboardingService.getOnboardingState();
      
      if (state.measurements && Object.keys(state.measurements).length > 0) {
        // Get existing profile or create new one
        const profile = await StorageService.getUserProfile();
        
        if (profile) {
          // Update existing profile with measurements
          profile.measurements = {
            ...state.measurements,
            preferredFit: profile.measurements?.preferredFit || 'regular',
            updatedAt: new Date().toISOString(),
          } as any;
          profile.updatedAt = new Date().toISOString();
          await StorageService.saveUserProfile(profile);
          console.log('[MeasurementSelectionScreen] ✅ Saved measurements to user profile:', profile.measurements);
        } else {
          // Create new profile with measurements
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
          console.log('[MeasurementSelectionScreen] ✅ Created new profile with measurements');
        }
      }
    } catch (error) {
      console.error('[MeasurementSelectionScreen] ❌ Failed to save measurements to profile:', error);
    }
    
    // Check if we're in initial onboarding or editing from Settings
    const hasCompletedOnboarding = await OnboardingService.hasCompletedOnboarding();
    if (hasCompletedOnboarding) {
      // User is editing from Settings - go back
      navigation.goBack();
    } else {
      // Initial onboarding: navigate to shoe size (next step)
      navigation.replace('ShoeSize');
    }
  };

  const formatSavedValue = (measurementKey: string, value: number): string => {
    if (measurementKey === 'height') {
      const feet = Math.floor(value / 12);
      const inches = value % 12;
      return `${feet}'${inches}"`;
    }
    return `${value} ${MEASUREMENTS.find(m => m.key === measurementKey)?.unit || ''}`;
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Measurements</Text>
          <Text style={styles.subtitle}>
            {completedCount === MEASUREMENTS.length
              ? 'All measurements complete! Tap any to update.'
              : `${completedCount} of ${MEASUREMENTS.length} completed`}
          </Text>
        </View>

        <View style={styles.measurementsGrid}>
          {MEASUREMENTS.map((measurement) => {
            const isCompleted = !!savedMeasurements[measurement.key];
            const savedValue = savedMeasurements[measurement.key];

            return (
              <TouchableOpacity
                key={measurement.key}
                style={[
                  styles.measurementCard,
                  isCompleted && styles.measurementCardCompleted,
                ]}
                onPress={() => handleSelectMeasurement(measurement.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.measurementIcon}>{measurement.icon}</Text>
                <Text style={styles.measurementName}>{measurement.name}</Text>
                <Text style={styles.measurementUnit}>{measurement.unit}</Text>
                {isCompleted && savedValue !== undefined && (
                  <View style={styles.savedValueContainer}>
                    <Text style={styles.savedValueLabel}>Saved:</Text>
                    <Text style={styles.savedValue}>
                      {formatSavedValue(measurement.key, savedValue)}
                    </Text>
                  </View>
                )}
                {isCompleted && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          {completedCount === MEASUREMENTS.length ? (
            <GoldButton
              title="All Measurements Are Correct"
              onPress={handleAllCorrect}
              style={styles.continueButton}
            />
          ) : (
            <GoldButton
              title="Continue Sequentially"
              onPress={() => {
                // Find first incomplete measurement
                const firstIncomplete = MEASUREMENTS.find(m => !savedMeasurements[m.key]);
                if (firstIncomplete) {
                  const index = MEASUREMENTS.findIndex(m => m.key === firstIncomplete.key);
                  navigation.navigate('MeasurementStep', {
                    measurementType: firstIncomplete.key,
                    stepNumber: index + 1,
                    totalSteps: MEASUREMENTS.length,
                  });
                }
              }}
              style={styles.continueButton}
            />
          )}
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
  header: {
    marginBottom: TailorSpacing.xl,
    alignItems: 'center',
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
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: TailorSpacing.xl,
  },
  measurementCard: {
    width: '48%',
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginBottom: TailorSpacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: TailorColors.woodLight,
    ...TailorShadows.small,
    position: 'relative',
  },
  measurementCardCompleted: {
    borderColor: TailorColors.gold,
    backgroundColor: TailorColors.woodDark,
  },
  measurementIcon: {
    fontSize: 32,
    marginBottom: TailorSpacing.xs,
  },
  measurementName: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
    textAlign: 'center',
  },
  measurementUnit: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    textAlign: 'center',
  },
  savedValueContainer: {
    marginTop: TailorSpacing.sm,
    paddingTop: TailorSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: TailorColors.woodLight,
    width: '100%',
    alignItems: 'center',
  },
  savedValueLabel: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.xs,
  },
  savedValue: {
    ...TailorTypography.body,
    color: TailorColors.gold,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: TailorSpacing.xs,
    right: TailorSpacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: TailorColors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: TailorColors.navy,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
    marginTop: TailorSpacing.lg,
  },
  continueButton: {
    marginBottom: TailorSpacing.md,
  },
});

