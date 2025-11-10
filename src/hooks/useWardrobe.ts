import { useState, useEffect, useCallback, useMemo } from 'react';
import { ClosetService } from '../services/closet';
import { ClosetItem, GarmentType } from '../types';
import { GarmentCategory, isGarmentInCategory } from '../utils/garmentCategories';

/**
 * Custom hook for wardrobe management
 * Provides wardrobe items, filtering, and search functionality
 */
export const useWardrobe = () => {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | 'all'>('all');

  // Load wardrobe items
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const closetItems = await ClosetService.getClosetItems();
      setItems(closetItems);
    } catch (error) {
      console.error('[useWardrobe] Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Expose loadItems for manual refresh (used with useFocusEffect)
  const refresh = useCallback(() => {
    return loadItems();
  }, [loadItems]);

  // Filter items by category and search query
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by master category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) =>
        isGarmentInCategory(item.garmentType, selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.color.toLowerCase().includes(query) ||
          item.secondaryColor?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query) ||
          item.garmentType.toLowerCase().includes(query) ||
          item.material?.toLowerCase().includes(query) ||
          item.pattern?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [items, searchQuery, selectedCategory]);

  // Get items by category
  const getItemsByCategory = useCallback(
    (category: GarmentCategory) => {
      return items.filter((item) => isGarmentInCategory(item.garmentType, category));
    },
    [items]
  );

  // Get items by garment type
  const getItemsByType = useCallback(
    (type: GarmentType) => {
      return items.filter((item) => item.garmentType === type);
    },
    [items]
  );

  // Get items by color
  const getItemsByColor = useCallback(
    (color: string) => {
      const lowerColor = color.toLowerCase();
      return items.filter(
        (item) =>
          item.color.toLowerCase().includes(lowerColor) ||
          item.secondaryColor?.toLowerCase().includes(lowerColor)
      );
    },
    [items]
  );

  // Refresh items
  const refresh = useCallback(() => {
    return loadItems();
  }, [loadItems]);

  return {
    items,
    filteredItems,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loadItems,
    refresh,
    getItemsByCategory,
    getItemsByType,
    getItemsByColor,
  };
};

/**
 * Hook for wardrobe filtering only
 */
export const useWardrobeFilter = (items: ClosetItem[]) => {
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | 'all'>('all');

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return items;
    }
    return items.filter((item) => isGarmentInCategory(item.garmentType, selectedCategory));
  }, [items, selectedCategory]);

  return {
    filteredItems,
    selectedCategory,
    setSelectedCategory,
  };
};

/**
 * Hook for wardrobe search only
 */
export const useWardrobeSearch = (items: ClosetItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.color.toLowerCase().includes(query) ||
        item.secondaryColor?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query) ||
        item.garmentType.toLowerCase().includes(query) ||
        item.material?.toLowerCase().includes(query) ||
        item.pattern?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
  };
};

