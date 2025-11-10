import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
} from '../utils/constants';
import { OnboardingService } from '../services/onboarding';
import { Icon, AppIcons } from './Icon';
import { RootStackParamList } from '../types';

type SetupReminderBannerNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * SetupReminderBanner Component
 * Shows for users who skipped onboarding (CRITICAL FIX #2)
 * Displays reminder to complete setup for personalized recommendations
 */
export const SetupReminderBanner: React.FC = () => {
  const navigation = useNavigation<SetupReminderBannerNavigationProp>();
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    checkShouldShow();
  }, []);

  const checkShouldShow = async () => {
    if (isDismissed) return;
    
    const shouldShow = await OnboardingService.shouldShowSetupReminder();
    setShowBanner(shouldShow);
  };

  const handleSetupNow = () => {
    // Navigate to Settings/Profile screen where user can complete setup
    // For now, navigate to Profile tab
    navigation.navigate('MainTabs', { screen: 'Profile' });
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
  };

  if (!showBanner || isDismissed) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Icon name={AppIcons.camera.name} size={20} color={TailorColors.gold} library={AppIcons.camera.library} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.bannerText}>
            Complete setup for personalized recommendations
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleSetupNow}
          style={styles.setupButton}
        >
          <Text style={styles.setupButtonText}>Setup Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.dismissButton}
        >
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    marginHorizontal: TailorSpacing.md,
    marginTop: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: TailorColors.gold,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TailorSpacing.sm,
  },
  icon: {
    fontSize: 24,
    marginRight: TailorSpacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  bannerText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: TailorSpacing.xs,
  },
  setupButton: {
    paddingVertical: TailorSpacing.xs,
    paddingHorizontal: TailorSpacing.md,
    backgroundColor: TailorColors.gold,
    borderRadius: TailorBorderRadius.sm,
    marginRight: TailorSpacing.sm,
  },
  setupButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
    fontSize: 14,
  },
  dismissButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodMedium,
    fontSize: 24,
    lineHeight: 28,
  },
});

