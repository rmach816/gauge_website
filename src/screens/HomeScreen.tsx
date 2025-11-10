import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WoodBackground } from '../components/WoodBackground';
import { GoldButton } from '../components/GoldButton';
import { SetupReminderBanner } from '../components/SetupReminderBanner';
import { Icon, AppIcons } from '../components/Icon';
import { PremiumService } from '../services/premium';
import { StorageService } from '../services/storage';
import { RootStackParamList } from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * HomeScreen
 * Main entry point with three primary actions:
 * 1. Chat with Your Tailor (Premium) - Large gold button
 * 2. Quick Style Check (Free/Premium) - Standard button
 * 3. Build an Outfit (Free/Premium) - Standard button
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [premiumStatus, setPremiumStatus] = useState<{ 
    isPremium: boolean; 
    checksRemaining: number 
  }>({ 
    isPremium: false, 
    checksRemaining: 10 
  });
  const [userLastName, setUserLastName] = useState<string>('');

  useEffect(() => {
    loadPremiumStatus();
    loadUserName();
  }, []);

  const loadPremiumStatus = async () => {
    const status = await PremiumService.getStatus();
    setPremiumStatus({
      isPremium: status.isPremium,
      checksRemaining: status.checksRemaining ?? 10,
    });
  };

  const loadUserName = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      if (profile?.lastName) {
        setUserLastName(profile.lastName);
      }
    } catch (error) {
      console.error('[HomeScreen] Failed to load user name:', error);
    }
  };

  const handleChatPress = () => {
    // Always navigate to Chat - ChatScreen handles free message logic (CRITICAL FIX #3)
    navigation.navigate('Chat');
  };

  const handleQuickCheckPress = () => {
    navigation.navigate('QuickStyleCheck');
  };

  const handleBuildOutfitPress = () => {
    navigation.navigate('BuildOutfit');
  };

  const handleFavoritesPress = () => {
    navigation.navigate('Favorites');
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {userLastName 
                ? `How can I help you today, Mr. ${userLastName}?`
                : 'How can I help you today?'}
            </Text>
          </View>

          {/* Primary CTA: Chat with Your Tailor */}
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleChatPress}
            activeOpacity={0.8}
          >
            <View style={styles.chatButtonContent}>
              <ExpoImage
                source={require('../../assets/ai_tailor.png')}
                style={styles.chatButtonIcon}
                contentFit="contain"
                transition={200}
              />
              <View style={styles.chatButtonTextContainer}>
                <Text style={styles.chatButtonTitle}>
                  Chat with Your Tailor
                </Text>
                <Text style={styles.chatButtonSubtitle}>
                  Premium • Your personal style expert
                </Text>
              </View>
              {!premiumStatus.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryActions}>
            {/* Quick Style Check */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleQuickCheckPress}
              activeOpacity={0.8}
            >
              <Icon name={AppIcons.camera.name} size={24} color={TailorContrasts.onWoodMedium} library={AppIcons.camera.library} style={styles.actionButtonIcon} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Quick Style Check</Text>
                <Text style={styles.actionButtonSubtitle}>
                  {premiumStatus.isPremium
                    ? 'Unlimited'
                    : `Free: ${premiumStatus.checksRemaining} remaining`}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Build an Outfit */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBuildOutfitPress}
              activeOpacity={0.8}
            >
              <Icon name={AppIcons.target.name} size={24} color={TailorContrasts.onWoodMedium} library={AppIcons.target.library} style={styles.actionButtonIcon} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Build an Outfit</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Choose occasion, we'll help
                </Text>
              </View>
            </TouchableOpacity>

            {/* Favorite Outfits */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFavoritesPress}
              activeOpacity={0.8}
            >
              <Icon name={AppIcons.favorite.name} size={24} color={TailorContrasts.onWoodMedium} library={AppIcons.favorite.library} style={styles.actionButtonIcon} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Favorite Outfits</Text>
                <Text style={styles.actionButtonSubtitle}>
                  View your saved outfits
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Setup Reminder Banner (if user skipped onboarding) */}
          <SetupReminderBanner />
        </ScrollView>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: TailorSpacing.xl,
    paddingTop: TailorSpacing.lg,
  },
  header: {
    marginBottom: TailorSpacing.xl,
    alignItems: 'center',
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
  },
  chatButton: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.lg,
    padding: TailorSpacing.xl,
    marginBottom: TailorSpacing.lg,
    borderWidth: 3,
    borderColor: TailorColors.gold,
    ...TailorShadows.large,
  },
  chatButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButtonIcon: {
    width: 64,
    height: 64,
    marginRight: TailorSpacing.md,
  },
  chatButtonTextContainer: {
    flex: 1,
  },
  chatButtonTitle: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  chatButtonSubtitle: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
  },
  premiumBadge: {
    backgroundColor: TailorColors.gold,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.xs,
    borderRadius: TailorBorderRadius.round,
  },
  premiumBadgeText: {
    ...TailorTypography.label,
    color: TailorContrasts.onGold,
  },
  secondaryActions: {
    gap: TailorSpacing.md,
  },
  actionButton: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...TailorShadows.medium,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginRight: TailorSpacing.md,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  actionButtonSubtitle: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
  },
});
