import React, { useEffect } from 'react';
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
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorContrasts,
} from '../../utils/constants';
import { OnboardingService } from '../../services/onboarding';
import { StorageService } from '../../services/storage';
import { RootStackParamList } from '../../types';

type CompletionScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * CompletionScreen
 * Final screen of onboarding - celebrates completion
 */
export const CompletionScreen: React.FC = () => {
  const navigation = useNavigation<CompletionScreenNavigationProp>();

  useEffect(() => {
    // Mark onboarding as complete
    const markComplete = async () => {
      await OnboardingService.markOnboardingComplete();
      
      // Transfer onboarding data to user profile
      const state = await OnboardingService.getOnboardingState();
      const existingProfile = await StorageService.getUserProfile();
      
      if (state.measurements || state.stylePreferences || state.shoeSize) {
        const profile = existingProfile || {
          id: `user_${Date.now()}`,
          stylePreference: [],
          favoriteOccasions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (state.measurements) {
          profile.measurements = {
            ...state.measurements,
            preferredFit: 'regular',
            updatedAt: new Date().toISOString(),
          } as any;
        }

        if (state.stylePreferences) {
          profile.stylePreference = state.stylePreferences;
        }

        if (state.shoeSize) {
          profile.shoeSize = state.shoeSize;
        }

        profile.updatedAt = new Date().toISOString();
        await StorageService.saveUserProfile(profile);
      }
    };

    markComplete();
  }, []);

  const handleStartUsing = () => {
    // Navigate to tutorial screen first (user can skip)
    navigation.replace('Tutorial');
  };

  const handleGoToSettings = () => {
    navigation.replace('MainTabs', { screen: 'Profile' });
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>Perfect! You're all set.</Text>
          <Text style={styles.message}>
            I now know your measurements, style preferences, and wardrobe.
            I'm ready to help you look your best!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <GoldButton
            title="Start Using GAUGE"
            onPress={handleStartUsing}
            style={styles.primaryButton}
          />

          <TouchableOpacity onPress={handleGoToSettings} style={styles.settingsLink}>
            <Text style={styles.settingsText}>
              You can always adjust these in Settings
            </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  content: {
    alignItems: 'center',
    marginBottom: TailorSpacing.xxxl,
    paddingHorizontal: TailorSpacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: TailorSpacing.lg,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.lg,
  },
  message: {
    ...TailorTypography.bodyLarge,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    marginBottom: TailorSpacing.md,
  },
  settingsLink: {
    paddingVertical: TailorSpacing.sm,
    alignItems: 'center',
  },
  settingsText: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textDecorationLine: 'underline',
  },
});

