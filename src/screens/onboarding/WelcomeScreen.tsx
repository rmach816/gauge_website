import React from 'react';
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
import { RootStackParamList } from '../../types';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * WelcomeScreen
 * First screen of onboarding - sets the premium tone
 * Implements CRITICAL FIX #2: "Skip Setup" button
 */
export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleGetStarted = () => {
    // Navigate to name input screen (first step of profile setup)
    navigation.navigate('NameInput');
  };

  const handleSkipAll = async () => {
    // Mark onboarding as skipped (CRITICAL FIX #2)
    await OnboardingService.markAsSkipped();
    
    // Go directly to main app
    navigation.replace('MainTabs');
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>👔</Text>
          <Text style={styles.logoText}>GAUGE</Text>
        </View>

        {/* Welcome Message */}
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to GAUGE</Text>
          <Text style={styles.subtitle}>
            Your personal tailor, always at your service
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Primary CTA */}
          <GoldButton
            title="Setup Your Profile"
            onPress={handleGetStarted}
            style={styles.primaryButton}
          />

          {/* Skip Option */}
          <View style={styles.skipContainer}>
            <TouchableOpacity onPress={handleSkipAll} style={styles.skipButton}>
              <Text style={styles.skipText}>
                Skip Setup - Try Basic Features
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.helperText}>
              You can complete setup anytime from Settings
            </Text>
          </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: TailorSpacing.xxxl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: TailorSpacing.md,
  },
  logoText: {
    ...TailorTypography.display,
    color: TailorContrasts.onWoodDark,
    letterSpacing: 4,
  },
  content: {
    alignItems: 'center',
    marginBottom: TailorSpacing.xxxl,
    paddingHorizontal: TailorSpacing.xl,
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
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    marginBottom: TailorSpacing.lg,
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: TailorSpacing.md,
  },
  skipButton: {
    paddingVertical: TailorSpacing.sm,
    paddingHorizontal: TailorSpacing.md,
  },
  skipText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    textDecorationLine: 'underline',
  },
  helperText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    textAlign: 'center',
    marginTop: TailorSpacing.sm,
    paddingHorizontal: TailorSpacing.lg,
  },
});

