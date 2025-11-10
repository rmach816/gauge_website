import React, { useState } from 'react';
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

type TutorialScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: '💬',
    title: 'Chat with Your Tailor',
    description: 'Premium users can have unlimited conversations with their AI tailor. Ask questions, get advice, and build outfits naturally - just like texting your personal tailor.',
  },
  {
    icon: '📸',
    title: 'Quick Style Check',
    description: 'Take photos of your outfit and get instant feedback on fit, style, and occasion appropriateness. Free users get 10 checks per month.',
  },
  {
    icon: '🎯',
    title: 'Build an Outfit',
    description: 'Tell us the occasion, and we\'ll help you build a complete outfit. Choose from your wardrobe, shop for new items, or mix both.',
  },
  {
    icon: '👕',
    title: 'Manage Your Wardrobe',
    description: 'Add items to your digital closet. Our AI automatically categorizes them so you can easily find what you need when building outfits.',
  },
  {
    icon: '📋',
    title: 'View Your History',
    description: 'See all your past style checks, chat sessions, and outfit recommendations. Premium users can resume conversations and ask follow-up questions.',
  },
  {
    icon: '🛍️',
    title: 'Shop with Confidence',
    description: 'Get personalized shopping recommendations with affiliate links. We filter by your size, style preferences, and budget.',
  },
];

/**
 * TutorialScreen
 * Brief overview of how the app works - shown after onboarding completion
 */
export const TutorialScreen: React.FC = () => {
  const navigation = useNavigation<TutorialScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.replace('MainTabs');
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to GAUGE</Text>
          <Text style={styles.subtitle}>
            Here's a quick overview of how your personal tailor works
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          {TUTORIAL_STEPS.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Pro Tip:</Text> You can always access detailed instructions from Settings → Instructions.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <GoldButton
            title="Start Using GAUGE"
            onPress={handleGetStarted}
            style={styles.primaryButton}
          />

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip Tutorial</Text>
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
  header: {
    marginBottom: TailorSpacing.xl,
    alignItems: 'center',
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
  },
  stepsContainer: {
    marginBottom: TailorSpacing.xl,
  },
  stepCard: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginBottom: TailorSpacing.md,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
    ...TailorShadows.small,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TailorSpacing.sm,
  },
  stepIcon: {
    fontSize: 32,
    marginRight: TailorSpacing.md,
  },
  stepTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    flex: 1,
  },
  stepDescription: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    lineHeight: 22,
  },
  tipContainer: {
    backgroundColor: TailorColors.woodDark,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginBottom: TailorSpacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: TailorColors.gold,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: TailorSpacing.sm,
  },
  tipText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    flex: 1,
    lineHeight: 22,
  },
  tipBold: {
    fontWeight: '700',
    color: TailorColors.gold,
  },
  buttonContainer: {
    width: '100%',
    marginTop: TailorSpacing.lg,
  },
  primaryButton: {
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

