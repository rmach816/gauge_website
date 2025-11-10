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
import { Image } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { WoodBackground } from '../components/WoodBackground';
import { StorageService } from '../services/storage';
import { AffiliateLinkService } from '../services/affiliateLinks';
import {
  RootStackParamList,
  FavoriteOutfit,
  PriceRange,
  ShoppingItem,
} from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import { ShoppingCard } from '../components/ShoppingCard';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'ViewFavorite'>;

/**
 * ViewFavoriteScreen
 * Displays a saved favorite outfit in detail
 */
export const ViewFavoriteScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { favoriteId } = route.params;

  const [favorite, setFavorite] = useState<FavoriteOutfit | null>(null);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorite();
  }, [favoriteId]);

  const loadFavorite = async () => {
    try {
      setIsLoading(true);
      const favorites = await StorageService.getFavoriteOutfits();
      const found = favorites.find((f) => f.id === favoriteId);
      
      if (!found) {
        Alert.alert('Error', 'Favorite not found.');
        navigation.goBack();
        return;
      }

      setFavorite(found);

      // Generate shopping links for items that need to be purchased
      const itemsToShop = found.outfit.items.filter((item) => !item.existingItem);
      const items = await Promise.all(
        itemsToShop
          .filter((item) => item.shoppingKeywords && item.shoppingKeywords.length > 0)
          .map(async (item) => {
            if (item.shoppingOptions && item.shoppingOptions.length > 0) {
              return item.shoppingOptions;
            }
            const options = AffiliateLinkService.generateShoppingOptions({
              garmentType: item.garmentType,
              description: item.description,
              colors: item.colors,
              priceRange: item.priceRange || PriceRange.MID,
            });
            return options;
          })
      );
      setShoppingItems(items.flat());
    } catch (error) {
      console.error('[ViewFavoriteScreen] Load failed:', error);
      Alert.alert('Error', 'Failed to load favorite. Please try again.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !favorite) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color={TailorColors.gold} />
            <Text style={styles.loadingText}>Loading favorite...</Text>
          </View>
        </SafeAreaView>
      </WoodBackground>
    );
  }

  const outfit = favorite.outfit;
  const hasMissingItems = outfit.items.some((item) => !item.existingItem);

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {favorite.name || `Outfit for ${outfit.occasion}`}
              </Text>
              <Text style={styles.subtitle}>Saved favorite</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Complete Outfit</Text>
            <Text style={styles.outfitDescription}>
              {outfit.items.length} items for {outfit.occasion}
            </Text>

            {/* Price range only if there are missing items */}
            {hasMissingItems && (
              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>Estimated Price Range</Text>
                <Text style={styles.priceRange}>
                  {outfit.items
                    .filter((item) => !item.existingItem)
                    .reduce((sum, item) => {
                      const range = item.priceRange || PriceRange.MID;
                      const min = range === PriceRange.BUDGET ? 25 : range === PriceRange.MID ? 50 : 100;
                      return sum + min;
                    }, 0)} - $
                  {outfit.items
                    .filter((item) => !item.existingItem)
                    .reduce((sum, item) => {
                      const range = item.priceRange || PriceRange.MID;
                      const max = range === PriceRange.BUDGET ? 50 : range === PriceRange.MID ? 100 : 200;
                      return sum + max;
                    }, 0)}
                </Text>
              </View>
            )}

            {outfit.items.map((item, index) => (
              <View key={index} style={styles.outfitItemCard}>
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
              </View>
            ))}
          </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: TailorSpacing.xl,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
  },
  subtitle: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
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
    color: TailorColors.gold,
    fontWeight: '700',
  },
  outfitItemCard: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.sm,
  },
  outfitItemType: {
    ...TailorTypography.label,
    color: TailorColors.gold,
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
});

