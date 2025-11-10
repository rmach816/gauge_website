import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SkeletonList } from '../components/SkeletonList';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { WoodBackground } from '../components/WoodBackground';
import { MatchResult } from '../components/MatchResult';
import { SuggestionCard } from '../components/SuggestionCard';
import { ShoppingCard } from '../components/ShoppingCard';
import { HistoryService } from '../services/history';
import { AffiliateLinkService } from '../services/affiliateLinks';
import { StorageService } from '../services/storage';
import { Icon, AppIcons } from '../components/Icon';
import { ClaudeVisionService } from '../services/claude';
import uuid from 'react-native-uuid';
import {
  RootStackParamList,
  MatchCheckResult,
  CompleteOutfit,
  PriceRange,
  ShoppingItem,
  OutfitItem,
  ClosetItem,
  FavoriteOutfit,
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
type RouteType = RouteProp<RootStackParamList, 'Result'>;

/**
 * ResultScreen
 * Displays style analysis results with shopping recommendations
 * Implements IMPORTANT FIX #5: Total outfit price range calculation and display
 */
export const ResultScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const [checkResult, setCheckResult] = useState<MatchCheckResult | null>(null);
  const [outfitResult, setOutfitResult] = useState<CompleteOutfit | null>(null);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regeneratingItemIndex, setRegeneratingItemIndex] = useState<number | null>(null);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');

  useEffect(() => {
    loadResult();
  }, [route.params.checkId]);

  const loadResult = async () => {
    setIsLoading(true);
    try {
      const check = await HistoryService.getCheckById(route.params.checkId);
      if (!check) {
        return;
      }

      if (check.type === 'instant-check') {
        const result = check.result as MatchCheckResult;
        setCheckResult(result);

        // Generate shopping links for suggestions
        const items = await Promise.all(
          result.suggestions.map(async (suggestion) => {
            const options = AffiliateLinkService.generateShoppingOptions({
              garmentType: suggestion.garmentType,
              description: suggestion.description,
              colors: suggestion.colors,
              priceRange: PriceRange.MID,
            });
            return options;
          })
        );
        setShoppingItems(items.flat());
      } else if (check.type === 'outfit-builder') {
        const result = check.result as CompleteOutfit;
        setOutfitResult(result);

        // Generate shopping links only for items that need to be purchased (no existingItem)
        const itemsToShop = result.items.filter((item) => !item.existingItem);
        const items = await Promise.all(
          itemsToShop
            .filter((item) => item.shoppingOptions && item.shoppingOptions.length > 0)
            .map(async (item) => {
              // Use existing shopping options if available
              if (item.shoppingOptions && item.shoppingOptions.length > 0) {
                return item.shoppingOptions;
              }
              // Otherwise generate new ones from shoppingKeywords
              if (item.shoppingKeywords && item.shoppingKeywords.length > 0) {
                const options = AffiliateLinkService.generateShoppingOptions({
                  garmentType: item.garmentType,
                  description: item.description,
                  colors: item.colors,
                  priceRange: item.priceRange || PriceRange.MID,
                });
                return options;
              }
              return [];
            })
        );
        setShoppingItems(items.flat());
      }
    } catch (error) {
      console.error('[ResultScreen] Load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total outfit price range (IMPORTANT FIX #5)
  // Only includes items that need to be purchased (no existingItem)
  const calculateOutfitPriceRange = useCallback((items: OutfitItem[]): string => {
    // Filter to only items that need to be purchased
    const itemsToPurchase = items.filter((item) => !item.existingItem);
    
    if (itemsToPurchase.length === 0) return 'N/A';

    const ranges = itemsToPurchase
      .map((item) => {
        // Get price range from shopping options or default to MID
        const priceRange =
          item.shoppingOptions?.[0]?.priceRange || item.priceRange || PriceRange.MID;

        switch (priceRange) {
          case PriceRange.BUDGET:
            return { min: 25, max: 50 };
          case PriceRange.MID:
            return { min: 50, max: 100 };
          case PriceRange.PREMIUM:
            return { min: 100, max: 200 };
          default:
            return { min: 50, max: 100 };
        }
      })
      .filter((r) => r !== null);

    if (ranges.length === 0) return 'N/A';

    const totalMin = ranges.reduce((sum, r) => sum + r.min, 0);
    const totalMax = ranges.reduce((sum, r) => sum + r.max, 0);

    return `$${totalMin}-$${totalMax}`;
  }, []);

  const handleSaveFavorite = useCallback(() => {
    if (!outfitResult) return;
    setFavoriteName('');
    setSaveModalVisible(true);
  }, [outfitResult]);

  const handleConfirmSaveFavorite = useCallback(async () => {
    if (!outfitResult) return;

    try {
      setIsSavingFavorite(true);
      const favorite: FavoriteOutfit = {
        id: uuid.v4() as string,
        name: favoriteName.trim() || undefined,
        outfit: outfitResult,
        savedAt: new Date().toISOString(),
      };
      await StorageService.saveFavoriteOutfit(favorite);
      setSaveModalVisible(false);
      setFavoriteName('');
      Alert.alert('Success', 'Outfit saved to favorites!');
    } catch (error) {
      console.error('[ResultScreen] Failed to save favorite:', error);
      Alert.alert('Error', 'Failed to save favorite. Please try again.');
    } finally {
      setIsSavingFavorite(false);
    }
  }, [outfitResult, favoriteName]);

  const handleCancelSaveFavorite = useCallback(() => {
    setSaveModalVisible(false);
    setFavoriteName('');
  }, []);

  const handleRegenerateItem = useCallback(async (itemIndex: number) => {
    if (!outfitResult) return;

    try {
      setRegeneratingItemIndex(itemIndex);
      navigation.navigate('RegenerateItem', {
        outfit: outfitResult,
        itemIndex,
        checkId: route.params.checkId,
      });
    } catch (error) {
      console.error('[ResultScreen] Failed to regenerate item:', error);
      Alert.alert('Error', 'Failed to regenerate item. Please try again.');
    } finally {
      setRegeneratingItemIndex(null);
    }
  }, [outfitResult, navigation, route.params.checkId]);

  if (isLoading) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
          </View>
          <SkeletonList count={3} variant="list" cardHeight={150} />
        </SafeAreaView>
      </WoodBackground>
    );
  }

  if (!checkResult && !outfitResult) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.center}>
            <Text style={styles.errorText}>Result not found</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </WoodBackground>
    );
  }

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {checkResult ? 'Style Analysis' : 'Outfit Results'}
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Instant Check Result */}
          {checkResult && (
            <>
              <MatchResult
                rating={checkResult.rating}
                analysis={checkResult.analysis}
              />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suggestions</Text>
                {checkResult.suggestions.map((suggestion, index) => (
                  <SuggestionCard
                    key={suggestion.id || index}
                    suggestion={suggestion}
                  />
                ))}
              </View>
            </>
          )}

          {/* Outfit Builder Result */}
          {outfitResult && (
            <>
              <View style={styles.section}>
                <View style={styles.outfitHeader}>
                  <View style={styles.outfitHeaderText}>
                    <Text style={styles.sectionTitle}>Complete Outfit</Text>
                    <Text style={styles.outfitDescription}>
                      {outfitResult.items.length} items for {outfitResult.occasion}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.favoriteButton, isSavingFavorite && styles.favoriteButtonDisabled]}
                    onPress={handleSaveFavorite}
                    disabled={isSavingFavorite}
                  >
                    {isSavingFavorite ? (
                      <ActivityIndicator size="small" color={TailorContrasts.onGold} />
                    ) : (
                      <>
                        <Icon name={AppIcons.star.name} size={16} color={TailorContrasts.onGold} library={AppIcons.star.library} style={{ marginRight: 4 }} />
                        <Text style={styles.favoriteButtonText}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Total Outfit Price Range - Only show if there are missing items */}
                {outfitResult.items.some(item => !item.existingItem) && (
                  <View style={styles.priceSection}>
                    <Text style={styles.priceLabel}>
                      Complete Outfit Price Range
                    </Text>
                    <Text style={styles.priceRange}>
                      {calculateOutfitPriceRange(outfitResult.items)}
                    </Text>
                    <Text style={styles.priceDisclaimer}>
                      Estimated based on typical prices. Actual prices may vary by
                      retailer.
                    </Text>
                  </View>
                )}

                {outfitResult.items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.outfitItemCard}
                    onPress={() => {
                      // Only navigate if item needs to be purchased
                      if (!item.existingItem && (item.shoppingKeywords || item.shoppingOptions)) {
                        navigation.navigate('ItemShopping', { outfitItem: item });
                      }
                    }}
                    disabled={!!item.existingItem}
                    activeOpacity={item.existingItem ? 1 : 0.7}
                  >
                    {/* Show wardrobe item image if available */}
                    {item.existingItem && (
                      <View style={styles.wardrobeItemContainer}>
                        <Image
                          source={{ uri: item.existingItem.imageUri }}
                          style={styles.wardrobeItemImage}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={200}
                        />
                        <View style={styles.wardrobeItemBadge}>
                          <Text style={styles.wardrobeItemBadgeText}>From Your Wardrobe</Text>
                        </View>
                      </View>
                    )}
                    <Text style={styles.outfitItemType}>{item.garmentType}</Text>
                    <Text style={styles.outfitItemDescription}>
                      {item.description}
                    </Text>
                    {item.existingItem && (
                      <Text style={styles.wardrobeItemDetails}>
                        {item.existingItem.color}
                        {item.existingItem.brand && ` • ${item.existingItem.brand}`}
                        {item.existingItem.material && ` • ${item.existingItem.material}`}
                      </Text>
                    )}
                    {!item.existingItem && item.shoppingKeywords && (
                      <View style={styles.shoppingHintContainer}>
                        <Text style={styles.shoppingHint}>
                          💡 Tap to shop for this item
                        </Text>
                        <Text style={styles.shoppingArrow}>→</Text>
                      </View>
                    )}
                    {/* Get Another Recommendation Button */}
                    <TouchableOpacity
                      style={styles.regenerateButton}
                      onPress={() => handleRegenerateItem(index)}
                      disabled={regeneratingItemIndex === index}
                    >
                      {regeneratingItemIndex === index ? (
                        <ActivityIndicator size="small" color={TailorColors.gold} />
                      ) : (
                        <Text style={styles.regenerateButtonText}>
                          🔄 Get Another {item.garmentType}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Shopping Recommendations */}
          {shoppingItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shop Recommendations</Text>
              {shoppingItems.slice(0, 6).map((item, index) => (
                <ShoppingCard key={item.id || index} item={item} />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Save Favorite Modal */}
        <Modal
          visible={saveModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelSaveFavorite}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Save as Favorite</Text>
              <Text style={styles.modalSubtitle}>Give this outfit a name (optional):</Text>
              <TextInput
                style={styles.modalInput}
                value={favoriteName}
                onChangeText={setFavoriteName}
                placeholder="Enter name..."
                placeholderTextColor={TailorColors.ivory}
                autoFocus={true}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={handleCancelSaveFavorite}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleConfirmSaveFavorite}
                  disabled={isSavingFavorite}
                >
                  {isSavingFavorite ? (
                    <ActivityIndicator size="small" color={TailorContrasts.onGold} />
                  ) : (
                    <Text style={styles.modalButtonTextSave}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  backButton: {
    backgroundColor: TailorColors.gold,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.md,
  },
  backButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
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
  outfitDescription: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.md,
  },
  priceSection: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.md,
    borderLeftWidth: 4,
    borderLeftColor: TailorColors.gold,
  },
  priceLabel: {
    ...TailorTypography.label,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  priceRange: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodMedium, // Use cream instead of gold for contrast
    fontWeight: '700',
    marginBottom: TailorSpacing.xs,
  },
  priceDisclaimer: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 11,
    fontStyle: 'italic',
  },
  outfitItemCard: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.sm,
  },
  outfitItemType: {
    ...TailorTypography.label,
    color: TailorContrasts.onWoodMedium, // Use cream instead of gold for contrast
    marginBottom: TailorSpacing.xs,
  },
  outfitItemDescription: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
  },
  wardrobeItemContainer: {
    position: 'relative',
    marginBottom: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.md,
    overflow: 'hidden',
  },
  wardrobeItemImage: {
    width: '100%',
    height: 200,
    borderRadius: TailorBorderRadius.md,
  },
  wardrobeItemBadge: {
    position: 'absolute',
    top: TailorSpacing.xs,
    right: TailorSpacing.xs,
    backgroundColor: TailorColors.gold,
    paddingHorizontal: TailorSpacing.sm,
    paddingVertical: TailorSpacing.xs / 2,
    borderRadius: TailorBorderRadius.sm,
    ...TailorShadows.small,
  },
  wardrobeItemBadgeText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onGold,
    fontWeight: '700',
    fontSize: 11,
  },
  wardrobeItemDetails: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginTop: TailorSpacing.xs,
    fontStyle: 'italic',
  },
  shoppingHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: TailorSpacing.sm,
    paddingTop: TailorSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: TailorColors.woodLight,
  },
  shoppingHint: {
    ...TailorTypography.caption,
    color: TailorColors.gold,
    fontWeight: '600',
    flex: 1,
  },
  shoppingArrow: {
    ...TailorTypography.h2,
    color: TailorColors.gold,
    fontSize: 20,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: TailorSpacing.md,
  },
  outfitHeaderText: {
    flex: 1,
    marginRight: TailorSpacing.md,
  },
  favoriteButton: {
    backgroundColor: TailorColors.gold,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.md,
    ...TailorShadows.small,
  },
  favoriteButtonDisabled: {
    opacity: 0.6,
  },
  favoriteButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
  },
  regenerateButton: {
    marginTop: TailorSpacing.sm,
    paddingVertical: TailorSpacing.xs,
    paddingHorizontal: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.sm,
    borderWidth: 1,
    borderColor: TailorColors.gold,
    alignItems: 'center',
  },
  regenerateButtonText: {
    ...TailorTypography.caption,
    color: TailorColors.gold,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  modalContent: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.lg,
    padding: TailorSpacing.xl,
    width: '100%',
    maxWidth: 400,
    ...TailorShadows.large,
  },
  modalTitle: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  modalSubtitle: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.md,
  },
  modalInput: {
    backgroundColor: TailorColors.woodLight,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    ...TailorTypography.body,
    color: TailorContrasts.onWoodLight,
    marginBottom: TailorSpacing.md,
    borderWidth: 1,
    borderColor: TailorColors.gold,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: TailorSpacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: TailorColors.woodLight,
    borderWidth: 1,
    borderColor: TailorColors.ivory,
  },
  modalButtonSave: {
    backgroundColor: TailorColors.gold,
  },
  modalButtonTextCancel: {
    ...TailorTypography.button,
    color: TailorContrasts.onWoodLight,
  },
  modalButtonTextSave: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
  },
});
