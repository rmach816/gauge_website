import { useMemo } from 'react';
import { OutfitItem, PriceRange } from '../types';

/**
 * Calculate total price range for an outfit
 */
export const useOutfitPrice = (items: OutfitItem[]): string => {
  return useMemo(() => {
    const priceRanges = items
      .filter((item) => !item.existingItem && item.priceRange)
      .map((item) => item.priceRange!);

    if (priceRanges.length === 0) {
      return 'Free (using your wardrobe)';
    }

    const minPrices: number[] = [];
    const maxPrices: number[] = [];

    priceRanges.forEach((range) => {
      switch (range) {
        case PriceRange.BUDGET:
          minPrices.push(25);
          maxPrices.push(50);
          break;
        case PriceRange.MID:
          minPrices.push(50);
          maxPrices.push(100);
          break;
        case PriceRange.PREMIUM:
          minPrices.push(100);
          maxPrices.push(200);
          break;
      }
    });

    const totalMin = minPrices.reduce((sum, price) => sum + price, 0);
    const totalMax = maxPrices.reduce((sum, price) => sum + price, 0);

    return `$${totalMin}-$${totalMax}`;
  }, [items]);
};

/**
 * Check if outfit has missing items (items that need to be purchased)
 */
export const useOutfitMissingItems = (items: OutfitItem[]): OutfitItem[] => {
  return useMemo(() => {
    return items.filter((item) => !item.existingItem);
  }, [items]);
};

/**
 * Get wardrobe items from outfit
 */
export const useOutfitWardrobeItems = (items: OutfitItem[]): OutfitItem[] => {
  return useMemo(() => {
    return items.filter((item) => !!item.existingItem);
  }, [items]);
};

