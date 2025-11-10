import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ShoppingItem, PriceRange } from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import { formatPrice } from '../utils/formatting';
import { Icon, AppIcons } from './Icon';

interface ShoppingCardProps {
  item: ShoppingItem;
}

/**
 * ShoppingCard Component
 * Displays shopping item with price range badge (IMPORTANT FIX #5)
 * Shows expected price range and disclaimer
 */
export const ShoppingCard: React.FC<ShoppingCardProps> = ({ item }) => {
  const handlePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(item.affiliateLink);
      if (canOpen) {
        await Linking.openURL(item.affiliateLink);
      }
    } catch (error) {
      console.error('[ShoppingCard] Failed to open link:', error);
    }
  };

  // Get price range display (IMPORTANT FIX #5)
  const getPriceRangeDisplay = (range: PriceRange): string => {
    switch (range) {
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.retailer}>{item.retailer}</Text>
          {/* Price Range Badge (IMPORTANT FIX #5) */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>
              {getPriceRangeDisplay(item.priceRange)}
            </Text>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.brand}>{item.brand}</Text>

        {/* Search Term Reference (if available) */}
        {item.searchTerm && (
          <View style={styles.searchTermRow}>
            <Icon name={AppIcons.search.name} size={16} color={TailorColors.grayMedium} library={AppIcons.search.library} style={styles.searchIcon} />
            <Text style={styles.searchTerm} numberOfLines={1}>
              {item.searchTerm}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {item.price > 0 ? (
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
            ) : (
              <Text style={styles.pricePlaceholder}>View Price</Text>
            )}
            {/* Price Range Badge (alternative location if no specific price) */}
            {item.price === 0 && (
              <Text style={styles.priceRangeText}>
                {getPriceRangeDisplay(item.priceRange)}
              </Text>
            )}
          </View>
          <Text style={styles.arrow}>→</Text>
        </View>

        {/* Disclaimer (IMPORTANT FIX #5) */}
        <Text style={styles.disclaimer}>
          Prices may vary. We earn a small commission on purchases.
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginBottom: TailorSpacing.sm,
    borderWidth: 2,
    borderColor: TailorColors.gold,
    ...TailorShadows.medium,
  },
  content: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TailorSpacing.xs,
  },
  retailer: {
    ...TailorTypography.label,
    color: TailorColors.gold,
    fontWeight: '600',
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
    fontSize: 11,
    fontWeight: '700',
  },
  name: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
    marginBottom: TailorSpacing.xs,
  },
  brand: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.xs,
  },
  searchTermRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TailorSpacing.sm,
    padding: TailorSpacing.xs,
    backgroundColor: TailorColors.woodDark,
    borderRadius: TailorBorderRadius.sm,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: TailorSpacing.xs,
  },
  searchTerm: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 11,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TailorSpacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TailorSpacing.xs,
  },
  price: {
    ...TailorTypography.button,
    color: TailorContrasts.onWoodMedium,
    fontSize: 16,
    fontWeight: '700',
  },
  pricePlaceholder: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    fontSize: 14,
  },
  priceRangeText: {
    ...TailorTypography.caption,
    color: TailorColors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    ...TailorTypography.h2,
    color: TailorColors.gold,
    fontSize: 20,
  },
  disclaimer: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: TailorSpacing.xs,
  },
});
