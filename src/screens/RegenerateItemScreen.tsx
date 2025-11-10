import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { WoodBackground } from '../components/WoodBackground';
import { StorageService } from '../services/storage';
import { ClaudeVisionService } from '../services/claude';
import { HistoryService } from '../services/history';
import { AffiliateLinkService } from '../services/affiliateLinks';
import { validateApiKey } from '../config/api';
import {
  RootStackParamList,
  CompleteOutfit,
  OutfitItem,
  PriceRange,
} from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'RegenerateItem'>;

/**
 * RegenerateItemScreen
 * Allows user to get a different recommendation for a specific outfit item
 */
export const RegenerateItemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { outfit, itemIndex, checkId } = route.params;

  const [isGenerating, setIsGenerating] = useState(false);
  const [newItem, setNewItem] = useState<OutfitItem | null>(null);

  useEffect(() => {
    generateNewItem();
  }, []);

  const generateNewItem = async () => {
    if (!validateApiKey()) {
      Alert.alert('Configuration Error', 'API key not configured.');
      navigation.goBack();
      return;
    }

    try {
      setIsGenerating(true);
      const itemToReplace = outfit.items[itemIndex];
      if (!itemToReplace) {
        Alert.alert('Error', 'Item not found.');
        navigation.goBack();
        return;
      }

      // Get user profile and wardrobe
      const profile = await StorageService.getUserProfile();
      const wardrobe = await StorageService.getClosetItems();

      // Build context for regeneration
      // We'll use the existing outfit but request a different option for this specific garment type
      const request = {
        requestType: 'item-regeneration' as const,
        imageBase64: [], // No images needed
        userMeasurements: profile?.measurements,
        stylePreference: outfit.stylePreference,
        occasion: outfit.occasion,
        wardrobeItems: wardrobe,
        garmentTypeToRegenerate: itemToReplace.garmentType,
        currentOutfitContext: outfit.items.map((it, idx) => ({
          garmentType: it.garmentType,
          description: it.description,
          existingItem: it.existingItem?.id,
        })),
        priceRange: itemToReplace.priceRange || PriceRange.MID,
        shoeSize: profile?.shoeSize,
      };

      // Call Claude to regenerate the item
      const response = await ClaudeVisionService.analyzeStyle(request);

      if (response.completeOutfit && response.completeOutfit.length > 0) {
        // The response should contain a new item for the garment type
        const regeneratedItem = response.completeOutfit[0];
        
        // Generate shopping options if needed
        if (regeneratedItem.shoppingKeywords && regeneratedItem.shoppingKeywords.length > 0) {
          const shoppingOptions = AffiliateLinkService.generateShoppingOptions({
            garmentType: regeneratedItem.garmentType,
            description: regeneratedItem.description,
            colors: regeneratedItem.colors,
            priceRange: regeneratedItem.priceRange || PriceRange.MID,
          });
          regeneratedItem.shoppingOptions = shoppingOptions;
        }

        setNewItem(regeneratedItem);
      } else {
        Alert.alert('Error', 'Failed to generate new recommendation. Please try again.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('[RegenerateItemScreen] Generation failed:', error);
      Alert.alert('Error', 'Failed to generate new recommendation. Please try again.');
      navigation.goBack();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUse = () => {
    if (!newItem) return;

    // Update the outfit with the new item
    const updatedOutfit: CompleteOutfit = {
      ...outfit,
      items: outfit.items.map((item, index) =>
        index === itemIndex ? newItem : item
      ),
    };

    // Update the history entry
    HistoryService.updateCheck(checkId, {
      result: updatedOutfit,
    }).then(() => {
      // Navigate back to ResultScreen with updated outfit
      navigation.navigate('Result', { checkId });
    }).catch((error) => {
      console.error('[RegenerateItemScreen] Failed to update history:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    });
  };

  const handleTryAgain = () => {
    setNewItem(null);
    generateNewItem();
  };

  if (isGenerating) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color={TailorColors.gold} />
            <Text style={styles.loadingText}>
              Generating new {outfit.items[itemIndex]?.garmentType} recommendation...
            </Text>
          </View>
        </SafeAreaView>
      </WoodBackground>
    );
  }

  if (!newItem) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.center}>
            <Text style={styles.errorText}>No recommendation generated</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleTryAgain}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </WoodBackground>
    );
  }

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>New {newItem.garmentType} Recommendation</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previous</Text>
            <View style={styles.itemCard}>
              <Text style={styles.itemType}>{outfit.items[itemIndex]?.garmentType}</Text>
              <Text style={styles.itemDescription}>
                {outfit.items[itemIndex]?.description}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Recommendation</Text>
            <View style={[styles.itemCard, styles.newItemCard]}>
              <Text style={styles.itemType}>{newItem.garmentType}</Text>
              <Text style={styles.itemDescription}>
                {newItem.description}
              </Text>
              {newItem.colors && newItem.colors.length > 0 && (
                <Text style={styles.itemColors}>
                  Colors: {newItem.colors.join(', ')}
                </Text>
              )}
              {newItem.existingItem && (
                <View style={styles.wardrobeBadge}>
                  <Text style={styles.wardrobeBadgeText}>From Your Wardrobe</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleTryAgain}
            >
              <Text style={styles.secondaryButtonText}>Try Another</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleUse}
            >
              <Text style={styles.buttonText}>Use This One</Text>
            </TouchableOpacity>
          </View>
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    marginTop: TailorSpacing.md,
  },
  errorText: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.md,
  },
  header: {
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
  closeButton: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    fontSize: 28,
  },
  section: {
    marginBottom: TailorSpacing.xl,
  },
  sectionTitle: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.md,
  },
  itemCard: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
  },
  newItemCard: {
    borderWidth: 2,
    borderColor: TailorColors.gold,
    ...TailorShadows.medium,
  },
  itemType: {
    ...TailorTypography.label,
    color: TailorColors.gold,
    marginBottom: TailorSpacing.xs,
  },
  itemDescription: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
  },
  itemColors: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginTop: TailorSpacing.xs,
    fontStyle: 'italic',
  },
  wardrobeBadge: {
    backgroundColor: TailorColors.gold,
    paddingHorizontal: TailorSpacing.sm,
    paddingVertical: TailorSpacing.xs / 2,
    borderRadius: TailorBorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: TailorSpacing.xs,
  },
  wardrobeBadgeText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onGold,
    fontWeight: '700',
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: TailorSpacing.xl,
    gap: TailorSpacing.md,
  },
  button: {
    flex: 1,
    backgroundColor: TailorColors.gold,
    paddingVertical: TailorSpacing.md,
    paddingHorizontal: TailorSpacing.lg,
    borderRadius: TailorBorderRadius.md,
    alignItems: 'center',
    ...TailorShadows.small,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: TailorColors.gold,
  },
  buttonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
  },
  secondaryButtonText: {
    ...TailorTypography.button,
    color: TailorColors.gold,
  },
});

