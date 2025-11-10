import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { WoodBackground } from '../components/WoodBackground';
import { GoldButton } from '../components/GoldButton';
import { AffiliateLinkService } from '../services/affiliateLinks';
import { StorageService } from '../services/storage';
import { Icon, AppIcons } from '../components/Icon';
import {
  RootStackParamList,
  OutfitItem,
  ShoppingItem,
  PriceRange,
  UserMeasurements,
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
type RouteType = RouteProp<RootStackParamList, 'ItemShopping'>;

/**
 * ItemShoppingScreen
 * Displays 3 shopping options for a specific missing outfit item
 * Shows images, descriptions, prices, and size recommendations
 */
export const ItemShoppingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { outfitItem } = route.params;
  
  const [shoppingOptions, setShoppingOptions] = useState<ShoppingItem[]>([]);
  const [allRetailers, setAllRetailers] = useState<ShoppingItem[]>([]); // Store all retailers
  const [currentRetailerIndex, setCurrentRetailerIndex] = useState(0); // Track rotation
  const [recommendedSize, setRecommendedSize] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadShoppingOptions();
  }, []);

  const loadShoppingOptions = async () => {
    setIsLoading(true);
    try {
      const profile = await StorageService.getUserProfile();
      const measurements = profile?.measurements;

      let calculatedSize = '';
      // Calculate recommended size based on measurements
      if (measurements) {
        const size = calculateRecommendedSize(outfitItem.garmentType, measurements);
        setRecommendedSize(size);
        calculatedSize = size;
      }

      console.log('[ItemShoppingScreen] Generating shopping options for:', {
        garmentType: outfitItem.garmentType,
        description: outfitItem.description,
        colors: outfitItem.colors,
        priceRange: outfitItem.priceRange,
        calculatedSize,
        hasExistingOptions: !!outfitItem.shoppingOptions,
        existingOptionsLength: outfitItem.shoppingOptions?.length || 0,
      });

      // Generate shopping options (limit to 3)
      // Check if shoppingOptions exists AND has items (empty array should regenerate)
      const options = (outfitItem.shoppingOptions && outfitItem.shoppingOptions.length > 0)
        ? outfitItem.shoppingOptions
        : AffiliateLinkService.generateShoppingOptions({
            garmentType: outfitItem.garmentType,
            description: outfitItem.description,
            colors: outfitItem.colors,
            priceRange: outfitItem.priceRange || PriceRange.MID,
            size: calculatedSize, // Pass calculated size
            specificStyle: outfitItem.description, // Use description as style hint
          });

      console.log('[ItemShoppingScreen] Generated options:', options.length, 'options');

      // Store ALL retailer options
      setAllRetailers(options);
      // Show first 3 retailers initially
      setShoppingOptions(options.slice(0, 3));
      setCurrentRetailerIndex(0);
    } catch (error) {
      console.error('[ItemShoppingScreen] Failed to load options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowMoreRetailers = () => {
    // Rotate to next 3 retailers
    const nextIndex = currentRetailerIndex + 3;
    const rotatedIndex = nextIndex >= allRetailers.length ? 0 : nextIndex;
    
    setCurrentRetailerIndex(rotatedIndex);
    setShoppingOptions(allRetailers.slice(rotatedIndex, rotatedIndex + 3));
    
    console.log('[ItemShoppingScreen] Rotated to retailers', rotatedIndex, 'to', rotatedIndex + 2);
  };

  const handleCopySearchTerm = async (searchTerm: string) => {
    try {
      const result = await Share.share({
        message: searchTerm,
        title: 'Search Term',
      });
      
      if (result.action === Share.sharedAction) {
        // User shared successfully
        console.log('[ItemShoppingScreen] Search term shared');
      }
    } catch (error: any) {
      console.error('[ItemShoppingScreen] Failed to share:', error);
      // Fallback: Show alert with the text so user can manually copy
      Alert.alert(
        'Copy Search Term',
        `If the link doesn't work, copy this:\n\n"${searchTerm}"\n\nTap and hold to select, then copy.`,
        [{ text: 'OK' }]
      );
    }
  };

  const calculateRecommendedSize = (
    garmentType: string,
    measurements: UserMeasurements
  ): string => {
    // Calculate size based on garment type and measurements
    switch (garmentType.toLowerCase()) {
      case 'shirt':
      case 't-shirt':
      case 'polo':
      case 'sweater':
        // Check item description to determine if it's a dress shirt or casual shirt
        const isDressShirt = outfitItem.description?.toLowerCase().includes('dress') ||
                            outfitItem.description?.toLowerCase().includes('oxford') ||
                            outfitItem.description?.toLowerCase().includes('formal') ||
                            outfitItem.description?.toLowerCase().includes('button');
        
        if (isDressShirt) {
          // Dress shirts: Use neck/sleeve sizing (e.g., "15.5/34")
          if (measurements.neck && measurements.sleeve) {
            return `${measurements.neck}/${measurements.sleeve} (dress shirt)`;
          }
        }
        
        // Casual shirts, t-shirts, polos: Use S/M/L sizing based on chest AND height
        if (measurements.chest) {
          // Base size on chest measurement
          let baseSize: string;
          if (measurements.chest <= 38) baseSize = 'S';       // Small: 34-38"
          else if (measurements.chest <= 42) baseSize = 'M';  // Medium: 38-42"
          else if (measurements.chest <= 46) baseSize = 'L';  // Large: 42-46"
          else if (measurements.chest <= 50) baseSize = 'XL'; // XL: 46-50"
          else baseSize = 'XXL';                               // XXL: 50"+
          
          // Adjust for height if needed
          if (measurements.height) {
            const isStreetStyle = outfitItem.description?.toLowerCase().includes('street') ||
                                 outfitItem.description?.toLowerCase().includes('oversized') ||
                                 outfitItem.description?.toLowerCase().includes('relaxed') ||
                                 outfitItem.description?.toLowerCase().includes('loose');
            
            // For shorter people (under 5'8" / 68"), consider sizing down for non-street styles
            if (measurements.height < 68 && !isStreetStyle) {
              if (baseSize === 'M' && measurements.chest >= 40) {
                // Keep M if chest is on larger end
              } else if (baseSize === 'L' && measurements.chest < 44) {
                baseSize = 'M'; // Size down to avoid excessive length
              } else if (baseSize === 'XL' && measurements.chest < 48) {
                baseSize = 'L';
              }
            }
            
            // For average height (5'8" - 5'11" / 68-71"), standard sizing works
            // This is you! At 5'9" (69"), standard sizing is correct
            
            // For taller people (over 6' / 72"), might need to size up for length
            if (measurements.height > 72 && !isStreetStyle) {
              if (baseSize === 'M' && measurements.chest <= 40) {
                // Consider M-Tall or L for better length
              }
            }
          }
          
          return baseSize;
        }
        return 'M';
      
      case 'pants':
      case 'chinos':
      case 'jeans':
      case 'shorts':
        // Use waist and inseam
        if (measurements.waist && measurements.inseam) {
          return `${measurements.waist}x${measurements.inseam}`;
        }
        if (measurements.waist) {
          return `Waist ${measurements.waist}"`;
        }
        return '32x32';
      
      case 'jacket':
      case 'blazer':
      case 'suit':
        // Check if it's a formal jacket (suit/blazer) or casual (bomber, denim, etc.)
        const isFormalJacket = outfitItem.description?.toLowerCase().includes('blazer') ||
                              outfitItem.description?.toLowerCase().includes('suit') ||
                              outfitItem.description?.toLowerCase().includes('sport coat') ||
                              outfitItem.description?.toLowerCase().includes('dress');
        
        if (isFormalJacket) {
          // Formal jackets: Use suit sizing (e.g., "42R")
          if (measurements.chest) {
            const length = measurements.height >= 72 ? 'L' : 'R';
            return `${measurements.chest}${length} (suit size)`;
          }
        }
        
        // Casual jackets: Use S/M/L sizing based on chest AND height
        if (measurements.chest) {
          // Base size on chest measurement
          let baseSize: string;
          if (measurements.chest <= 38) baseSize = 'S';       // Small: 34-38"
          else if (measurements.chest <= 42) baseSize = 'M';  // Medium: 38-42"
          else if (measurements.chest <= 46) baseSize = 'L';  // Large: 42-46"
          else if (measurements.chest <= 50) baseSize = 'XL'; // XL: 46-50"
          else baseSize = 'XXL';                               // XXL: 50"+
          
          // Adjust for height if needed
          if (measurements.height) {
            const isStreetStyle = outfitItem.description?.toLowerCase().includes('street') ||
                                 outfitItem.description?.toLowerCase().includes('oversized') ||
                                 outfitItem.description?.toLowerCase().includes('relaxed') ||
                                 outfitItem.description?.toLowerCase().includes('bomber');
            
            // For shorter people (under 5'8" / 68"), consider sizing down for non-street styles
            if (measurements.height < 68 && !isStreetStyle) {
              if (baseSize === 'L' && measurements.chest < 44) {
                baseSize = 'M'; // Size down to avoid excessive length
              } else if (baseSize === 'XL' && measurements.chest < 48) {
                baseSize = 'L';
              }
            }
          }
          
          return baseSize;
        }
        return 'M';
      
      case 'shoes':
      case 'boots':
      case 'dress shoes':
      case 'sneakers':
        // Shoe size should be in profile
        return 'Size 10';
      
      default:
        // Generic sizing based on chest measurement
        if (measurements.chest) {
          // Standard men's sizing chart (based on retail standards)
          if (measurements.chest <= 38) return 'S';   // Small: 34-38"
          if (measurements.chest <= 42) return 'M';   // Medium: 38-42"
          if (measurements.chest <= 46) return 'L';   // Large: 42-46"
          if (measurements.chest <= 50) return 'XL';  // XL: 46-50"
          return 'XXL';                                // XXL: 50"+
        }
        return 'Standard';
    }
  };

  const handleSelectOption = async (option: ShoppingItem) => {
    try {
      const canOpen = await Linking.canOpenURL(option.affiliateLink);
      if (canOpen) {
        await Linking.openURL(option.affiliateLink);
      } else {
        console.error('[ItemShoppingScreen] Cannot open URL:', option.affiliateLink);
      }
    } catch (error) {
      console.error('[ItemShoppingScreen] Failed to open link:', error);
    }
  };

  const getPriceDisplay = (priceRange: PriceRange): string => {
    switch (priceRange) {
      case PriceRange.BUDGET:
        return '$25-$50';
      case PriceRange.MID:
        return '$50-$100';
      case PriceRange.PREMIUM:
        return '$100-$200';
      default:
        return 'Varies';
    }
  };

  if (isLoading) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color={TailorColors.gold} />
            <Text style={styles.loadingText}>Loading shopping options...</Text>
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
            <Text style={styles.title}>Shop for {outfitItem.garmentType}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemDescriptionCard}>
            <Text style={styles.itemDescription}>{outfitItem.description}</Text>
            {outfitItem.colors && outfitItem.colors.length > 0 && (
              <Text style={styles.itemColors}>
                Colors: {outfitItem.colors.join(', ')}
              </Text>
            )}
            {recommendedSize && (
              <View style={styles.sizeBadge}>
                <Text style={styles.sizeBadgeText}>
                  Recommended Size: {recommendedSize}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Select a Retailer</Text>
          <Text style={styles.sectionSubtitle}>
            Choose from these options to purchase this item
          </Text>

          {shoppingOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id || index}
              style={styles.optionCard}
              onPress={() => handleSelectOption(option)}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <View style={styles.retailerInfo}>
                  <Text style={styles.retailerName}>{option.retailer}</Text>
                  <Text style={styles.priceRange}>
                    {getPriceDisplay(option.priceRange)}
                  </Text>
                </View>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>
                    {option.price > 0 ? `$${option.price}` : 'View Price'}
                  </Text>
                </View>
              </View>

              <View style={styles.optionContent}>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  {option.brand && (
                    <Text style={styles.optionBrand}>{option.brand}</Text>
                  )}
                  {option.searchTerm && (
                    <>
                      <View style={styles.searchTermRow}>
                        <Icon name={AppIcons.search.name} size={14} color={TailorColors.grayMedium} library={AppIcons.search.library} style={{ marginRight: 4 }} />
                        <Text style={styles.searchTerm} numberOfLines={1}>
                          {option.searchTerm}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => handleCopySearchTerm(option.searchTerm || '')}
                        activeOpacity={0.7}
                      >
                        <Icon name={AppIcons.edit.name} size={12} color={TailorColors.gold} library={AppIcons.edit.library} style={{ marginRight: 4 }} />
                        <Text style={styles.copyButtonText}>Share/Copy search term</Text>
                      </TouchableOpacity>
                      <Text style={styles.copyHint}>
                        If the link doesn't work, use the share button to copy this search term
                      </Text>
                    </>
                  )}
                  {recommendedSize && (
                    <Text style={styles.sizeInfo}>
                      Your size: {recommendedSize}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.optionFooter}>
                <GoldButton
                  title="Shop Now"
                  onPress={() => handleSelectOption(option)}
                  style={styles.shopButton}
                />
                <Text style={styles.disclaimer}>
                  We earn a commission on purchases. Prices may vary.
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Show More Retailers Button */}
          {allRetailers.length > 3 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={handleShowMoreRetailers}
              activeOpacity={0.7}
            >
              <Icon
                name={AppIcons.sparkles.name}
                size={18}
                color={TailorColors.gold}
                library={AppIcons.sparkles.library}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.showMoreButtonText}>
                Show More Retailers ({allRetailers.length - 3} more available)
              </Text>
            </TouchableOpacity>
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
  itemDescriptionCard: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginBottom: TailorSpacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: TailorColors.gold,
    ...TailorShadows.small,
  },
  itemDescription: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
    fontWeight: '600',
  },
  itemColors: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginTop: TailorSpacing.xs,
  },
  sizeBadge: {
    backgroundColor: TailorColors.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: TailorSpacing.sm,
    paddingVertical: TailorSpacing.xs / 2,
    borderRadius: TailorBorderRadius.sm,
    marginTop: TailorSpacing.sm,
  },
  sizeBadgeText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onGold,
    fontWeight: '700',
    fontSize: 11,
  },
  sectionTitle: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
  },
  sectionSubtitle: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.lg,
  },
  optionCard: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginBottom: TailorSpacing.md,
    borderWidth: 2,
    borderColor: TailorColors.woodLight,
    ...TailorShadows.medium,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: TailorSpacing.md,
  },
  retailerInfo: {
    flex: 1,
  },
  retailerName: {
    ...TailorTypography.h3,
    color: TailorColors.gold,
    fontWeight: '700',
    marginBottom: TailorSpacing.xs / 2,
  },
  priceRange: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 12,
  },
  priceBadge: {
    backgroundColor: TailorColors.gold,
    paddingHorizontal: TailorSpacing.sm,
    paddingVertical: TailorSpacing.xs / 2,
    borderRadius: TailorBorderRadius.sm,
  },
  priceBadgeText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onGold,
    fontWeight: '700',
    fontSize: 12,
  },
  optionContent: {
    marginBottom: TailorSpacing.md,
  },
  optionText: {
    marginBottom: TailorSpacing.sm,
  },
  optionName: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
    marginBottom: TailorSpacing.xs,
  },
  optionBrand: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.xs,
  },
  searchTermRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: TailorSpacing.xs,
  },
  searchTerm: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 11,
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: TailorSpacing.xs,
    paddingVertical: TailorSpacing.xs / 2,
  },
  copyButtonText: {
    ...TailorTypography.caption,
    color: TailorColors.gold,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  copyHint: {
    ...TailorTypography.caption,
    color: TailorColors.grayMedium,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: TailorSpacing.xs / 2,
  },
  sizeInfo: {
    ...TailorTypography.caption,
    color: TailorColors.gold,
    fontWeight: '600',
    marginTop: TailorSpacing.xs,
  },
  optionFooter: {
    marginTop: TailorSpacing.sm,
  },
  shopButton: {
    marginBottom: TailorSpacing.xs,
  },
  disclaimer: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: TailorSpacing.xs,
  },
  showMoreButton: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginTop: TailorSpacing.md,
    marginBottom: TailorSpacing.xl,
    borderWidth: 2,
    borderColor: TailorColors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...TailorShadows.medium,
  },
  showMoreButtonText: {
    ...TailorTypography.button,
    color: TailorColors.gold,
    fontWeight: '700',
  },
});

