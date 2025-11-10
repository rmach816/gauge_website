import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
  TailorContrasts,
  TailorBorderRadius,
} from '../../utils/constants';
import { RootStackParamList } from '../../types';
import { StorageService } from '../../services/storage';
import { OnboardingService } from '../../services/onboarding';

type GreetingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * GreetingScreen
 * Personalized greeting screen in onboarding flow
 */
export const GreetingScreen: React.FC = () => {
  const navigation = useNavigation<GreetingScreenNavigationProp>();
  const [userName, setUserName] = useState<string>('');
  const [hasSavedMeasurements, setHasSavedMeasurements] = useState(false);

  useEffect(() => {
    loadUserName();
    checkSavedMeasurements();
  }, []);

  const loadUserName = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      if (profile?.lastName) {
        setUserName(profile.lastName);
      }
    } catch (error) {
      console.error('[GreetingScreen] Failed to load user name:', error);
    }
  };

  const checkSavedMeasurements = async () => {
    try {
      const state = await OnboardingService.getOnboardingState();
      if (state.measurements && Object.keys(state.measurements).length > 0) {
        setHasSavedMeasurements(true);
      }
    } catch (error) {
      console.error('[GreetingScreen] Failed to check saved measurements:', error);
    }
  };

  const handleContinue = () => {
    // Navigate to measurement selection screen (allows jumping to any measurement)
    navigation.navigate('MeasurementSelection');
  };

  const handleSkip = async () => {
    // Skip entire onboarding and go directly to main app (CRITICAL FIX)
    await OnboardingService.markAsSkipped();
    navigation.replace('MainTabs');
  };

  const greetingText = userName 
    ? `Hello, Mr. ${userName}! I'm delighted to have you here.`
    : "Hello! I'm delighted to have you here.";

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
        <ProgressIndicator currentStep={1} totalSteps={8} />
        
        <View style={styles.content}>
          <Text style={styles.greeting}>
            {greetingText}
          </Text>
          
          <Text style={styles.message}>
            Let's get to know you so I can provide the best recommendations.
          </Text>
          
          {hasSavedMeasurements && (
            <View style={styles.resumeContainer}>
              <Text style={styles.resumeText}>
                📋 You have saved measurements. You can update them or continue where you left off.
              </Text>
            </View>
          )}
          
          <Text style={styles.reassurance}>
            Don't worry - you can skip any step and complete it later from Settings.
          </Text>
        </View>

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
      </View>
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
    padding: TailorSpacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: TailorSpacing.lg,
  },
  greeting: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.lg,
  },
  message: {
    ...TailorTypography.bodyLarge,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.lg,
    lineHeight: 28,
  },
  resumeContainer: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginTop: TailorSpacing.md,
    marginBottom: TailorSpacing.md,
    borderWidth: 1,
    borderColor: TailorColors.gold,
  },
  resumeText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    textAlign: 'center',
  },
  reassurance: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: TailorSpacing.md,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: TailorSpacing.xl,
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

